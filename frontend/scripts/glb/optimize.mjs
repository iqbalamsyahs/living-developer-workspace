// Usage: node scripts/glb/optimize.mjs <splitDir> <outDir>
import { mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { compactPrimitive, dedup, dequantize, meshopt, prune, textureCompress, weld } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import { GROUP_NAMES } from "./groups.mjs";

/** Max faces per object (whole scene budget ~40k; desk set share 15-25k). */
export const TARGETS = { desk: 7000, monitor: 1500, keyboard: 6000, mouse: 2500, pc: 4000, speakers: 2000 };
const MAX_TEXTURE = { monitor: 2048 };
const DEFAULT_TEXTURE = 1024;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder, "meshopt.encoder": MeshoptEncoder });

// Rendered faces: count per node, because dedup() can share one mesh across many nodes.
function faces(doc) {
  return doc
    .getRoot()
    .listNodes()
    .flatMap((n) => n.getMesh()?.listPrimitives() ?? [])
    .reduce((s, p) => s + Math.floor((p.getIndices()?.getCount() ?? p.getAttribute("POSITION").getCount()) / 3), 0);
}

// gltf-transform's simplify() cannot pass flags. Without Permissive, the hundreds of
// separate keycaps/fan blades (hard-normal seams) plateau far above the target; call
// meshoptimizer directly.
function simplifyPrimitives(doc, ratio, error) {
  for (const prim of doc.getRoot().listMeshes().flatMap((m) => m.listPrimitives())) {
    const idx = prim.getIndices();
    if (!idx) continue;
    const indices = new Uint32Array(idx.getArray());
    const target = Math.max(12, Math.floor((indices.length / 3) * ratio) * 3);
    const [out] = MeshoptSimplifier.simplify(indices, prim.getAttribute("POSITION").getArray(), 3, target, error, ["Permissive"]);
    idx.setArray(out);
    compactPrimitive(prim);
  }
}

export async function optimizeFile(input, output, { maxFaces, maxTexture }) {
  await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);

  let doc = await io.read(input);
  await doc.transform(dequantize(), weld());
  const start = faces(doc);

  if (start > maxFaces) {
    // With Permissive, face count is neither smooth nor monotonic in ratio or error (it has cliffs),
    // so scan a small grid and keep the largest result that still fits the budget.
    let best = null;
    let bestFaces = 0;
    scan: for (const k of [1, 0.9, 0.8, 0.65, 0.5]) {
      for (const error of [0.01, 0.02, 0.05, 0.1, 0.2]) {
        const attempt = await io.read(input);
        await attempt.transform(dequantize(), weld());
        simplifyPrimitives(attempt, (maxFaces / start) * k, error);
        const got = faces(attempt);
        if (got <= maxFaces && got > bestFaces) {
          best = attempt;
          bestFaces = got;
          if (got >= maxFaces * 0.9) break scan;
        }
      }
    }
    if (best) doc = best;
  }

  await doc.transform(
    dedup(),
    prune(),
    textureCompress({ encoder: sharp, targetFormat: "webp", resize: [maxTexture, maxTexture] }),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  await io.write(output, doc);
  return { faces: faces(doc), bytes: statSync(output).size };
}

async function main() {
  const [splitDir, outDir] = process.argv.slice(2);
  if (!splitDir || !outDir) throw new Error("usage: optimize.mjs <splitDir> <outDir>");
  mkdirSync(outDir, { recursive: true });
  for (const g of GROUP_NAMES) {
    const r = await optimizeFile(join(splitDir, `${g}.glb`), join(outDir, `${g}.glb`), {
      maxFaces: TARGETS[g],
      maxTexture: MAX_TEXTURE[g] ?? DEFAULT_TEXTURE,
    });
    console.log(`${g}: ${r.faces} faces (<= ${TARGETS[g]}), ${(r.bytes / 1024).toFixed(0)} KB`);
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) await main();
