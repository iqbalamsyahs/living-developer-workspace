import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const raw = readFileSync(new URL("./content.ndjson", import.meta.url), "utf8");
const docs = raw.trim().split("\n").map((l) => JSON.parse(l));
const ofType = (t) => docs.filter((d) => d._type === t);

const CATEGORIES = ["framework", "language", "tool", "cloud", "database"];
const PUBLIC_URLS = ["https://vyneapple.com/", "https://apps.vyneapple.com/", "https://mindtrexacademy.com/"];

test("document counts", () => {
  assert.equal(ofType("profile").length, 1);
  assert.equal(ofType("experience").length, 1);
  assert.equal(ofType("project").length, 6);
});

test("images use the importer's _sanityAsset shape, not a nested asset", () => {
  for (const p of ofType("project")) {
    assert.match(p.coverImage._sanityAsset, /^image@https:\/\//, p.title);
    assert.equal(p.coverImage.asset, undefined, p.title);
  }
  assert.match(ofType("profile")[0].photo._sanityAsset, /^image@https:\/\//);
});

test("profile is the pinned singleton", () => {
  assert.equal(ofType("profile")[0]._id, "profile");
});

test("project slugs are unique", () => {
  const slugs = ofType("project").map((p) => p.slug.current);
  assert.equal(new Set(slugs).size, 6);
});

test("every stack item has a known category and there are 20", () => {
  const stack = ofType("profile")[0].stack;
  assert.equal(stack.length, 20);
  for (const s of stack) assert.ok(CATEGORIES.includes(s.category), `${s.name}: ${s.category}`);
});

test("profile has 8 FAQ items, 4 services and availability", () => {
  const p = ofType("profile")[0];
  assert.equal(p.faq.length, 8);
  assert.equal(p.services.length, 4);
  assert.deepEqual(p.availability, { isAvailable: true, statusText: "Available for work", timezone: "Asia/Jakarta" });
});

test("stale or unwanted copy is not imported", () => {
  for (const banned of ["cal.com", "Followers", "Happy Clients", "IT Consultant"]) {
    assert.ok(!raw.includes(banned), `contains ${banned}`);
  }
});

test("project links only use the three public URLs", () => {
  for (const p of ofType("project")) for (const l of p.links ?? []) assert.ok(PUBLIC_URLS.includes(l.href), l.href);
});

test("dates are ISO yyyy-mm-dd", () => {
  for (const e of ofType("experience")) assert.match(e.startDate, /^\d{4}-\d{2}-\d{2}$/);
});

test("profile references the experience document", () => {
  const exp = ofType("experience")[0];
  assert.deepEqual(ofType("profile")[0].experiences.map((r) => r._ref), [exp._id]);
});
