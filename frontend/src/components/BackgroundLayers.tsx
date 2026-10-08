import { useMediaQuery } from "../hooks/useMediaQuery";
import { useScroll } from "../hooks/useScroll";

/*
 * The four layers sit behind every marketing/docs route, each as its own element
 * with a `data-depth` attribute so they can be moved at different rates:
 *
 *   data-depth="0.05"  dot grid (32px tile)      — largest, slowest
 *   data-depth="0.18"  two soft radial glows     — bounded drift + slow sweep
 *   data-depth="0.35"  horizontal rules (96px)   — masked to fade at the edges
 *   data-depth="1"     vignette                  — deepens instead of translating
 *
 * Tiled layers move by `scroll * depth` wrapped into the tile size, so the pattern
 * never runs out from under the viewport. The glows drift within a bounded range
 * (a 900px blurred blob has no visible edge) and the vignette — a viewport-sized
 * mask — changes opacity, because translating it would expose the canvas behind.
 * Under `prefers-reduced-motion` every layer holds still.
 */

const DOT_TILE = 32;
const RULE_TILE = 96;

function wrap(value: number, tile: number) {
  return ((value % tile) + tile) % tile;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function BackgroundLayers({ dimGlow = false }: { dimGlow?: boolean }) {
  const { y, progress } = useScroll();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const dotsY = reduced ? 0 : -wrap(y * 0.05, DOT_TILE);
  const rulesY = reduced ? 0 : -wrap(y * 0.35, RULE_TILE);

  // The glows sweep left → right across the page rather than only sliding down.
  const glowY = reduced ? 0 : -clamp(y * 0.18, -72, 72);
  const glowX = reduced ? 0 : clamp((progress - 0.5) * 90, -45, 45);

  return (
    <div className="rg-bg" aria-hidden="true">
      <div
        className="rg-layer rg-dots"
        data-depth="0.05"
        style={{ transform: `translate3d(0, ${dotsY}px, 0)` }}
      />
      <div
        className="rg-layer rg-glow"
        data-depth="0.18"
        style={{
          transform: `translate3d(${glowX}px, ${glowY}px, 0)`,
          // The live-session band is the focus: everything behind it quiets down.
          opacity: dimGlow ? 0.4 : 1,
          transition: "opacity 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
      <div
        className="rg-layer rg-rules"
        data-depth="0.35"
        style={{ transform: `translate3d(0, ${rulesY}px, 0)` }}
      />
      <div
        className="rg-layer rg-vignette"
        data-depth="1"
        style={{ opacity: reduced ? 0.85 : 0.75 + progress * 0.25 }}
      />
    </div>
  );
}
