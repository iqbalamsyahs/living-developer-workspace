"use client";

import { useEffect, useState } from "react";
import { HUD } from "@/components/HUD";
import { StandardView } from "@/components/StandardView";
import { SplashScreen } from "@/components/SplashScreen";
import { Modal } from "@/components/Modal";
import { ModalContent } from "@/components/ModalContent";
import { AboutModalContent } from "@/components/AboutModalContent";
import { StackModalContent } from "@/components/StackModalContent";
import { ContactModalContent } from "@/components/ContactModalContent";
import { DesktopScene } from "@/components/Scene/DesktopScene";
import type { ContentItem, PortfolioData } from "@/lib/portfolio";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// z-scale: 3D canvas -1 | HUD overlay 10 | modal dialog top-layer.

interface HomeClientProps {
  portfolio: PortfolioData;
}

export function HomeClient({ portfolio }: HomeClientProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Auto view: HUD on desktop, Standard View on mobile. The override locks
  // the user's choice after a manual toggle; resizing never auto-flips back.
  const [standardOverride, setStandardOverride] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  // Non-null while inside a Showcase -> case study drill-down; closing the
  // study restores the Showcase modal instead of clearing.
  const [returnTo, setReturnTo] = useState<string | null>(null);
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
    setReturnTo(null);
  };
  const closeModal = () => {
    setActiveModal(returnTo);
    setReturnTo(null);
  };
  const openFromShowcase = (id: string) => {
    setReturnTo("showcase");
    setActiveModal(id);
  };
  // The showcase lives on the PC monitor (3D zoom) in HUD mode; anywhere else
  // it falls back to a normal dialog.
  const openContent = (id: string) => {
    if (id === "showcase" && showHUD) {
      // Toggle: zoomed in on the PC -> click again zooms back out (like Esc).
      if (zoomTarget === "pc") closeShowcase();
      else setZoomTarget("pc");
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
          <DesktopScene
            onOpenModal={openContent}
            zoomTarget={zoomTarget}
            caseStudies={portfolio.caseStudies}
            showcaseContent={portfolio.items.showcase}
            onOpenCaseStudy={openFromShowcase}
            onCloseShowcase={closeShowcase}
          />
          <HUD
            brand={portfolio.siteConfig.brand}
            navItems={portfolio.siteConfig.navItems}
            onToggleStandard={toggleView}
            onOpen={openContent}
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
