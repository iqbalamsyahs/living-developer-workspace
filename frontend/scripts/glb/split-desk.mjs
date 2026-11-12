// Usage: node scripts/glb/split-desk.mjs <src.glb> <outDir> [--debug]
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { NodeIO, getBounds } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { prune } from "@gltf-transform/functions";
import { GROUP_NAMES, assignGroup } from "./groups.mjs";

const DEBUG_COLORS = {
  desk: [0.55, 0.35, 0.2, 1],
  monitor: [0.2, 0.45, 1, 1],
  keyboard: [0.2, 0.85, 0.35, 1],
  mouse: [1, 0.2, 0.2, 1],
  pc: [1, 0.6, 0.1, 1],
  speakers: [0.7, 0.3, 0.9, 1],
};

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

function classify(doc) {
  const out = [];
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const { min, max } = getBounds(node);
    const centroid = [0, 1, 2].map((i) => (min[i] + max[i]) / 2);
    const material = mesh.listPrimitives()[0]?.getMaterial()?.getName() ?? "";
    out.push({ node, mesh, group: assignGroup({ name: node.getName(), material, centroid }) });
  }
  return out;
}

export function triangles(doc) {
  let n = 0;
  for (const node of doc.getRoot().listNodes()) {
    for (const p of node.getMesh()?.listPrimitives() ?? []) {
      n += Math.floor((p.getIndices()?.getCount() ?? p.getAttribute("POSITION").getCount()) / 3);
    }
  }
  return n;
}

async function main() {
  const [src, outDir, ...flags] = process.argv.slice(2);
  if (!src || !outDir) throw new Error("usage: split-desk.mjs <src.glb> <outDir> [--debug]");
  mkdirSync(outDir, { recursive: true });

  for (const group of GROUP_NAMES) {
    const doc = await io.read(src);
    for (const item of classify(doc)) if (item.group !== group) item.node.dispose();
    for (const a of doc.getRoot().listAnimations()) a.dispose();
    await doc.transform(prune());
    await io.write(join(outDir, `${group}.glb`), doc);
    console.log(`${group}: ${triangles(doc)} tris`);
  }

  if (flags.includes("--debug")) {
    const doc = await io.read(src);
    const mats = Object.fromEntries(
      Object.entries(DEBUG_COLORS).map(([g, c]) => [g, doc.createMaterial(g).setBaseColorFactor(c)]),
    );
    for (const { node, mesh, group } of classify(doc)) {
      if (group === "drop") node.dispose();
      else for (const p of mesh.listPrimitives()) p.setMaterial(mats[group]);
    }
    for (const a of doc.getRoot().listAnimations()) a.dispose();
    await doc.transform(prune());
    await io.write(join(outDir, "groups-debug.glb"), doc);
    console.log("wrote groups-debug.glb");
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) await main();
