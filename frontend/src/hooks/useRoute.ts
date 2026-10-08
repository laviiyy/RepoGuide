import { useSyncExternalStore } from "react";

/**
 * Hash routing.
 *
 * The app ships as a static bundle with no server rewrites, so routes live in
 * the hash: `#/` (landing), `#/workspace`, `#/docs/<section>`. Real anchors keep
 * middle-click, back/forward and "copy link" working for free.
 */

export type DocsSection = "overview" | "stacks" | "policy" | "logs";

export type Route =
  | { name: "landing" }
  | { name: "workspace" }
  | { name: "docs"; section: DocsSection };

export const DOCS_SECTIONS: { id: DocsSection; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "stacks", label: "Supported stacks" },
  { id: "policy", label: "Command policy" },
  { id: "logs", label: "Session logs" },
];

export function href(
  target: "landing" | "workspace" | "docs",
  section?: DocsSection,
) {
  if (target === "landing") return "#/";
  if (target === "workspace") return "#/workspace";
  return section && section !== "overview" ? `#/docs/${section}` : "#/docs";
}

/* ---------------------------------------------------------------------------
   In-page scroll intents.

   Section jumps are not routes of their own — they are a target that has to
   survive a cross-route navigation, so "How it works" works from the docs page
   as well as from the landing page.
--------------------------------------------------------------------------- */

let pendingScrollId: string | null = null;

export function scrollToId(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export function scrollToTop() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}

export function consumePendingScroll() {
  const id = pendingScrollId;
  pendingScrollId = null;
  return id;
}

export function navigate(to: string) {
  // Same hash: no hashchange event is coming, so honour the intent right away.
  if (window.location.hash === to) {
    flushPendingScroll();
    return;
  }
  window.location.hash = to;
}

function flushPendingScroll() {
  if (!pendingScrollId) return;
  const id = pendingScrollId;
  pendingScrollId = null;
  window.requestAnimationFrame(() => scrollToId(id));
}

/** Navigate to a page section, crossing routes first when necessary. */
export function goToSection(page: "landing" | "docs", id: string) {
  pendingScrollId = id;
  navigate(href(page, page === "docs" ? (id as DocsSection) : undefined));
}

/* ---------------------------------------------------------------------------
   Route parsing
--------------------------------------------------------------------------- */

// Parsed routes are cached per hash so a route object keeps its identity across
// renders and can safely be used in effect dependency lists.
const cache = new Map<string, Route>();

function parseRaw(hash: string): Route {
  const path = hash
    .replace(/^#\/?/, "")
    .replace(/\/+$/, "")
    .trim();

  if (path === "workspace") return { name: "workspace" };

  if (path === "docs") return { name: "docs", section: "overview" };
  if (path.startsWith("docs/")) {
    const section = path.slice("docs/".length);
    const known = DOCS_SECTIONS.find((entry) => entry.id === section);
    return { name: "docs", section: known ? known.id : "overview" };
  }

  return { name: "landing" };
}

function parse(hash: string): Route {
  const hit = cache.get(hash);
  if (hit) return hit;
  const route = parseRaw(hash);
  cache.set(hash, route);
  return route;
}

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getSnapshot() {
  return window.location.hash;
}

export function useRoute(): Route {
  return parse(useSyncExternalStore(subscribe, getSnapshot, () => ""));
}
