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
  assert.equal(resumeHref({ resumeFileUrl: "" }), undefined);
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

test("hasImageAsset is false for an image with alt text but no asset", async () => {
  const { hasImageAsset } = await import("./portfolio.ts");
  assert.equal(hasImageAsset({ _type: "image", alt: "x" } as never), false);
  assert.equal(hasImageAsset(undefined), false);
  assert.equal(hasImageAsset({ _type: "image", asset: { _ref: "image-abc-1x1-png" } }), true);
});

test("hero tagline: siteConfig override beats the profile field, which beats the default", () => {
  const profile = { _id: "profile", heroTagline: "Top level" };
  assert.equal(buildPortfolio({ profile }).siteConfig.heroTagline, "Top level");
  assert.equal(
    buildPortfolio({ profile: { ...profile, siteConfig: { heroTagline: "Override" } } }).siteConfig.heroTagline,
    "Override",
  );
  assert.equal(buildPortfolio({}).siteConfig.heroTagline, defaultSiteConfig.heroTagline);
});
