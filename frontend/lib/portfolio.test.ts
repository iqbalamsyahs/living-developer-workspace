import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPortfolio, categoryLabel, defaultSiteConfig, hireMeHref, resumeHref } from "./portfolio.ts";

test("hireMeHref prefers a valid booking URL", () => {
  assert.equal(hireMeHref({ email: "a@b.co", bookingUrl: "https://cal.com/x" }), "https://cal.com/x");
});

test("hireMeHref falls back to mailto without a booking URL", () => {
  assert.equal(hireMeHref({ email: "a@b.co" }), "mailto:a@b.co");
});

test("hireMeHref rejects non-http(s) booking URLs", () => {
  assert.equal(hireMeHref({ email: "a@b.co", bookingUrl: "javascript:alert(1)" }), "mailto:a@b.co");
});

test("hireMeHref is undefined with no contact route", () => {
  assert.equal(hireMeHref({ email: "", bookingUrl: undefined }), undefined);
  assert.equal(hireMeHref(undefined), undefined);
});

test("resumeHref returns the uploaded file URL when present", () => {
  assert.equal(resumeHref({}), undefined);
  assert.equal(resumeHref({ resumeFileUrl: "https://cdn.sanity.io/cv.pdf" }), "https://cdn.sanity.io/cv.pdf");
});

test("categoryLabel knows database and falls back to tool", () => {
  assert.equal(categoryLabel(defaultSiteConfig.categoryLabels, "database"), "Databases");
  assert.equal(categoryLabel(defaultSiteConfig.categoryLabels, "banana"), defaultSiteConfig.categoryLabels.tool);
});

test("buildPortfolio tolerates an empty payload", () => {
  const p = buildPortfolio({});
  assert.equal(p.profile.faq, undefined);
  assert.equal(p.items.stack.stack, undefined);
});
