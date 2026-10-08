import { BookOpen, Menu, Search, SquareTerminal } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { ThemeToggle } from "./ThemeToggle";
import { useChatStore } from "../store/chatStore";
import { href, navigate } from "../hooks/useRoute";
import type { ThemeChoice } from "../hooks/useTheme";
import { cn, isMac } from "../lib/utils";

export function TopBar({
  theme,
  onCycleTheme,
}: {
  theme: ThemeChoice;
  onCycleTheme: () => void;
}) {
  const session = useChatStore((s) => s.active());
  const toggleSidebar = useChatStore((s) => s.toggleSidebar);
  const setPalette = useChatStore((s) => s.setPalette);

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-border bg-canvas/90 px-3 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => toggleSidebar()}
          aria-label="Toggle sidebar"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg lg:hidden"
        >
          <Menu size={16} strokeWidth={1.8} />
        </button>

        <a
          href={href("landing")}
          aria-label="RepoGuide home"
          onClick={(event) => {
            event.preventDefault();
            navigate(href("landing"));
          }}
          className="flex items-center gap-2 rounded-md px-1 py-1 text-fg transition-opacity hover:opacity-80"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-accent ring-1 ring-inset ring-accent-border">
            <SquareTerminal size={13} strokeWidth={2} />
          </span>
          <span className="hidden text-[13px] font-semibold tracking-tight sm:inline">
            RepoGuide
          </span>
        </a>

        <span className="hidden h-4 w-px bg-border sm:block" />

        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-mono text-[12px] text-fg">
            {session.owner && session.repo ? (
              <>
                <span className="text-muted">{session.owner}/</span>
                {session.repo}
              </>
            ) : (
              <span className="text-faint">no repository</span>
            )}
          </span>
          <StatusBadge status={session.status} className="hidden sm:inline-flex" />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <a
          href={href("docs")}
          onClick={(event) => {
            event.preventDefault();
            navigate(href("docs"));
          }}
          className="hidden h-8 items-center gap-1.5 rounded-md px-2 text-[12px] text-muted transition-colors hover:bg-surface-2 hover:text-fg sm:flex"
        >
          <BookOpen size={13} strokeWidth={1.9} />
          <span>Docs</span>
        </a>
        <button
          type="button"
          onClick={() => setPalette(true)}
          className={cn(
            "hidden h-8 items-center gap-2 rounded-md border border-border px-2 text-[12px] text-muted transition-colors sm:flex",
            "hover:border-border-strong hover:text-fg",
          )}
        >
          <Search size={13} strokeWidth={1.9} />
          <span>Command</span>
          <kbd className="rounded-sm border border-border bg-surface-2 px-1 font-mono text-[10px] text-faint">
            {isMac ? "⌘K" : "Ctrl K"}
          </kbd>
        </button>
        <button
          type="button"
          onClick={() => setPalette(true)}
          aria-label="Open command palette"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg sm:hidden"
        >
          <Search size={15} strokeWidth={1.9} />
        </button>
        <ThemeToggle theme={theme} onCycle={onCycleTheme} />
      </div>
    </header>
  );
}
