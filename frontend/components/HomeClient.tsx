"use client";

import { useEffect, useState } from "react";
import { HUD } from "@/components/view/HUD";
import { StandardView } from "@/components/view/StandardView";
import { SplashScreen } from "@/components/view/SplashScreen";
import { Modal } from "@/components/ui/Modal";
import { ModalContent } from "@/components/modal/ModalContent";
import { ProjectModalContent } from "@/components/modal/ProjectModalContent";
import { AboutModalContent } from "@/components/modal/AboutModalContent";
import { StackModalContent } from "@/components/modal/StackModalContent";
import { ContactModalContent } from "@/components/modal/ContactModalContent";
import { DesktopScene } from "@/components/scene/DesktopScene";
import type { ContentItem, PortfolioData } from "@/lib/portfolio";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// z-scale: 3D canvas -1 | HUD overlay 10 | modal dialog top-layer.

const SPIKE_STAGES: (string | null)[] = [null, "about", "pc", "contact"];

interface HomeClientProps {
  portfolio: PortfolioData;
}

export function HomeClient({ portfolio }: HomeClientProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Auto view: HUD on desktop, Standard View on mobile. The override locks
  // the user's choice after a manual toggle; resizing never auto-flips back.
  const [standardOverride, setStandardOverride] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  // "pc" while the showcase is shown on the monitor (3D zoom); null when the
  // showcase is closed and the camera returns to the desk. The PC model and the
  // HUD showcase button both set this instead of opening a dialog.
  const [zoomTarget, setZoomTarget] = useState<string | null>(null);

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

  const toggleView = () => {
    setStandardOverride((overridden) => !overridden);
    // Standard View unmounts the 3D scene; drop any zoom/modal so no state
    // dangles when the user toggles back to HUD.
    setZoomTarget(null);
    setActiveModal(null);
  };
  const closeModal = () => setActiveModal(null);
  // The showcase lives on the PC monitor (3D zoom) in HUD mode; anywhere else
  // it falls back to a normal dialog.
  const openContent = (id: string) => {
    // In HUD mode, the showcase lives on the PC monitor and the contact screen
    // on the phone (both 3D zooms); anywhere else they fall back to a dialog.
    const zt =
      id === "showcase" ? "pc" : id === "contact" ? "contact" : id === "about" ? "about" : null;
    if (zt && showHUD) {
      // Toggle: zoomed in on the object -> click again zooms back out (like Esc).
      if (zoomTarget === zt) closeShowcase();
      else setZoomTarget(zt);
    } else setActiveModal(id);
  };
  const closeShowcase = () => {
    setActiveModal(null);
    setZoomTarget(null);
  };

  // Esc closes the on-monitor showcase (zoom-out) while no dialog is open.
  // The native <dialog> handles its own Escape, so skip when one is up.
  useEffect(() => {
    if (!zoomTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (activeModal && activeModal !== "showcase") return;
      closeShowcase();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomTarget, activeModal]);

  const showHUD = isDesktop && !standardOverride;

  // SPIKE (throwaway): scroll position -> camera stage, reusing zoomTarget.
  // Stack/experience/journal stages have no zoom view yet.
  useEffect(() => {
    if (!showHUD) return;
    let last = 0;
    const onScroll = () => {
      const i = Math.min(
        SPIKE_STAGES.length - 1,
        Math.round(window.scrollY / window.innerHeight),
      );
      if (i === last) return;
      last = i;
      setZoomTarget(SPIKE_STAGES[i]);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showHUD]);

  const activeContent = activeModal ? portfolio.items[activeModal] : undefined;
  // True while the showcase is rendered on the monitor; suppresses the dialog
  // (showcase is never a dialog in HUD mode).
  const showcaseOnScreen = activeModal === "showcase" && zoomTarget != null;

  const renderModalContent = (content: ContentItem, onClose: () => void) => {
    switch (content.kind) {
      case "about":
        return <AboutModalContent content={content} onClose={onClose} />;
      case "stack":
        return (
          <StackModalContent
            content={content}
            categoryLabels={portfolio.siteConfig.categoryLabels}
            onClose={onClose}
          />
        );
      case "contact":
        return <ContactModalContent content={content} onClose={onClose} />;
      case "project":
        return <ProjectModalContent content={content} onClose={onClose} />;
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
          brand={portfolio.siteConfig.brand}
          splashLine={portfolio.siteConfig.splashLine}
        />
      )}

      {showHUD ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none"
            style={{ height: `${SPIKE_STAGES.length * 100}vh` }}
          />
          <DesktopScene
            onOpenModal={openContent}
            zoomTarget={zoomTarget}
            projects={portfolio.projects}
            showcaseContent={portfolio.items.showcase}
            contactContent={portfolio.items.contact}
            aboutContent={portfolio.items.about}
            onCloseShowcase={closeShowcase}
          />
          <HUD
            brand={portfolio.siteConfig.brand}
            navItems={portfolio.siteConfig.navItems}
            onToggleStandard={toggleView}
            onOpen={openContent}
            zoomed={zoomTarget != null}
          />
        </>
      ) : (
        <StandardView
          portfolio={portfolio}
          onToggleHUD={isDesktop ? toggleView : undefined}
          onOpen={openContent}
        />
      )}

      {activeContent && !showcaseOnScreen && (
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
