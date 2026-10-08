import { useEffect, useRef, useState } from "react";

/**
 * Fires once when an element first reaches the viewport.
 *
 * Entrances are one-shot by design: the briefs are explicit that cards and steps
 * fade-rise on first entry only and do not re-animate when scrolled back to.
 */
export function useInView<T extends Element>(threshold = 0.15, rootMargin = "0px 0px -20% 0px") {
  const ref = useRef<T | null>(null);
  // Engines without IntersectionObserver (and jsdom) get the content up front.
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, rootMargin, threshold]);

  return { ref, inView };
}
