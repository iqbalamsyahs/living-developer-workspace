import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { PORTFOLIO_TAG } from "@/lib/sanity/queries";

/**
 * Sanity webhook endpoint: busts the portfolio cache on every content change.
 * Signature-validated via SANITY_REVALIDATE_SECRET (shared with the Sanity
 * webhook config). `{ expire: 0 }` is the Next 16 webhook pattern — immediate
 * expiry, unlike the default stale-while-revalidate 'max' profile.
 */
export async function POST(req: NextRequest) {
  if (!process.env.SANITY_REVALIDATE_SECRET) {
    return new Response("Missing SANITY_REVALIDATE_SECRET", { status: 500 });
  }

  const { isValidSignature } = await parseBody(
    req,
    process.env.SANITY_REVALIDATE_SECRET,
    true, // wait for Content Lake eventual consistency
  );

  if (!isValidSignature) {
    return new Response(JSON.stringify({ message: "Invalid signature" }), { status: 401 });
  }

  revalidateTag(PORTFOLIO_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
