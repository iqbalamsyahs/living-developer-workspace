"use client";

import { X } from "@phosphor-icons/react";
import type { ContentItem } from "@/lib/content";
import { Button } from "@/components/Button";
import { TechPill } from "@/components/TechPill";

interface ModalContentProps {
  content: ContentItem;
  onClose: () => void;
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

/**
 * Body of a content modal, per DESIGN.md section 6: header (title + date +
 * close), tech metadata bar, scrollable body, footer links.
 */
export function ModalContent({ content, onClose }: ModalContentProps) {
  const titleId = `${content.id}-title`;
  const hasJapanese = content.body.some((p) => JP_CHARS.test(p));

  return (
    <>
      <header className="flex items-start justify-between gap-4 border-b border-primary/10 p-8 pb-6">
        <div className="min-w-0">
          <h2 id={titleId} className="font-display text-2xl leading-none">
            {content.title}
          </h2>
          {content.date && (
            <p className="mt-2 text-xs text-text-secondary">{content.date}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Close ${content.title}`}
          onClick={onClose}
          className="shrink-0 p-1.5"
        >
          <X size={16} aria-hidden="true" />
        </Button>
      </header>

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
        className={`flex-1 overflow-y-auto p-8 text-sm leading-relaxed ${
          hasJapanese ? "font-jp" : ""
        }`}
      >
        {content.body.map((paragraph, index) => (
          <p
            key={index}
            className={
              index < content.body.length - 1
                ? "mb-4 text-text-primary/90"
                : "text-text-primary/90"
            }
          >
            {paragraph}
          </p>
        ))}
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
