"use client";

import type { ContentItem } from "@/lib/portfolio";
import { TechPill } from "@/components/ui/TechPill";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { RichText } from "@/components/ui/RichText";
import { toPlainText } from "@/lib/portfolio";

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
  const hasJapanese = JP_CHARS.test(toPlainText(content.body));

  return (
    <>
      <ModalHeader id={content.id} title={content.title} subtitle={content.date} onClose={onClose} />

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
