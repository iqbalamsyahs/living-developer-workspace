import { test } from "node:test";
import assert from "node:assert/strict";
import { CREDITS, formatAttribution } from "./credits.ts";

test("every credit is complete and links over https", () => {
  assert.ok(CREDITS.length >= 2);
  for (const c of CREDITS) {
    for (const k of ["title", "author", "license"] as const) assert.ok(c[k].trim(), `${c.title}: ${k} empty`);
    for (const k of ["sourceUrl", "authorUrl", "licenseUrl"] as const) assert.match(c[k], /^https:\/\//, `${c.title}: ${k}`);
  }
});

test("formatAttribution names title, author and license", () => {
  const c = CREDITS[0];
  const text = formatAttribution(c);
  for (const part of [c.title, c.author, c.license]) assert.ok(text.includes(part));
});

test("credits link to the model page, not just the author profile", () => {
  for (const c of CREDITS) assert.match(c.sourceUrl, /\/3d-models\//, c.title);
});
