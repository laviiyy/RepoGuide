import { useEffect, useRef } from "react";
import { useInView } from "../hooks/useInView";
import { cn, isMac } from "../lib/utils";

const RUN_PROMPT = "Install anmolkapil/plexo and tell me what it needs.";
const FIX_PROMPT = "Apply the sharp binding fix for anmolkapil/plexo and retry the install.";

export function LandingLiveSession({
  onRun,
  onFocusChange,
}: {
  onRun: (text: string) => void;
  onFocusChange?: (focused: boolean) => void;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>(0.15);

  // While this band owns the viewport, the background glow behind it dims to 40%.
  useEffect(() => {
    if (!onFocusChange || typeof IntersectionObserver === "undefined") return;
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => onFocusChange(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      onFocusChange(false);
    };
  }, [onFocusChange]);

  return (
    <section
      ref={sectionRef}
      id="live-session"
      className="relative z-10 border-y border-border bg-surface/60 py-16 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1120px] px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
            Live session
          </p>
          <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.015em] text-fg">
            Nothing runs until you say so.
          </h2>
        </div>

        <div
          ref={ref}
          id="session-frame"
          className={cn(
            "mx-auto w-full max-w-[1024px] overflow-hidden rounded-lg border border-border bg-canvas transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            inView ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-60",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
            <span className="truncate font-mono text-[11px] text-muted">
              repoguide · sandbox-vm-04
            </span>
            <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-wider text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
              Running
            </span>
          </div>

          <div className="space-y-4 p-4 lg:p-6">
            <div className="flex justify-end">
              <p className="max-w-[520px] rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-[13px] text-fg">
                {RUN_PROMPT}
              </p>
            </div>

            <div className="max-w-[560px] border-l-2 border-accent pl-4">
              <h3 className="text-[15px] font-semibold text-fg">
                It is a self-hosted AI gateway. Here is what it needs.
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                A distributed, self-hosted AI gateway orchestrating inference
                routing and semantic caching.
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                Configured via Postgres and Bun runtime with standard local
                environment overrides.
              </p>

              <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                {[
                  ["Runtime", "Bun 1.1.38"],
                  ["Database", "Postgres 16"],
                  ["Port", "3000"],
                  ["Env", "OPENAI_API_KEY"],
                ].map(([term, value]) => (
                  <div key={term} className="flex items-baseline justify-between gap-3">
                    <dt className="text-[12px] text-faint">{term}</dt>
                    <dd className="font-mono text-[12px] tabular-nums text-fg">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <code className="font-mono text-[12.5px] text-fg">
                  bun install --frozen-lockfile
                </code>
                <span className="rounded-sm border border-accent-border bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-accent">
                  Needs approval
                </span>
              </div>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">
                Installs 412 packages from the committed lockfile. No lifecycle
                scripts are executed.
              </p>
              <div className="mt-3.5 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onRun("")}
                  className="h-9 rounded-md px-3.5 text-[13px] font-medium text-muted transition-colors hover:bg-surface-3 hover:text-fg"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => onRun(RUN_PROMPT)}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-3.5 text-[13px] font-semibold text-accent-fg transition-opacity hover:opacity-90"
                >
                  Run command
                  <kbd className="font-mono text-[10px] font-normal opacity-70">
                    {isMac ? "⌘↵" : "Ctrl ↵"}
                  </kbd>
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-terminal">
              <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2.5">
                <span className="font-mono text-[10px] text-faint">bash</span>
                <span className="font-mono text-[10px] tabular-nums text-danger">
                  exit 1
                </span>
              </div>
              <div className="space-y-1.5 px-4 py-3 font-mono text-[11.5px] leading-relaxed text-terminal-fg">
                <p>
                  <span className="text-accent">$</span> bun install
                  --frozen-lockfile
                </p>
                <p className="text-terminal-fg/80">
                  <span className="text-success">✓</span> Resolved 412 packages
                  from bun.lockb in 184ms
                </p>
                <p className="text-terminal-fg/70">
                  postinstall: executing native bindings for sharp...
                </p>
                <p className="text-terminal-fg/70">
                  downloading prebuilt binary: sharp-linux-x64.node (failed
                  network probe)
                </p>
                <p className="text-terminal-fg/80">
                  <span className="text-danger">error:</span> Cannot find module
                  "sharp" from "node_modules/next/dist/server"
                </p>
                <span
                  className="rg-caret mt-1 inline-block h-3.5 w-0.5 bg-accent align-middle"
                  aria-hidden
                />
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-surface p-4">
              <div className="min-w-[240px] flex-1">
                <p className="text-[12.5px] font-medium text-fg">
                  Bun did not fetch the optional native dependency
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                  Next.js requires the standalone Linux x64 binding for image
                  processing. Proposing:{" "}
                  <code className="font-mono text-[12px] text-fg">
                    bun add -D @img/sharp-linux-x64
                  </code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRun(FIX_PROMPT)}
                className="h-9 shrink-0 rounded-md border border-border bg-surface-2 px-3.5 text-[13px] font-medium text-fg transition-colors hover:border-border-strong hover:bg-surface-3"
              >
                Apply fix
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
