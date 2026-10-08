import { goToSection, href, navigate, scrollToTop } from "../hooks/useRoute";
import { useScrolled } from "../hooks/useScroll";
import { ThemeToggle } from "./ThemeToggle";
import type { ThemeChoice } from "../hooks/useTheme";
import { cn } from "../lib/utils";

const PROCESS_SECTION = "process";

export function SiteHeader({
  theme,
  onCycleTheme,
}: {
  theme: ThemeChoice;
  onCycleTheme: () => void;
}) {
  // scroll-progress: the hairline fades in over the first 40px of scroll.
  const scrolled = useScrolled(40);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b transition-colors duration-200",
        scrolled
          ? "border-border bg-canvas/92 backdrop-blur-md"
          : "border-border/40 bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between px-6 lg:px-8">
        <a
          href={href("landing")}
          aria-label="RepoGuide home"
          className="flex items-center gap-2.5 rounded-sm"
          onClick={(event) => {
            event.preventDefault();
            // Already home: glide back to the top instead of adding a history entry.
            if (window.location.hash === href("landing")) scrollToTop();
            else navigate(href("landing"));
          }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-border bg-surface text-accent">
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 4 10 8 6 12" />
            </svg>
          </span>
          <span className="text-[14px] font-semibold tracking-tight text-fg">
            RepoGuide
          </span>
          <span className="hidden font-mono text-[11px] text-faint sm:inline">
            v0.9.4
          </span>
        </a>

        <div className="flex items-center gap-5">
          <nav className="hidden items-center gap-5 sm:flex" aria-label="Primary">
            <button
              type="button"
              onClick={() => goToSection("landing", PROCESS_SECTION)}
              className="text-[13px] font-medium text-muted transition-colors hover:text-fg"
            >
              How it works
            </button>
            <a
              href={href("docs")}
              onClick={(event) => {
                // Same-route clicks skip the hashchange event, so navigate directly.
                event.preventDefault();
                navigate(href("docs"));
              }}
              className="text-[13px] font-medium text-muted transition-colors hover:text-fg"
            >
              Docs
            </a>
          </nav>

          <span className="hidden h-3.5 w-px bg-border sm:block" aria-hidden />

          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onCycle={onCycleTheme} />
            <a
              href={href("workspace")}
              onClick={(event) => {
                event.preventDefault();
                navigate(href("workspace"));
              }}
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-border bg-surface-2 px-3.5 text-[13px] font-medium text-fg transition-colors hover:border-border-strong hover:bg-surface-3"
            >
              Open workspace
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
