import { useEffect, useState } from "react";

interface ScrollState {
  /** Window scroll offset in pixels. */
  y: number;
  /** 0 → 1 across the whole scrollable document. */
  progress: number;
}

/**
 * Scroll position, sampled at most once per animation frame.
 *
 * The listener is passive and the state only changes when the position does, so
 * scrolling a long landing page does not re-render on every pixel — consumers
 * that derive a boolean (see `useScrolled`) bail out of rendering entirely.
 */
export function useScroll(): ScrollState {
  const [state, setState] = useState<ScrollState>({ y: 0, progress: 0 });

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const y = window.scrollY;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollable > 1 ? Math.min(1, Math.max(0, y / scrollable)) : 0;
      setState((previous) =>
        previous.y === y && previous.progress === progress
          ? previous
          : { y, progress },
      );
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return state;
}

/** True once the page is scrolled past `threshold` px (drives the header hairline). */
export function useScrolled(threshold = 40) {
  const { y } = useScroll();
  return y > threshold;
}
