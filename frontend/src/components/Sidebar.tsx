import type { ReactNode } from "react";
import { BookOpen, FileJson2, Plus, Settings2, X } from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { href, navigate } from "../hooks/useRoute";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { StatusBadge } from "./StatusBadge";
import { cn, relativeTime } from "../lib/utils";

export function Sidebar() {
  const sessions = useChatStore((s) => s.sessions);
  const activeId = useChatStore((s) => s.activeId);
  const open = useChatStore((s) => s.sidebarOpen);
  const toggleSidebar = useChatStore((s) => s.toggleSidebar);
  const selectSession = useChatStore((s) => s.selectSession);
  const newSession = useChatStore((s) => s.newSession);
  const setDialog = useChatStore((s) => s.setDialog);

  const ordered = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  // Below lg the drawer is off-canvas, so it must not be tabbable while closed.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const offscreen = !open && !isDesktop;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => toggleSidebar(false)}
          aria-hidden
        />
      )}

      <aside
        aria-hidden={offscreen}
        inert={offscreen}
        className={cn(
          "z-50 flex w-[268px] shrink-0 flex-col border-r border-border bg-surface-2",
          "fixed inset-y-0 left-0 transition-transform duration-200 ease-out",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-12 items-center justify-between border-b border-border px-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">
            Sessions
          </span>
          <button
            type="button"
            onClick={() => toggleSidebar(false)}
            aria-label="Close sidebar"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-3 hover:text-fg lg:hidden"
          >
            <X size={14} strokeWidth={1.9} />
          </button>
        </div>

        <div className="p-2">
          <button
            type="button"
            onClick={newSession}
            className="flex w-full items-center gap-2 rounded-md bg-accent px-2.5 py-1.5 text-[12px] font-medium text-accent-fg transition-colors hover:bg-accent-hover"
          >
            <Plus size={14} strokeWidth={2.1} />
            New session
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
          {ordered.map((session) => {
            const isActive = session.id === activeId;
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => selectSession(session.id)}
                className={cn(
                  "group flex w-full flex-col gap-1 rounded-md px-2.5 py-2 text-left transition-colors",
                  isActive
                    ? "bg-surface-3 text-fg"
                    : "text-muted hover:bg-surface-3/60 hover:text-fg",
                )}
              >
                <span className="flex w-full items-center gap-2">
                  <span
                    className={cn(
                      "truncate font-mono text-[12px]",
                      isActive ? "text-fg" : "text-muted group-hover:text-fg",
                    )}
                  >
                    {session.owner && session.repo
                      ? `${session.owner}/${session.repo}`
                      : "New session"}
                  </span>
                </span>
                <span className="flex w-full items-center gap-2">
                  <StatusBadge status={session.status} className="border-0 bg-transparent p-0" />
                  <span className="text-[10px] text-faint">
                    {relativeTime(session.updatedAt)}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-0.5 border-t border-border p-2">
          <FooterButton icon={<FileJson2 size={14} strokeWidth={1.8} />} onClick={() => setDialog("logs")}>
            Session log
          </FooterButton>
          <FooterButton
            icon={<Settings2 size={14} strokeWidth={1.8} />}
            onClick={() => setDialog("settings")}
          >
            Settings
          </FooterButton>
          <FooterButton
            icon={<BookOpen size={14} strokeWidth={1.8} />}
            onClick={() => navigate(href("docs"))}
          >
            Docs
          </FooterButton>
        </div>
      </aside>
    </>
  );
}

function FooterButton({
  icon,
  children,
  onClick,
}: {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:bg-surface-3 hover:text-fg"
    >
      {icon}
      {children}
    </button>
  );
}
