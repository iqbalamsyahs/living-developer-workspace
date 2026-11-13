"use client";

import type { ContentItem } from "@/lib/portfolio";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { RichText } from "@/components/ui/RichText";
import { SanityImage } from "@/components/ui/SanityImage";
import { toPlainText } from "@/lib/portfolio";

interface AboutModalContentProps {
  content: ContentItem;
  onClose: () => void;
}

const JP_CHARS = /[぀-ヿ㐀-䶿一-鿿]/;

/**
 * About modal: narrative bio, a one-line philosophy, then the
 * career timeline. Opened by the open book on the desk.
 */
export function AboutModalContent({ content, onClose }: AboutModalContentProps) {
  const hasJapanese = JP_CHARS.test(toPlainText(content.body));

  return (
    <>
      <ModalHeader id={content.id} title={content.title} onClose={onClose} />

      <div
        className={`flex-1 overflow-y-auto p-8 text-sm leading-relaxed ${
          hasJapanese ? "font-jp" : ""
        }`}
      >
        {content.photo && (
          <SanityImage
            image={content.photo}
            width={320}
            alt={content.photo.alt}
            aspect="1/1"
            className="mb-6 h-32 w-32 rounded-md border border-line"
          />
        )}

        {content.body.length > 0 && <RichText value={content.body} />}

        {content.philosophy && (
          <blockquote className="mt-6 border-l-2 border-primary/40 pl-4 text-text-secondary">
            {content.philosophy}
          </blockquote>
        )}
      </div>

      {content.experiences && content.experiences.length > 0 && (
        <div className="border-t border-line p-8 pt-6">
          <h3 className="mb-6 font-display text-lg text-text-primary">
            Experience
          </h3>
          <ExperienceTimeline experiences={content.experiences} />
        </div>
      )}
    </>
  );
}
