import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPortfolio } from "./portfolio.ts";
import { activeRoomIds, clampTarget, fromSketch, OBJECTS, ORBIT_LIMITS, OVERVIEW, ROOM_ORDER } from "./room.ts";

test("fromSketch maps sketch (x,y floor; z up) to a centered three.js box", () => {
  const b = fromSketch(0, 0, -0.2, 6, 6, 0.2, "#6b4a3a");
  assert.deepEqual([b.position, b.size, b.color, !!b.glow], [[3, -0.1, 3], [6, 0.2, 6], "#6b4a3a", false]);
});

test("empty CMS: nothing is clickable", () => {
  assert.deepEqual(activeRoomIds(buildPortfolio({})), []);
});

test("each object turns on only with its own content, in nav order", () => {
  const p = buildPortfolio({
    profile: {
      _id: "profile",
      bio: [{ _type: "block", children: [{ _type: "span", text: "hi" }] }] as never,
      stack: [{ name: "React", category: "framework" }],
      experiences: [{ position: "Dev", company: "X", startDate: "2020-01", description: [] }],
      contact: { email: "a@b.co" },
    },
    projects: [{ _id: "p1" }],
    journalEntries: [{ _id: "j1" }],
  });
  assert.deepEqual(activeRoomIds(p), ROOM_ORDER);
  assert.deepEqual(activeRoomIds(buildPortfolio({ profile: { _id: "profile", services: [{ name: "a", description: "b" }] } })), ["stack"]);
  assert.deepEqual(activeRoomIds(buildPortfolio({ profile: { _id: "profile", philosophy: "x" } })), ["about"]);
  assert.deepEqual(activeRoomIds(buildPortfolio({ profile: { _id: "profile", contact: { email: "" } } })), []);
});

test("clampTarget keeps the orbit target inside the room", () => {
  assert.deepEqual(clampTarget([-5, -5, 99]), [1, 0.5, 5]);
  assert.deepEqual(clampTarget([3, 1.5, 3]), [3, 1.5, 3]);
});

test("every pose looks from the open side and overview obeys the orbit limits", () => {
  for (const pose of [OVERVIEW, ...Object.values(OBJECTS).map((o) => o.camera)]) {
    assert.ok(pose.position[0] > pose.target[0] && pose.position[2] > pose.target[2], "camera on +x/+z side");
    assert.ok(pose.position[1] > 0, "camera above floor");
  }
  const [dx, dy, dz] = OVERVIEW.position.map((v, i) => v - OVERVIEW.target[i]);
  const dist = Math.hypot(dx, dy, dz);
  const azimuth = Math.atan2(dx, dz);
  const polar = Math.acos(dy / dist);
  assert.ok(dist >= ORBIT_LIMITS.minDistance && dist <= ORBIT_LIMITS.maxDistance);
  assert.ok(azimuth >= ORBIT_LIMITS.minAzimuth && azimuth <= ORBIT_LIMITS.maxAzimuth);
  assert.ok(polar >= ORBIT_LIMITS.minPolar && polar <= ORBIT_LIMITS.maxPolar);
});
