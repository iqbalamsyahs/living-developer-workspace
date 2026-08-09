"use client";

import type { ContentItem } from "@/lib/content";
import { ModalHeader } from "@/components/ModalHeader";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";

interface AboutModalContentProps {
  content: ContentItem;
  onClose: () => void;
}

const JP_CHARS = /[぀-ヿ㐀-䶿一-鿿]/;

/**
 * About & Experience modal: narrative bio, a one-line philosophy, then the
 * career timeline. Opened by the notebook on the desk.
 */
export function AboutModalContent({ content, onClose }: AboutModalContentProps) {
  const hasJapanese = content.body.some((p) => JP_CHARS.test(p));

  return (
    <>
      <ModalHeader id={content.id} title={content.title} onClose={onClose} />

      <div
        className={`flex-1 overflow-y-auto p-8 text-sm leading-relaxed ${
          hasJapanese ? "font-jp" : ""
        }`}
      >
        {content.body.map((paragraph, index) => (
          <p key={index} className="mb-4 text-text-primary/90">
            {paragraph}
          </p>
        ))}

        {content.philosophy && (
          <blockquote className="mt-6 border-l-2 border-primary/40 pl-4 text-text-secondary">
            {content.philosophy}
          </blockquote>
        )}
      </div>

      {content.experiences && content.experiences.length > 0 && (
        <div className="border-t border-primary/10 p-8 pt-6">
          <h3 className="mb-6 font-display text-lg text-text-primary">
            Experience
          </h3>
          <ExperienceTimeline experiences={content.experiences} />
        </div>
      )}
    </>
  );
}
