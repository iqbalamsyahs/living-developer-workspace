"use client";

import { useState } from "react";
import { HUD } from "@/components/HUD";
import { StandardView } from "@/components/StandardView";
import { Modal } from "@/components/Modal";
import { ModalContent } from "@/components/ModalContent";
import { DesktopScene } from "@/components/Scene/DesktopScene";
import { getContent } from "@/lib/content";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// z-scale: 3D canvas -1 | HUD overlay 10 | modal dialog top-layer.

export default function Home() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Auto view: HUD on desktop, Standard View on mobile. The override locks
  // the user's choice after a manual toggle; resizing never auto-flips back.
  const [standardOverride, setStandardOverride] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const toggleView = () => setStandardOverride((overridden) => !overridden);
  const closeModal = () => setActiveModal(null);

  const showHUD = isDesktop && !standardOverride;
  const activeContent = activeModal ? getContent(activeModal) : undefined;

  return (
    <>
      {showHUD ? (
        <>
          <DesktopScene onOpenModal={setActiveModal} />
          <HUD onToggleStandard={toggleView} onOpen={setActiveModal} />
        </>
      ) : (
        <StandardView
          onToggleHUD={isDesktop ? toggleView : undefined}
          onOpen={setActiveModal}
        />
      )}

      {activeContent && (
        <Modal
          open
          onClose={closeModal}
          ariaLabelledBy={`${activeContent.id}-title`}
        >
          <ModalContent content={activeContent} onClose={closeModal} />
        </Modal>
      )}
    </>
  );
}
