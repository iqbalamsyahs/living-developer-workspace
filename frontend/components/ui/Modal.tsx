"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** id of the element (a heading inside children) that names this dialog. */
  ariaLabelledBy: string;
  /** Extra panel classes; override placement (slide-over / centered). */
  className?: string;
  children: ReactNode;
}

/**
 * Accessible modal built on the native <dialog> element.
 *
 * A11y that comes free with showModal() + top layer:
 *  - focus is trapped inside the dialog and restored to the trigger on close
 *  - implicit role="dialog" and aria-modal="true"
 *  - Escape fires the native `cancel` event (we preventDefault it and let
 *    React state drive the real close, so open/onClose stay in sync)
 *
 * React gotchas handled here:
 *  - never pass the `open` attribute: showModal() throws InvalidStateError if
 *    the attribute is already present, so the dialog is driven imperatively
 *    through the ref + effect.
 *  - guard showModal() with `!dialog.open` (dev StrictMode double-invokes).
 *
 * Structure: the <dialog> element fills the viewport and is transparent, so
 * the ::backdrop dims + blurs the page behind. The actual panel is the child
 * div, placed by the responsive classes below (fullscreen <md, centered 80%
 * at md, right-edge slide-over at lg per DESIGN.md section 9).
 */
export function Modal({
  open,
  onClose,
  ariaLabelledBy,
  className = "",
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // Parents unmount the dialog while still open, which skips the native
  // focus restore; put focus back on the trigger ourselves. Declared before
  // the showModal effect so it captures the trigger, not the dialog.
  // The ref survives StrictMode's remount, when focus is already inside the dialog.
  const triggerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const active = document.activeElement as HTMLElement | null;
    if (!ref.current?.contains(active)) triggerRef.current = active;
    return () => {
      const trigger = triggerRef.current;
      if (trigger?.isConnected) requestAnimationFrame(() => trigger.focus());
    };
  }, []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      // Only close on real unmount (open -> false), never on a redundant
      // effect re-run mid-mount: R3F-initiated state updates can interleave
      // with React's concurrent scheduling, firing the cleanup after
      // showModal() and instantly closing a freshly opened dialog.
      if (!open && dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={ariaLabelledBy}
      className="modal-panel fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onPointerDown={(event) => {
        // Backdrop click: the dialog fills the viewport and the panel is its
        // child, so a pointer-down that lands on the dialog itself is outside.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`flex h-full flex-col overflow-hidden bg-surface text-text-primary shadow-modal-glow md:mx-auto md:my-auto md:h-auto md:max-h-[85vh] md:w-[80%] md:rounded-md lg:my-0 lg:ml-auto lg:mr-0 lg:h-full lg:max-h-none lg:w-[max(40%,min(28rem,50vw))] lg:rounded-none ${className}`}
      >
        {children}
      </div>
    </dialog>
  );
}
