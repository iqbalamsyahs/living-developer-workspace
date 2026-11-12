"use client";

import { useEffect, useRef } from "react";
import { AboutModalContent } from "@/components/modal/AboutModalContent";
import { ShowcaseModalContent } from "@/components/modal/ShowcaseModalContent";
import { StackModalContent } from "@/components/modal/StackModalContent";
import { ContactModalContent } from "@/components/modal/ContactModalContent";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { ROOM_LABELS, type RoomId } from "@/lib/room";
import type { PortfolioData } from "@/lib/portfolio";

interface RoomPanelProps {
  id: RoomId;
  portfolio: PortfolioData;
  onClose: () => void;
  /** Open a project or journal entry in the modal over the panel. */
  onOpenItem: (itemId: string) => void;
}

/** Right-hand content panel for the focused room object. */
export function RoomPanel({ id, portfolio, onClose, onOpenItem }: RoomPanelProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.querySelector("button")?.focus();
  }, [id]);

  const { items, projects, journalEntries, siteConfig } = portfolio;
  let body: React.ReactNode;
  switch (id) {
    case "about":
      body = (
        <AboutModalContent
          content={{ ...items.about, title: ROOM_LABELS.about, experiences: undefined }}
          onClose={onClose}
        />
      );
      break;
    case "showcase":
      body = <ShowcaseModalContent content={items.showcase} projects={projects} onOpen={onOpenItem} onClose={onClose} />;
      break;
    case "stack":
      body = <StackModalContent content={items.stack} categoryLabels={siteConfig.categoryLabels} onClose={onClose} />;
      break;
    case "experience":
      body = (
        <>
          <ModalHeader id="experience" title={ROOM_LABELS.experience} onClose={onClose} />
          <div className="flex-1 overflow-y-auto p-8">
            <ExperienceTimeline experiences={items.about?.experiences ?? []} />
          </div>
        </>
      );
      break;
    case "journal":
      body = (
        <>
          <ModalHeader id="journal" title={ROOM_LABELS.journal} onClose={onClose} />
          <ul className="flex flex-1 flex-col overflow-y-auto px-8 pb-8">
            {journalEntries.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onOpenItem(entry.id)}
                  className="flex w-full flex-col items-start gap-0.5 border-t border-primary/10 py-3 text-left transition-colors hover:text-primary"
                >
                  <span className="font-display text-sm text-text-primary">{entry.title}</span>
                  {entry.date && (
                    <span className="font-mono text-[11px] uppercase tracking-wide text-text-secondary">{entry.date}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      );
      break;
    case "contact":
      body = <ContactModalContent content={items.contact} onClose={onClose} />;
      break;
  }

  return (
    <aside
      ref={ref}
      aria-labelledby={`${id}-title`}
      className="modal-panel fixed inset-y-0 right-0 z-10 flex w-[min(28rem,50vw)] flex-col border-l border-line bg-surface text-text-primary"
    >
      {body}
    </aside>
  );
}
