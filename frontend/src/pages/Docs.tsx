import { useEffect, useRef, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { BackgroundLayers } from "../components/BackgroundLayers";
import { SiteHeader } from "../components/SiteHeader";
import {
  DOCS_SECTIONS,
  consumePendingScroll,
  goToSection,
  href,
  scrollToId,
  useRoute,
} from "../hooks/useRoute";
import type { ThemeChoice } from "../hooks/useTheme";
import { cn } from "../lib/utils";

export function Docs({
  theme,
  onCycleTheme,
}: {
  theme: ThemeChoice;
  onCycleTheme: () => void;
}) {
  const route = useRoute();

  // Jumping between sections is driven by the route (each section is its own
  // hash), so back/forward and pasted links land in the right place.
  const entered = useRef(false);
  useEffect(() => {
    const intent = consumePendingScroll();
    const section = intent ?? (route.name === "docs" ? route.section : "overview");
    if (section === "overview") {
      // The second effect pass StrictMode makes must not undo a jump.
      if (!entered.current) window.scrollTo(0, 0);
    } else {
      scrollToId(section);
    }
    entered.current = true;
  }, [route]);

  return (
    <div className="relative min-h-full">
      <BackgroundLayers />
      <SiteHeader theme={theme} onCycleTheme={onCycleTheme} />

      <div className="relative z-10 mx-auto w-full max-w-[1120px] px-6 py-16 lg:px-8">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
          Documentation
        </p>
        <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.02em] text-fg lg:text-[36px]">
          How RepoGuide is allowed to work.
        </h1>
        <p className="mt-4 max-w-[768px] text-[14px] leading-relaxed text-muted">
          RepoGuide reads a repository, explains it, proposes an ordered plan and
          runs each command only after you approve it. These pages cover what it
          supports, what it refuses to do, and what it writes down.
        </p>

        <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:gap-16">
          <nav
            aria-label="Documentation sections"
            className="lg:sticky lg:top-20 lg:h-fit lg:w-[220px] lg:shrink-0"
          >
            <ul className="space-y-0.5">
              {DOCS_SECTIONS.map((section) => {
                const current =
                  route.name === "docs" && route.section === section.id;
                return (
                  <li key={section.id}>
                    <a
                      href={href("docs", section.id)}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "block border-l-2 py-1.5 pl-3 text-[13px] transition-colors",
                        current
                          ? "border-accent text-fg"
                          : "border-border text-muted hover:text-fg",
                      )}
                    >
                      {section.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={() => goToSection("landing", "process")}
              className="mt-6 inline-flex items-center gap-1 text-[12.5px] text-muted transition-colors hover:text-fg"
            >
              How it works
              <ArrowUpRight size={13} strokeWidth={1.8} />
            </button>
          </nav>

          <div className="min-w-0 max-w-[768px] flex-1 space-y-16">
            <Section id="overview" title="Overview">
              <p>
                Everything happens in a disposable MicroVM. RepoGuide clones the
                repository there, reads it, and hands you a plan; your machine is
                never the target of a command.
              </p>
              <ol className="space-y-3">
                {[
                  [
                    "Point at a repository",
                    "Paste a public or private GitHub URL. Nothing is cloned to your workstation.",
                  ],
                  [
                    "Read the intent",
                    "README, manifests, CI config and commit history, summarised as what the project is and what it needs.",
                  ],
                  [
                    "Get an ordered plan",
                    "Runtime version, package manager, install, migrate, run — with the reason for each step.",
                  ],
                  [
                    "Approve and watch",
                    "Each command is shown first. Output streams live and a failure comes back with one specific fix.",
                  ],
                ].map(([title, body], index) => (
                  <li key={title} className="flex gap-3">
                    <span className="mt-0.5 font-mono text-[11px] tabular-nums text-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-medium text-fg">
                        {title}
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-muted">
                        {body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              <p>
                Ready to try it?{" "}
                <a
                  href={href("workspace")}
                  className="rounded-sm text-accent underline underline-offset-2"
                >
                  Open the workspace
                </a>{" "}
                and paste a URL.
              </p>
            </Section>

            <Section id="stacks" title="Supported stacks">
              <p>
                The plan comes from the project's own manifests and CI config, so
                unusual toolchains are read from the repository. These are the
                combinations that are verified end to end in the sandbox.
              </p>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-2">
                      <Th>Runtime</Th>
                      <Th>Toolchain</Th>
                      <Th>Typical steps</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {STACKS.map((row) => (
                      <tr key={row[0]} className="border-t border-border">
                        <Td className="whitespace-nowrap text-fg">{row[0]}</Td>
                        <Td className="whitespace-nowrap text-muted">{row[1]}</Td>
                        <Td className="font-mono text-[12px] text-muted">
                          {row[2]}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Anything outside this list still works: RepoGuide proposes the
                project's own commands instead of guessing, and shows you the
                reasoning before it runs anything.
              </p>
            </Section>

            <Section id="policy" title="Command policy">
              <p>
                Approval is per command, and the policy is checked before a
                command reaches the sandbox. A blocked pattern cannot be approved
                — not even by you.
              </p>
              <PolicyList tone="allow" title="Allowed" items={ALLOWED} />
              <PolicyList tone="block" title="Blocked — non-overridable" items={BLOCKED} />
              <p>
                RepoGuide never bundles a plan into one consent, and it never
                retries a failed command without showing you the new one first.
                Read-only git, test, build and lint commands run in the sandbox;
                anything that would touch your host is refused.
              </p>
            </Section>

            <Section id="logs" title="Session logs">
              <p>
                Every session appends a JSONL log at{" "}
                <code className="rounded-sm border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-fg">
                  ~/RepoGuide/sessions/&lt;session-id&gt;.jsonl
                </code>
                . One object per event, no rewriting, hashed at close.
              </p>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-2">
                      <Th>Field</Th>
                      <Th>Meaning</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {LOG_FIELDS.map((row) => (
                      <tr key={row[0]} className="border-t border-border">
                        <Td className="whitespace-nowrap font-mono text-[12px] text-fg">
                          {row[0]}
                        </Td>
                        <Td className="text-[13px] text-muted">{row[1]}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-border bg-terminal px-4 py-3 font-mono text-[11.5px] leading-relaxed text-terminal-fg">
                {`{"ts":"2026-03-04T09:12:41.208Z","session":"s_8a1c","phase":"command","command":"bun install --frozen-lockfile","exit":1,"actor":"repoguide"}
{"ts":"2026-03-04T09:12:41.410Z","session":"s_8a1c","phase":"approval","command":"bun add -D @img/sharp-linux-x64","exit":null,"actor":"you"}`}
              </pre>
              <p>
                Open the log from the workspace sidebar footer, or with the
                command palette: ⌘K → View session log.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

const STACKS: [string, string, string][] = [
  ["Node.js 20 / 22", "npm · pnpm · yarn", "npm ci → npm run build → npm start"],
  ["Bun 1.1.x", "bun", "bun install --frozen-lockfile → bun dev"],
  ["Python 3.10–3.13", "pip · uv · poetry", "uv sync → pytest"],
  ["Rust 1.78+", "cargo", "cargo build --release"],
  ["Go 1.22+", "go modules", "go build ./... → go test ./..."],
  ["Docker", "compose v2", "docker compose up -d"],
  ["Make / CMake", "system toolchain", "make"],
  ["Prebuilt releases", "platform binary", "./install.sh --prefix ~/.local"],
];

const ALLOWED = [
  "Read-only git: clone, log, status, show",
  "Package installs inside the sandbox",
  "Dev servers bound to the sandbox loopback",
  "Test, build and lint commands",
  "File reads inside /workspace",
];

const BLOCKED = [
  "Recursive deletes outside the project directory",
  "Force pushes and history rewrites",
  "Credential reads: ~/.ssh, ~/.aws, keychain",
  "sudo and host package-manager writes",
  "Piping a remote script into a shell",
  "Outbound transfer of your files",
  "Mounting your host filesystem",
];

const LOG_FIELDS: [string, string][] = [
  ["ts", "ISO-8601 timestamp of the event"],
  ["session", "session id the event belongs to"],
  ["phase", "analysis · command · approval · diagnosis"],
  ["command", "the exact argv that was proposed or run"],
  ["exit", "exit code, or null while awaiting approval"],
  ["actor", "repoguide (proposed) or you (approved)"],
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <h2 className="text-[20px] font-semibold tracking-[-0.015em] text-fg">
        {title}
      </h2>
      <div className="space-y-3 text-[13.5px] leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}

function PolicyList({
  tone,
  title,
  items,
}: {
  tone: "allow" | "block";
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p
        className={cn(
          "font-mono text-[10px] font-medium uppercase tracking-wider",
          tone === "allow" ? "text-success" : "text-danger",
        )}
      >
        {title}
      </p>
      <ul className="mt-3 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-[13px] text-muted">
            <span
              className={cn(
                "mt-[7px] h-1 w-1 shrink-0 rounded-full",
                tone === "allow" ? "bg-success" : "bg-danger",
              )}
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-faint">
      {children}
    </th>
  );
}

function Td({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <td className={cn("px-4 py-2.5 align-top text-[13px]", className)}>
      {children}
    </td>
  );
}
