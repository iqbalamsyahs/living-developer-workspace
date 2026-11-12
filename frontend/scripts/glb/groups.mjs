export const GROUP_NAMES = ["desk", "monitor", "keyboard", "mouse", "pc", "speakers"];

const inList = (...materials) => (n) => materials.includes(n.material);

// Ordered, first match wins. Initial guesses from bounding boxes (source units,
// desk top at y 9.54); corrected after the visual check of groups-debug.glb.
const RULES = [
  { group: "drop", test: inList("wood_floor_worn") },
  // Tower sits on the desk top (y >= 9.5); the desk's right leg frame is also at x > 5.4 but below it.
  { group: "pc", test: (n) => n.centroid[0] > 5.4 && n.centroid[1] > 9.5 },
  { group: "mouse", test: inList("Material.007", "mouseee.001") },
  { group: "keyboard", test: inList("Material.018", "Material.020", "mouseee.002") },
  {
    group: "monitor",
    test: inList("Material.008", "Material.010", "Material.011", "Material.012", "Material.013"),
  },
  {
    group: "speakers",
    test: inList("Material.014", "Material.015", "Material.016", "Material.017"),
  },
];

export function assignGroup(node) {
  return RULES.find((r) => r.test(node))?.group ?? "desk";
}
