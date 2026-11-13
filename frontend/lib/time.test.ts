import { test } from "node:test";
import assert from "node:assert/strict";
import { formatLocalTime } from "./time.ts";

const instant = new Date("2026-01-01T00:00:00Z");

test("formats Jakarta time as zero-padded 24h", () => {
  assert.equal(formatLocalTime(instant, "Asia/Jakarta"), "07:00:00");
});

test("uses the previous day's evening for New York", () => {
  assert.equal(formatLocalTime(instant, "America/New_York"), "19:00:00");
});

test("midnight renders as 00, not 24", () => {
  assert.equal(formatLocalTime(new Date("2026-01-01T17:00:00Z"), "Asia/Jakarta"), "00:00:00");
});

test("tryFormatLocalTime returns null for an invalid time zone instead of throwing", async () => {
  const { tryFormatLocalTime } = await import("./time.ts");
  assert.equal(tryFormatLocalTime(instant, "WIB"), null);
  assert.equal(tryFormatLocalTime(instant, " "), null);
  assert.equal(tryFormatLocalTime(instant, "Asia/Jakarta"), "07:00:00");
});
