"use client";

import { imageUrl } from "@/lib/sanity/image";
import type { RawImage } from "@/lib/portfolio";

interface SanityImageProps {
  image?: RawImage | null;
  /** Render width (px) requested from the Sanity CDN. */
  width: number;
  alt?: string;
  className?: string;
  /** Aspect ratio for the box so layout doesn't jump on load. */
  aspect?: string;
}

/**
 * Sanity image rendered via plain <img> (see urlFor note in lib/sanity/image.ts
 * on why not next/image). Lazy-loads, fills the parent width, and reserves its
 * aspect-ratio box to avoid layout shift.
 */
export function SanityImage({ image, width, alt, className, aspect }: SanityImageProps) {
  const src = imageUrl(image, width);
  const altText = alt ?? image?.alt ?? "";
  if (!src) return null;
  return (
    // Sanity CDN serves resized/formatted images via urlFor; next/image adds nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={altText}
      width={width}
      loading="lazy"
      className={className}
      style={aspect ? { aspectRatio: aspect, objectFit: "cover" } : undefined}
    />
  );
}
