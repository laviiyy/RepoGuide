import type { CSSProperties } from "react";
import { Ban, Box, Container, FileText, KeyRound, SquareCheck } from "lucide-react";
import { useInView } from "../hooks/useInView";
import { href } from "../hooks/useRoute";
import { cn } from "../lib/utils";

const delay = (ms: number) => ({ "--rg-delay": `${ms}ms` }) as CSSProperties;

const CARDS = [
  {
    icon: Box,
    title: "Disposable sandbox",
    body: "Every repository is cloned and executed in an isolated environment that is destroyed when the session ends.",
    label: "Lifecycle",
    value: "0ms persistence",
  },
  {
    icon: SquareCheck,
    title: "Command-level approval",
    body: "You see the exact command, its flags and its side effects before it runs. Nothing is bundled into a vague 'install' step.",
    label: "Inspection",
    value: "Explicit AST parse",
  },
  {
    icon: Ban,
    title: "Blocked by policy",
    body: "Destructive patterns — recursive deletes, force pushes, credential reads, outbound transmission of your files — are refused before they reach the sandbox, even if you would approve them.",
    label: "Enforcement",
    value: "Non-overridable",
  },
  {
    icon: FileText,
    title: "Full audit trail",
    body: "Every proposed command, approval and line of output is written to a session log you can read afterwards.",
    label: "Integrity",
    value: "SHA-256 hashed",
  },
  {
    icon: KeyRound,
    title: "You keep the context",
    body: "The sandbox holds a URL you gave it. No local paths, no SSH keys, no shell history, no credentials of yours.",
    label: "Credentials",
    value: "Zero ingestion",
  },
  {
    icon: Container,
    title: "Reproducible by design",
    body: "The runtime version, package manager and lockfile state are pinned and shown, so a working setup stays working.",
    label: "Container",
    value: "OCI deterministic",
  },
];

export function LandingSafety() {
  // Cards fade-rise once, on first entry only.
  const { ref, inView } = useInView<HTMLDivElement>(0.1, "0px 0px -10% 0px");

  return (
    <section
      id="safety"
      className="relative z-10 mx-auto w-full max-w-[1120px] scroll-mt-20 px-6 py-24 lg:px-8 lg:py-32"
    >
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
        Safety
      </p>
      <h2 className="mt-3 text-[28px] leading-[1.2] font-semibold tracking-[-0.015em] text-fg">
        It cannot touch your machine.
      </h2>

      <div className="mt-5 max-w-[640px] space-y-3">
        <p className="text-[13.5px] leading-relaxed text-muted">
          When RepoGuide analyzes an open-source project, the entire discovery
          and evaluation phase runs within an isolated, ephemeral MicroVM. Your
          local filesystem, shell configuration and personal credentials remain
          untouched.
        </p>
        <p className="text-[13.5px] leading-relaxed text-muted">
          Before any dependency installs or server processes run, every command
          is decomposed, inspected against security rules, and handed to you for
          explicit authorization. You retain total authority over execution.
        </p>
      </div>

      <div
        ref={ref}
        className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {CARDS.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={cn(
                "flex flex-col rounded-lg border border-border bg-surface p-4 transition-colors duration-200 hover:border-border-strong",
                inView ? "rg-rise" : "opacity-0",
              )}
              style={delay(index * 60)}
            >
              <Icon size={20} strokeWidth={1.5} className="text-muted" />
              <h3 className="mt-3 text-[15px] leading-snug font-semibold text-fg">
                {card.title}
              </h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted">
                {card.body}
              </p>
              <p className="mt-4 flex items-center gap-2 font-mono text-[10px] tracking-wider uppercase">
                <span className="text-faint">{card.label}</span>
                <span className="h-2.5 w-px bg-border" aria-hidden />
                <span className="text-muted">{card.value}</span>
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-[12.5px] text-muted">
        Read the{" "}
        <a
          href={href("docs", "policy")}
          className="rounded-sm text-accent underline underline-offset-2"
        >
          command policy
        </a>{" "}
        before you start.
      </p>
    </section>
  );
}
