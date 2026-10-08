import { useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  BookOpen,
  FileJson2,
  Home,
  PanelLeft,
  Plus,
  Settings2,
  Sparkles,
  Sun,
} from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { href, navigate } from "../hooks/useRoute";
import { cn } from "../lib/utils";

export function CommandPalette({ onToggleTheme }: { onToggleTheme: () => void }) {
  const open = useChatStore((s) => s.paletteOpen);
  // Mounted only while open, so query/cursor state resets naturally each time.
  if (!open) return null;
  return <Palette onToggleTheme={onToggleTheme} />;
}

function Palette({ onToggleTheme }: { onToggleTheme: () => void }) {
  const setPalette = useChatStore((s) => s.setPalette);
  const newSession = useChatStore((s) => s.newSession);
  const setDialog = useChatStore((s) => s.setDialog);
  const toggleSidebar = useChatStore((s) => s.toggleSidebar);

  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const close = () => setPalette(false);

  const actions = useMemo(
    () => [
      { id: "new", label: "New session", icon: Plus, run: newSession },
      {
        id: "focus",
        label: "Focus composer",
        icon: Sparkles,
        run: () => document.getElementById("composer-input")?.focus(),
      },
      {
        id: "sidebar",
        label: "Toggle sidebar",
        icon: PanelLeft,
        run: toggleSidebar,
      },
      { id: "theme", label: "Switch theme", icon: Sun, run: onToggleTheme },
      {
        id: "logs",
        label: "View session log",
        icon: FileJson2,
        run: () => setDialog("logs"),
      },
      {
        id: "settings",
        label: "Open settings",
        icon: Settings2,
        run: () => setDialog("settings"),
      },
      {
        id: "landing",
        label: "Open landing page",
        icon: Home,
        run: () => navigate(href("landing")),
      },
      {
        id: "docs",
        label: "Open documentation",
        icon: BookOpen,
        run: () => navigate(href("docs")),
      },
    ],
    // The palette window closes before an action runs, so `setPalette` is not
    // referenced here and does not belong in the dependency list.
    [newSession, onToggleTheme, setDialog, toggleSidebar],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((action) => action.label.toLowerCase().includes(q));
  }, [actions, query]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const action = results[cursor];
      if (action) {
        close();
        action.run();
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[14vh]">
      <div className="absolute inset-0 bg-black/45" onClick={close} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-md overflow-hidden rounded-lg border border-border bg-canvas shadow-xl"
      >
        <input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCursor(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Type a command…"
          className="w-full border-b border-border bg-transparent px-3.5 py-2.5 text-[13px] text-fg outline-none placeholder:text-faint"
        />
        <ul className="max-h-72 overflow-y-auto py-1">
          {results.length === 0 && (
            <li className="px-3.5 py-3 text-[12.5px] text-faint">
              No matching commands
            </li>
          )}
          {results.map((action, index) => {
            const Icon = action.icon;
            return (
              <li key={action.id}>
                <button
                  type="button"
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => {
                    close();
                    action.run();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.5px] transition-colors",
                    index === cursor ? "bg-surface-2 text-fg" : "text-muted",
                  )}
                >
                  <Icon size={14} strokeWidth={1.8} />
                  {action.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
