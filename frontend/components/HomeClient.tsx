"use client";

import { useEffect, useMemo, useState } from "react";
import { HUD } from "@/components/view/HUD";
import { StandardView } from "@/components/view/StandardView";
import { SplashScreen } from "@/components/view/SplashScreen";
import { Modal } from "@/components/ui/Modal";
import { ModalContent } from "@/components/modal/ModalContent";
import { ProjectModalContent } from "@/components/modal/ProjectModalContent";
import { AboutModalContent } from "@/components/modal/AboutModalContent";
import { StackModalContent } from "@/components/modal/StackModalContent";
import { ContactModalContent } from "@/components/modal/ContactModalContent";
import { ShowcaseModalContent } from "@/components/modal/ShowcaseModalContent";
import dynamic from "next/dynamic";
import { SceneBoundary } from "@/components/scene/SceneBoundary";
import { hireMeHref, resumeHref, type ContentItem, type PortfolioData } from "@/lib/portfolio";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useWebGL } from "@/hooks/useWebGL";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { activeRoomIds, ROOM_LABELS, type RoomId } from "@/lib/room";

// ssr:false + dynamic keeps three.js out of the mobile bundle and the server render.
const DesktopScene = dynamic(
  () => import("@/components/scene/DesktopScene").then((m) => m.DesktopScene),
  { ssr: false },
);

// z-scale: 3D canvas -1 | HUD overlay 10 | modal dialog top-layer.

interface HomeClientProps {
  portfolio: PortfolioData;
}

export function HomeClient({ portfolio }: HomeClientProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Auto view: HUD on desktop, Standard View on mobile. The override locks
  // the user's choice after a manual toggle; resizing never auto-flips back.
  const [standardOverride, setStandardOverride] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  // null until probed on the client; the 3D bundle only loads once WebGL is known to work.
  const webgl = useWebGL();
  const [activeModal, setActiveModal] = useState<string | null>(null);
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

  const showHUD = isDesktop && !standardOverride && webgl === true;
  const [focus, setFocus] = useState<RoomId | null>(null);
  const active = useMemo(() => activeRoomIds(portfolio), [portfolio]);
  const reducedMotion = useReducedMotion();

  const toggleView = () => {
    setStandardOverride((overridden) => !overridden);
    setActiveModal(null);
  };
  const handleSceneFailure = () => {
    setSceneFailed(true);
    setStandardOverride(true);
    setActiveModal(null);
    setFocus(null);
  };
  const closeModal = () => {
    setActiveModal(null);
    setFocus(null);
  };
  // ponytail: interim until the Task 4 side panel; each room object opens its existing modal.
  const selectRoom = (id: RoomId) => {
    const item = id === "experience" ? "about" : id === "journal" ? portfolio.journalEntries[0]?.id : id;
    setFocus(id);
    if (item) setActiveModal(item);
  };

  const activeContent = activeModal ? portfolio.items[activeModal] : undefined;

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
      case "showcase":
        return (
          <ShowcaseModalContent
            content={content}
            projects={portfolio.projects}
            onOpen={setActiveModal}
            onClose={onClose}
          />
        );
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
          <SceneBoundary onError={handleSceneFailure}>
          <DesktopScene
            active={active}
            labels={ROOM_LABELS}
            focus={focus}
            onSelect={selectRoom}
            onBackgroundClick={() => setFocus(null)}
            onContextLost={handleSceneFailure}
            reducedMotion={reducedMotion}
          />
          </SceneBoundary>
          <HUD
            brand={portfolio.siteConfig.brand}
            navItems={portfolio.siteConfig.navItems}
            onToggleStandard={toggleView}
            onOpen={setActiveModal}
            zoomed={focus != null}
            onContact={() => setActiveModal("contact")}
            journeyHint={false}
            hireMeHref={hireMeHref(portfolio.profile.contact)}
            resumeHref={resumeHref({
              resumeFileUrl: portfolio.profile.resumeFileUrl,
              links: portfolio.items.resume?.links,
            })}
            availability={portfolio.profile.availability}
          />
        </>
      ) : (
        <StandardView
          portfolio={portfolio}
          onToggleHUD={isDesktop ? toggleView : undefined}
          onOpen={setActiveModal}
          resumeHref={resumeHref({
            resumeFileUrl: portfolio.profile.resumeFileUrl,
            links: portfolio.items.resume?.links,
          })}
        />
      )}

      {sceneFailed && !showHUD && (
        <p
          role="status"
          className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-md border border-line bg-surface/90 px-4 py-2 text-sm text-text-primary"
        >
          The 3D scene could not load, so you are seeing the standard view.
        </p>
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
