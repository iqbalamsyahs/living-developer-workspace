import { cache } from "react";
import "server-only";
import { client } from "./client";
import { PORTFOLIO_TAG, PORTFOLIO_QUERY } from "./queries";
import type { PortfolioPayload } from "@/lib/portfolio";

// Server-side, ISR-cached, deduped across layout + page via React cache().
// revalidate:3600 is the safety net if the webhook ever breaks; the webhook
// busts the tag immediately with { expire: 0 }.
export const getPortfolio = cache(async (): Promise<PortfolioPayload> =>
  client.fetch(PORTFOLIO_QUERY, {}, { next: { tags: [PORTFOLIO_TAG], revalidate: 3600 } })
);
