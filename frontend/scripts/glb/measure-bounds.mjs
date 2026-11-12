// Usage: node scripts/glb/measure-bounds.mjs <file.glb>
// Prints the world bounding box of the whole file and of every mesh node (source units).
import { NodeIO, getBounds } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const doc = await io.read(process.argv[2]);
const fmt = (v) => v.map((x) => +x.toFixed(4));
const describe = (b) => ({ min: fmt(b.min), max: fmt(b.max), size: fmt(b.max.map((m, i) => m - b.min[i])) });
console.log("scene", JSON.stringify(describe(getBounds(doc.getRoot().listScenes()[0]))));
for (const node of doc.getRoot().listNodes()) {
  if (node.getMesh()) console.log(node.getName() || "(unnamed)", JSON.stringify(describe(getBounds(node))));
}
