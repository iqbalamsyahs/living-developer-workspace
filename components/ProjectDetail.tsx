"use client";

import { useState } from "react";
import type { ContentItem, RawImage } from "@/lib/portfolio";
import { TechPill } from "@/components/TechPill";
import { RichText } from "@/components/RichText";
import { SanityImage } from "@/components/SanityImage";
import { toPlainText } from "@/lib/portfolio";

interface ProjectDetailProps {
  content: ContentItem;
}

const JP_CHARS = /[぀-ヿ㐀-䶿一-鿿]/;

// DESIGN.md: solid green for core stack, solid violet for languages and
// design tools, outline for everything else.
const LANGUAGES = new Set(["TypeScript", "JavaScript", "SQL"]);
const TOOLS = new Set(["Figma", "Photoshop", "Google Sheets"]);

function pillVariant(label: string): "default" | "language" | "tool" {
  if (LANGUAGES.has(label)) return "language";
  if (TOOLS.has(label)) return "tool";
  return "default";
}

/** Full project gallery: coverImage (or gallery[0]) plus any gallery shots. */
function projectImages(project: ContentItem): RawImage[] {
  const images = (project.gallery ?? []).filter((img) => img.asset._ref);
  if (project.coverImage && project.coverImage.asset._ref) {
    images.unshift(project.coverImage);
  }
  return images;
}

/** Structured list section (highlights / outcomes). */
function ListSection({
  title,
  items,
  marker,
}: {
  title: string;
  items: string[];
  marker: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-6">
      <h3 className="font-display text-xs uppercase tracking-wider text-text-secondary">
        {title}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-baseline gap-2 text-sm leading-relaxed text-text-secondary">
            <span className="shrink-0 text-primary" aria-hidden="true">
              {marker}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Project detail body: gallery (click-to-swap main image), tech stack, role,
 * highlights, outcomes, body, and links. Plain stacked content — parents own
 * scrolling, so this is reused by both the project modal and the showcase
 * window's detail page.
 */
export function ProjectDetail({ content }: ProjectDetailProps) {
  const images = projectImages(content);
  const [active, setActive] = useState(0);
  const activeImage = images[Math.min(active, images.length - 1)];
  const hasJapanese = JP_CHARS.test(toPlainText(content.body));

  return (
    <>
      {/* Gallery: main image + click-to-swap thumbnail strip */}
      {activeImage && (
        <div className="border-b border-primary/10 p-8 pb-6">
          <div className="overflow-hidden rounded-md border border-primary/10">
            <SanityImage
              image={activeImage}
              width={1200}
              alt={activeImage.alt ?? content.title}
              className="block w-full"
              aspect="16/9"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.asset._ref ?? i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show screenshot ${i + 1} of ${images.length}`}
                  aria-pressed={i === active}
                  className={`size-14 shrink-0 overflow-hidden rounded-sm border transition-colors ${
                    i === active ? "border-primary" : "border-primary/10 hover:border-primary/40"
                  }`}
                >
                  <SanityImage image={img} width={112} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {content.tech && content.tech.length > 0 && (
        <div
          className="flex flex-wrap gap-2 border-b border-primary/10 p-8 pb-6"
          aria-label="Tech stack"
        >
          {content.tech.map((tech) => (
            <TechPill key={tech} label={tech} variant={pillVariant(tech)} />
          ))}
        </div>
      )}

      <div
        className={`p-8 text-sm leading-relaxed ${
          hasJapanese ? "font-jp" : ""
        }`}
      >
        {content.role && (
          <p className="font-mono text-xs uppercase tracking-wider text-primary">
            Role — {content.role}
          </p>
        )}

        {content.highlights && content.highlights.length > 0 && (
          <ListSection title="Highlights" items={content.highlights} marker="▸" />
        )}

        {content.outcomes && content.outcomes.length > 0 && (
          <ListSection title="Outcomes" items={content.outcomes} marker="✓" />
        )}

        {content.body.length > 0 && <RichText value={content.body} />}
      </div>

      {content.links && content.links.length > 0 && (
        <footer className="flex items-center gap-6 border-t border-primary/10 p-8 pt-6">
          {content.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {link.label}
            </a>
          ))}
        </footer>
      )}
    </>
  );
}
