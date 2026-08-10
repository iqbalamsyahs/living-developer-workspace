import { HomeClient } from "@/components/HomeClient";
import { getPortfolio } from "@/lib/sanity/fetch";
import { buildPortfolio } from "@/lib/portfolio";

/**
 * Server Component: fetches the whole portfolio from Sanity (ISR-cached under
 * the `portfolio-content` tag, revalidate 3600 fallback), maps it to a
 * serializable PortfolioData, and hands it to the client tree. The webhook
 * at /api/revalidate busts the tag on every content change.
 */
export default async function Home() {
  const portfolio = buildPortfolio(await getPortfolio());
  return <HomeClient portfolio={portfolio} />;
}
