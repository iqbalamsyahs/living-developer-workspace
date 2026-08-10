import { createClient } from "@sanity/client";

export const projectId = process.env.SANITY_PROJECT_ID ?? "kioy6hgr";
export const dataset = process.env.SANITY_DATASET ?? "production";

export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-10",
  // Build-time SSG correctness: bypass the CDN so the ISR fetch is fresh.
  useCdn: false,
  // Optional while the dataset is public; required once it goes private.
  token: process.env.SANITY_API_READ_TOKEN,
});
