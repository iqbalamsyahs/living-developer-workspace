"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import type { ContentItem } from "@/lib/portfolio";
import { Button } from "@/components/Button";
import { ModalHeader } from "@/components/ModalHeader";
import { RichText } from "@/components/RichText";

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
        {content.body.length > 0 && <RichText value={content.body} />}

        {contact && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 rounded-md border border-primary/10 bg-surface p-4">
              <div className="flex min-w-0 items-center gap-3">
                <EnvelopeClosedIcon width={18} height={18} aria-hidden="true" className="shrink-0 text-primary" />
                <a
                  href={`mailto:${contact.email}`}
                  className="truncate font-mono text-sm text-text-primary hover:underline"
                >
                  {contact.email}
                </a>
              </div>
              <Button variant="outline" size="sm" onClick={copyEmail} className="shrink-0">
                {copied ? <CheckIcon width={14} height={14} aria-hidden="true" /> : <CopyIcon width={14} height={14} aria-hidden="true" />}
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
