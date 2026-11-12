import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { MODEL_LAYOUT, SCREENS, ZOOM_VIEWS } from "./layout.ts";

const publicDir = new URL("../../public", import.meta.url);

test("every model url exists under public/", () => {
  for (const m of MODEL_LAYOUT) {
    assert.ok(existsSync(new URL(`.${m.url}`, `${publicDir.href}/`)), `${m.key}: ${m.url} missing`);
  }
});

test("clickable ids are unique", () => {
  const ids = MODEL_LAYOUT.flatMap((m) => (m.id ? [m.id] : []));
  assert.equal(new Set(ids).size, ids.length);
});

test("every zoom view has a screen rectangle", () => {
  for (const key of Object.keys(ZOOM_VIEWS)) assert.ok(SCREENS[key], `SCREENS.${key} missing`);
});
