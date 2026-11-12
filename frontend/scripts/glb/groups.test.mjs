import { test } from "node:test";
import assert from "node:assert/strict";
import { assignGroup } from "./groups.mjs";

const node = (material, centroid = [0, 10, 0]) => ({ name: "n", material, centroid });

test("floor material is dropped", () => {
  assert.equal(assignGroup(node("wood_floor_worn", [0, 0, 0])), "drop");
});

test("monitor screen material goes to monitor", () => {
  assert.equal(assignGroup(node("Material.013")), "monitor");
});

test("anything right of x=5.4 is the pc tower", () => {
  assert.equal(assignGroup(node("Material.003", [6.6, 11, 1])), "pc");
});

test("right-hand desk leg below the desk top stays desk, not pc", () => {
  assert.equal(assignGroup(node("Material", [7.5, 4.7, 0])), "desk");
});

test("desk fabric falls through to desk", () => {
  assert.equal(assignGroup(node("jersey_melange")), "desk");
});

test("mouse material goes to mouse", () => {
  assert.equal(assignGroup(node("Material.007")), "mouse");
});
