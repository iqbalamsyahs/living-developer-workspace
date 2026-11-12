// Usage: node scripts/glb/measure-screen.mjs <monitor.glb>
// Prints the world bounding box of the screen quad (material Material.013) in source units.
import { NodeIO, getBounds } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const doc = await io.read(process.argv[2]);
const fmt = (v) => v.map((x) => +x.toFixed(4));
for (const node of doc.getRoot().listNodes()) {
  const mat = node.getMesh()?.listPrimitives()[0]?.getMaterial()?.getName();
  if (mat !== "Material.013") continue;
  const { min, max } = getBounds(node);
  const size = max.map((m, i) => m - min[i]);
  console.log(JSON.stringify({ min: fmt(min), max: fmt(max), size: fmt(size), center: fmt(min.map((m, i) => (m + max[i]) / 2)) }));
}
