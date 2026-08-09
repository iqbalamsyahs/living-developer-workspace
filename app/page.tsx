"use client";

import { useEffect, useState } from "react";
import { HUD } from "@/components/HUD";
import { StandardView } from "@/components/StandardView";
import { SplashScreen } from "@/components/SplashScreen";
import { Modal } from "@/components/Modal";
import { ModalContent } from "@/components/ModalContent";
import { AboutModalContent } from "@/components/AboutModalContent";
import { StackModalContent } from "@/components/StackModalContent";
import { ShowcaseModalContent } from "@/components/ShowcaseModalContent";
import { ContactModalContent } from "@/components/ContactModalContent";
import { DesktopScene } from "@/components/Scene/DesktopScene";
import { getContent, type ContentItem } from "@/lib/content";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// z-scale: 3D canvas -1 | HUD overlay 10 | modal dialog top-layer.

export default function Home() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Auto view: HUD on desktop, Standard View on mobile. The override locks
  // the user's choice after a manual toggle; resizing never auto-flips back.
  const [standardOverride, setStandardOverride] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  // Non-null while inside a Showcase -> case study drill-down; closing the
  // study restores the Showcase modal instead of clearing.
  const [returnTo, setReturnTo] = useState<string | null>(null);

  // Boot splash. SSR media query defaults to the mobile StandardView, so the
  // first paint is always Standard; without a cover, desktop users see a
  // Standard->HUD flash. Keep the splash opaque through hydration + the
  // media-query flip, then fade it out. (Splash is 100% opacity over the
  // canvas, so the flip is invisible underneath.)
  const [splashLeaving, setSplashLeaving] = useState(false);
  const [splashGone, setSplashGone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSplashLeaving(true), 1100);
    return () => clearTimeout(t);
  }, []);

  const toggleView = () => setStandardOverride((overridden) => !overridden);
  const closeModal = () => {
    setActiveModal(returnTo);
    setReturnTo(null);
  };
  const openFromShowcase = (id: string) => {
    setReturnTo("showcase");
    setActiveModal(id);
  };

  const showHUD = isDesktop && !standardOverride;
  const activeContent = activeModal ? getContent(activeModal) : undefined;

  const renderModalContent = (content: ContentItem, onClose: () => void) => {
    switch (content.kind) {
      case "about":
        return <AboutModalContent content={content} onClose={onClose} />;
      case "stack":
        return <StackModalContent content={content} onClose={onClose} />;
      case "showcase":
        return (
          <ShowcaseModalContent
            content={content}
            onOpen={openFromShowcase}
            onClose={onClose}
          />
        );
      case "contact":
        return <ContactModalContent content={content} onClose={onClose} />;
      default:
        return <ModalContent content={content} onClose={onClose} />;
    }
  };

  return (
    <>
      {!splashGone && (
        <SplashScreen
          leaving={splashLeaving}
          onTransitionEnd={() => setSplashGone(true)}
        />
      )}

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
          {renderModalContent(activeContent, closeModal)}
        </Modal>
      )}
    </>
  );
}
