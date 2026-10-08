import { useEffect, useState, type ReactNode } from "react";
import { useInView } from "../hooks/useInView";
import { scrollToId } from "../hooks/useRoute";
import { cn } from "../lib/utils";

interface Step {
  id: string;
  n: string;
  cue: string;
  title: string;
  body: string;
  visual: ReactNode;
}

export function LandingProcess() {
  const [active, setActive] = useState(0);

  // The step whose block crosses the middle band of the viewport owns the rail.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const nodes = STEPS.map((step) =>
      document.getElementById(`step-${step.id}`),
    ).filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = nodes.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="process"
      className="relative z-10 mx-auto w-full max-w-[1120px] scroll-mt-20 px-6 pt-24 pb-24 lg:px-8 lg:pt-32"
    >
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <div className="lg:sticky lg:top-20 lg:h-fit lg:w-[320px] lg:shrink-0">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
            Process
          </p>
          <h2 className="text-[28px] leading-[1.2] font-semibold tracking-[-0.015em] text-fg">
            Four steps, no surprises.
          </h2>

          <ul className="mt-8 space-y-0.5">
            {STEPS.map((step, index) => {
              const current = index === active;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => scrollToId(`step-${step.id}`)}
                    aria-current={current ? "step" : undefined}
                    className="group flex w-full items-center gap-3 py-1 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border font-mono text-[11px] tabular-nums transition-colors",
                        current
                          ? "border-accent-border bg-accent-soft text-accent"
                          : "border-border text-faint group-hover:text-muted",
                      )}
                    >
                      {step.n}
                    </span>
                    <span
                      className={cn(
                        "border-l-2 py-1 pl-3 text-[13px] transition-colors duration-200",
                        current
                          ? "border-accent text-fg"
                          : "border-border text-muted group-hover:text-fg",
                      )}
                    >
                      {step.cue}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 rounded-lg border border-border bg-surface p-4">
            <p className="text-[13px] font-medium text-fg">
              Isolated Firecracker sandbox
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
              Zero side-effects on your workstation. Everything executes inside
              ephemeral microVMs.
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {STEPS.map((step) => (
            <StepBlock key={step.id} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepBlock({ step }: { step: Step }) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      id={`step-${step.id}`}
      className={cn(
        "flex scroll-mt-24 flex-col justify-center gap-6 py-10 lg:min-h-[560px] lg:py-16",
        inView ? "rg-rise" : "opacity-0",
      )}
    >
      <div>
        <p className="font-mono text-[14px] font-medium tabular-nums text-accent">
          {step.n}
        </p>
        <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.015em] text-fg">
          {step.title}
        </h3>
        <p className="mt-2.5 max-w-[560px] text-[13.5px] leading-relaxed text-muted">
          {step.body}
        </p>
      </div>
      {step.visual}
    </div>
  );
}

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-4 py-2.5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-faint">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}

function TargetVisual() {
  return (
    <Panel label="Target repository">
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate font-mono text-[12.5px] text-fg">
            https://github.com/anmolkapil/plexo
          </span>
          <span className="shrink-0 rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
            public
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-faint">
          <span>
            clone target: <span className="text-muted">/workspace/plexo</span>
          </span>
          <span>firecracker-vmm · isolated</span>
        </div>
      </div>
    </Panel>
  );
}

function IntentVisual() {
  const files = [
    ["README.md", "project intent & architecture"],
    ["package.json", "dependencies & scripts"],
    [".github/workflows/ci.yml", "canonical build pipeline"],
  ];
  return (
    <Panel label="Analyzed source manifests">
      <div className="divide-y divide-border">
        {files.map(([path, note]) => (
          <div
            key={path}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-2.5"
          >
            <span className="font-mono text-[12px] text-fg">{path}</span>
            <span className="text-[11.5px] text-faint">{note}</span>
          </div>
        ))}
      </div>
      <p className="border-t border-border bg-surface-2 px-4 py-3 text-[12px] leading-relaxed text-muted">
        <span className="text-faint">Extracted scope: </span>
        Self-hosted AI gateway orchestrating inference routing and semantic
        caching for enterprise compliance.
      </p>
    </Panel>
  );
}

function PlanVisual() {
  const steps = [
    ["1.", "bun install", "hydrate lockfile"],
    ["2.", "bun run db:migrate", "schema sync"],
    ["3.", "bun dev", "spawn server"],
    ["4.", "curl localhost:3000/health", "verify probe"],
  ];
  return (
    <Panel label="Proposed execution plan">
      <ol className="divide-y divide-border">
        {steps.map(([n, command, note]) => (
          <li
            key={command}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5"
          >
            <span className="font-mono text-[11px] tabular-nums text-faint">
              {n}
            </span>
            <span className="font-mono text-[12.5px] text-fg">{command}</span>
            <span className="text-[11.5px] text-faint">{note}</span>
          </li>
        ))}
      </ol>
      <p className="border-t border-border bg-surface-2 px-4 py-3 font-mono text-[11px] text-faint">
        runtime: <span className="text-muted">bun v1.1.38</span> (node 22 compat)
        · isolated postgres 16.1
      </p>
    </Panel>
  );
}

function DiagnosisVisual() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-terminal">
      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2.5">
        <span className="font-mono text-[10px] text-[color:var(--fg-faint)]">
          tty0 · /workspace/plexo
        </span>
        <span className="font-mono text-[10px] tabular-nums text-danger">
          exit code 1
        </span>
      </div>
      <div className="space-y-1.5 px-4 py-3 font-mono text-[11.5px] leading-relaxed text-terminal-fg">
        <p>
          <span className="text-accent">$</span> bun install
        </p>
        <p className="text-terminal-fg/80">
          <span className="text-success">✓</span> Resolved 42 packages from
          lockfile in 184ms
        </p>
        <p className="text-terminal-fg/70">
          postinstall: executing native bindings for sharp...
        </p>
        <p className="text-terminal-fg/80">
          <span className="text-danger">✕</span> [error] Cannot find module
          "sharp" from "node_modules/next/dist/server"
        </p>
        <p className="pt-1 text-terminal-fg/60">
          ↳ Diagnostic: missing platform-specific native binary
          sharp-linux-x64 for Linux 6.6 Firecracker container.
        </p>
        <p className="text-terminal-fg/60">
          Proposed fix: bun add -D @img/sharp-linux-x64
        </p>
      </div>
      <div className="border-t border-white/5 px-4 py-2.5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-accent">
          Awaiting approval
        </p>
      </div>
    </div>
  );
}

const STEPS: Step[] = [
  {
    id: "point",
    n: "01",
    cue: "Point at repository",
    title: "Point at a repository",
    body: "Paste any public or private GitHub URL. RepoGuide clones it into a disposable sandbox, never your machine.",
    visual: <TargetVisual />,
  },
  {
    id: "intent",
    n: "02",
    cue: "Read repository intent",
    title: "Read the intent, not just the code",
    body: "It reads the README, manifests, CI config and commit history, then explains what this project is for, who built it, and what problem it solves.",
    visual: <IntentVisual />,
  },
  {
    id: "plan",
    n: "03",
    cue: "Get an ordered plan",
    title: "Get an ordered plan",
    body: "You receive the exact setup sequence for this specific project — runtime version, package manager, install, migrate, run — with the reasoning for each step.",
    visual: <PlanVisual />,
  },
  {
    id: "approve",
    n: "04",
    cue: "Approve, watch, recover",
    title: "Approve, watch, recover",
    body: "Every command is shown before it runs. Output streams live. If one fails, RepoGuide reads the error and proposes one specific fix.",
    visual: <DiagnosisVisual />,
  },
];
