"use client";

import { useState } from "react";
import { Check, Copy, EnvelopeSimple } from "@phosphor-icons/react";
import type { ContentItem } from "@/lib/content";
import { Button } from "@/components/Button";
import { ModalHeader } from "@/components/ModalHeader";

interface ContactModalContentProps {
  content: ContentItem;
  onClose: () => void;
}

/**
 * Contact modal: email with copy-to-clipboard, plus GitHub/LinkedIn links.
 * Opened by the phone on the desk.
 */
export function ContactModalContent({ content, onClose }: ContactModalContentProps) {
  const contact = content.contact;
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    if (!contact) return;
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the mailto link beside it still works.
    }
  };

  return (
    <>
      <ModalHeader id={content.id} title={content.title} onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-8">
        {content.body.map((paragraph, index) => (
          <p key={index} className="mb-4 text-sm leading-relaxed text-text-primary/90">
            {paragraph}
          </p>
        ))}

        {contact && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 rounded-md border border-primary/10 bg-surface p-4">
              <div className="flex min-w-0 items-center gap-3">
                <EnvelopeSimple size={18} aria-hidden="true" className="shrink-0 text-primary" />
                <a
                  href={`mailto:${contact.email}`}
                  className="truncate font-mono text-sm text-text-primary hover:underline"
                >
                  {contact.email}
                </a>
              </div>
              <Button variant="outline" size="sm" onClick={copyEmail} className="shrink-0">
                {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <p aria-live="polite" className="sr-only">
              {copied ? "Email copied to clipboard" : ""}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {contact.github && (
                <a
                  href={contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  GitHub
                </a>
              )}
              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
