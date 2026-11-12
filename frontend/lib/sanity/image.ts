import { createImageUrlBuilder } from "@sanity/image-url";
import { client } from "@/lib/sanity/client";
import type { RawImage } from "@/lib/portfolio";

const builder = createImageUrlBuilder(client);

/**
 * Sanity image → CDN URL builder. Images are served from the Sanity CDN with
 * on-the-fly resizing (`width`) and format negotiation (`auto=format`), so the
 * app uses plain <img> tags instead of next/image — no images.remotePatterns /
 * qualities config needed (both required by Next 16 for next/image).
 * ponytail: move to next/image if CORS-safe priority loading is ever needed;
 * add remotePatterns + qualities to next.config.ts at that point.
 */
export function urlFor(src: RawImage | undefined | null) {
  return src ? builder.image(src) : null;
}

/** Resolved CDN URL for a RawImage at a given pixel width, or null. */
export function imageUrl(src: RawImage | undefined | null, width: number): string | null {
  const img = urlFor(src);
  return img ? img.width(width).auto("format").url() : null;
}
