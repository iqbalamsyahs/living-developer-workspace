import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { NodeIO, getBounds } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import { GROUP_NAMES } from "./groups.mjs";
import { TARGETS } from "./optimize.mjs";

const outDir = fileURLToPath(new URL("../../public/glb/v2/", import.meta.url));
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });

await MeshoptDecoder.ready;

const loaded = {};
for (const g of GROUP_NAMES) {
  const path = `${outDir}${g}.glb`;
  if (!existsSync(path)) continue;
  const doc = await io.read(path);
  // Count per node: dedup() may share one mesh between many nodes (e.g. 8 identical fan blades).
  const faces = doc
    .getRoot()
    .listNodes()
    .flatMap((n) => n.getMesh()?.listPrimitives() ?? [])
    .reduce((s, p) => s + Math.floor((p.getIndices()?.getCount() ?? p.getAttribute("POSITION").getCount()) / 3), 0);
  loaded[g] = { doc, faces, bytes: statSync(path).size };
}

test("all six optimized files exist", () => {
  assert.deepEqual(Object.keys(loaded).sort(), [...GROUP_NAMES].sort());
});

for (const g of GROUP_NAMES) {
  test(`${g} is within its face budget`, () => {
    assert.ok(loaded[g], `${g}.glb missing`);
    assert.ok(loaded[g].faces <= TARGETS[g], `${g}: ${loaded[g].faces} > ${TARGETS[g]}`);
  });
}

for (const g of GROUP_NAMES) {
  test(`${g} is not over-collapsed (keeps at least 70% of its budget)`, () => {
    assert.ok(loaded[g], `${g}.glb missing`);
    assert.ok(loaded[g].faces >= TARGETS[g] * 0.7, `${g}: ${loaded[g].faces} < ${TARGETS[g] * 0.7}`);
  });
}

test("desk set totals stay within budget", () => {
  const all = Object.values(loaded);
  assert.equal(all.length, GROUP_NAMES.length);
  assert.ok(all.reduce((s, o) => s + o.faces, 0) <= 25_000);
  assert.ok(all.reduce((s, o) => s + o.bytes, 0) <= 3_000_000);
});

test("no animations and no floor-sized geometry", () => {
  for (const [g, { doc }] of Object.entries(loaded)) {
    assert.equal(doc.getRoot().listAnimations().length, 0, `${g} has animations`);
    const { min, max } = getBounds(doc.getRoot().listScenes()[0]);
    for (let i = 0; i < 3; i++) assert.ok(max[i] - min[i] < 20, `${g} axis ${i} too wide`);
  }
});
