import { useEffect, useRef, useState } from "react";
import { BackgroundLayers } from "../components/BackgroundLayers";
import { LandingClose } from "../components/LandingClose";
import { LandingHero } from "../components/LandingHero";
import { LandingLiveSession } from "../components/LandingLiveSession";
import { LandingProcess } from "../components/LandingProcess";
import { LandingSafety } from "../components/LandingSafety";
import { SiteHeader } from "../components/SiteHeader";
import {
  consumePendingScroll,
  href,
  navigate,
  scrollToId,
  useRoute,
} from "../hooks/useRoute";
import type { ThemeChoice } from "../hooks/useTheme";

export function Landing({
  theme,
  onCycleTheme,
  onRun,
}: {
  theme: ThemeChoice;
  onCycleTheme: () => void;
  onRun: (text: string, owner?: string, repo?: string) => void;
}) {
  const route = useRoute();
  const [glowDim, setGlowDim] = useState(false);

  // Entry behaviour: honour a section intent ("How it works" from the docs page)
  // or start the page at the top. The intent is consumed once, so the second
  // pass StrictMode makes in development must not scroll back to the top.
  const entered = useRef(false);
  useEffect(() => {
    const intent = consumePendingScroll();
    if (intent) {
      scrollToId(intent);
    } else if (!entered.current) {
      window.scrollTo(0, 0);
    }
    entered.current = true;
  }, [route]);

  // Every entry point into the engine lands in the workspace, where the run shows.
  const startRun = (text: string, owner?: string, repo?: string) => {
    navigate(href("workspace"));
    onRun(text, owner, repo);
  };

  return (
    <div className="relative min-h-full">
      <BackgroundLayers dimGlow={glowDim} />
      <SiteHeader theme={theme} onCycleTheme={onCycleTheme} />

      <LandingHero onSubmit={startRun} />
      <LandingProcess />

      <LandingLiveSession
        onFocusChange={setGlowDim}
        onRun={(text) => (text ? startRun(text) : navigate(href("workspace")))}
      />

      <LandingSafety />
      <LandingClose onSubmit={startRun} />
    </div>
  );
}
