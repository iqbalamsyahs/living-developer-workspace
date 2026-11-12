import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPortfolio, type PortfolioPayload } from "./portfolio.ts";
import { buildStops, nearestStopIndex, scrollTopFor, snapTarget, stopIndexForContent } from "./journey.ts";

const full: PortfolioPayload = {
  profile: {
    _id: "profile",
    stack: [{ name: "React", category: "framework" }],
    services: [{ name: "Web", description: "d" }],
    experiences: [{ position: "Dev", company: "Co", startDate: "2021-01-01", description: [] }],
  },
  projects: [{ _id: "p1", title: "P", slug: "p1" }],
  journalEntries: [{ _id: "j1", title: "J", slug: "jrn-1" }],
};

const ids = (p: PortfolioPayload) => buildStops(buildPortfolio(p)).map((s) => s.id);

test("full data yields all seven stops in story order", () => {
  assert.deepEqual(ids(full), ["intro", "about", "stack", "experience", "showcase", "journal", "contact"]);
});

test("empty data keeps only intro, about and contact", () => {
  assert.deepEqual(ids({}), ["intro", "about", "contact"]);
});

test("only projects present adds only the showcase stop", () => {
  assert.deepEqual(ids({ projects: full.projects }), ["intro", "about", "showcase", "contact"]);
});

test("stops carry the camera zoom target for their screen", () => {
  const byId = Object.fromEntries(buildStops(buildPortfolio(full)).map((s) => [s.id, s.zoomTarget]));
  assert.deepEqual(byId, {
    intro: null,
    about: "about",
    stack: "stack",
    experience: null,
    showcase: "pc",
    journal: null,
    contact: "contact",
  });
});

test("nearestStopIndex rounds and clamps", () => {
  assert.equal(nearestStopIndex(0, 900, 5), 0);
  assert.equal(nearestStopIndex(449, 900, 5), 0);
  assert.equal(nearestStopIndex(451, 900, 5), 1);
  assert.equal(nearestStopIndex(99999, 900, 5), 4);
  assert.equal(nearestStopIndex(-50, 900, 5), 0);
  assert.equal(nearestStopIndex(0, 900, 0), 0);
});

test("scrollTopFor is one viewport per stop", () => {
  assert.equal(scrollTopFor(3, 800), 2400);
});

test("snapTarget is null when aligned and the nearest stop otherwise", () => {
  assert.equal(snapTarget(901, 900, 5), null);
  assert.equal(snapTarget(1100, 900, 5), 900);
  assert.equal(snapTarget(0, 900, 5), null);
});

test("stopIndexForContent maps objects to stops and unknown ids to -1", () => {
  const stops = buildStops(buildPortfolio(full));
  const at = (id: string) => stopIndexForContent(stops, id, ["jrn-1"]);
  assert.equal(at("showcase"), 4);
  assert.equal(at("about"), 1);
  assert.equal(at("stack"), 2);
  assert.equal(at("contact"), 6);
  assert.equal(at("jrn-1"), 5);
  assert.equal(at("resume"), -1);
  const bare = buildStops(buildPortfolio({}));
  assert.equal(stopIndexForContent(bare, "jrn-1", ["jrn-1"]), -1);
  assert.equal(stopIndexForContent(bare, "showcase", []), -1);
});
