"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HUD } from "@/components/view/HUD";
import { RoomPanel } from "@/components/view/RoomPanel";
import { IntroCard } from "@/components/view/IntroCard";
import { StandardView } from "@/components/view/StandardView";
import { SplashScreen } from "@/components/view/SplashScreen";
import { Modal } from "@/components/ui/Modal";
import { ModalContent } from "@/components/modal/ModalContent";
import { ProjectModalContent } from "@/components/modal/ProjectModalContent";
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

// z-scale: 3D canvas 0 | HUD overlay + room panel 10 | modal dialog top-layer.

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
    // Mobile keeps the SSR Standard View, so there is no flip to hide: drop the
    // splash at once (CSS already hides it there before hydration).
    const mobile = !window.matchMedia("(min-width: 768px)").matches;
    const t = setTimeout(() => (mobile ? setSplashGone(true) : setSplashLeaving(true)), mobile ? 0 : 1100);
    return () => clearTimeout(t);
  }, []);

  const showHUD = isDesktop && !standardOverride && webgl === true;
  const [focus, setFocus] = useState<RoomId | null>(null);
  // Leaving the HUD (resize, toggle) drops the open panel so it can't resurface later.
  if (!showHUD && focus != null) setFocus(null);
  const active = useMemo(() => activeRoomIds(portfolio), [portfolio]);
  const nav = useMemo(() => active.map((id) => ({ id, label: ROOM_LABELS[id] })), [active]);
  const reducedMotion = useReducedMotion();

  // The toggle that was focused unmounts with its view; land on the new view's heading.
  const focusHeading = () => requestAnimationFrame(() => document.querySelector<HTMLElement>("h1")?.focus());
  const toggleView = () => {
    setStandardOverride((overridden) => !overridden);
    setActiveModal(null);
    setFocus(null);
    focusHeading();
  };
  const handleSceneFailure = () => {
    setSceneFailed(true);
    setStandardOverride(true);
    setActiveModal(null);
    setFocus(null);
    focusHeading();
  };
  const closeModal = () => setActiveModal(null);
  const closePanel = useCallback(() => {
    setFocus(null);
    // Next frame: below lg the nav is hidden until the panel is gone.
    if (focus) requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-room="${focus}"]`)?.focus());
  }, [focus]);
  useEffect(() => {
    if (focus == null || activeModal != null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, activeModal, closePanel]);
  const resume = resumeHref({ resumeFileUrl: portfolio.profile.resumeFileUrl });

  const activeContent = activeModal ? portfolio.items[activeModal] : undefined;

  const renderModalContent = (content: ContentItem, onClose: () => void) =>
    content.kind === "project" ? (
      <ProjectModalContent content={content} onClose={onClose} />
    ) : (
      <ModalContent content={content} onClose={onClose} />
    );

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
            onSelect={setFocus}
            onBackgroundClick={closePanel}
            onContextLost={handleSceneFailure}
            reducedMotion={reducedMotion}
          />
          </SceneBoundary>
          <HUD
            brand={portfolio.siteConfig.brand}
            nav={nav}
            panelOpen={focus != null}
            openId={focus}
            onToggleStandard={toggleView}
            onOpen={setFocus}
            onClose={closePanel}
            hireMeHref={hireMeHref(portfolio.profile.contact)}
            resumeHref={resume}
            availability={portfolio.profile.availability}
          />
          {focus == null ? (
            <IntroCard
              name={portfolio.profile.name}
              tagline={portfolio.siteConfig.heroTagline}
              resumeHref={resume}
              resumeLabel={portfolio.siteConfig.ctas.resume}
            />
          ) : (
            <RoomPanel id={focus} portfolio={portfolio} onClose={closePanel} onOpenItem={setActiveModal} />
          )}
        </>
      ) : (
        <StandardView
          portfolio={portfolio}
          onToggleHUD={isDesktop ? toggleView : undefined}
          onOpen={setActiveModal}
          resumeHref={resume}
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
