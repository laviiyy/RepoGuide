import { DOCS_SECTIONS, href } from "../hooks/useRoute";
import { useInView } from "../hooks/useInView";
import { Rise } from "./Rise";
import { UrlIntake } from "./UrlIntake";

export function LandingClose({
  onSubmit,
}: {
  onSubmit: (value: string, owner: string, repo: string) => void;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.1);

  return (
    <section className="relative z-10 mx-auto w-full max-w-[1120px] px-6 pt-24 pb-16 lg:px-8 lg:pt-32">
      <div ref={ref}>
        <Rise
          show={inView}
          delay={0}
          as="p"
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-accent"
        >
          Isolated sandbox ready
        </Rise>

        <Rise
          show={inView}
          delay={60}
          as="h2"
          className="mt-4 max-w-[900px] text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-fg lg:text-[36px]"
        >
          Paste a repository. See what it is in under a minute.
        </Rise>

        <Rise
          show={inView}
          delay={120}
          as="p"
          className="mt-4 max-w-[640px] text-[14px] leading-relaxed text-muted"
        >
          RepoGuide reads the README, manifests and CI config, then proposes the
          exact commands to get it running.
        </Rise>
      </div>

      <Rise show={inView} delay={180} className="mt-8 w-full max-w-[640px]">
        <UrlIntake
          onSubmit={onSubmit}
          label="Repository URL"
          suggestion
          inputId="repo-url-close"
        />
      </Rise>

      <Rise show={inView} delay={240} className="mt-16 border-t border-border pt-6">
        <nav
          className="flex flex-wrap items-center gap-x-6 gap-y-2"
          aria-label="Documentation"
        >
          <a
            href={href("docs")}
            className="text-[12.5px] text-muted transition-colors hover:text-fg"
          >
            Docs
          </a>
          {DOCS_SECTIONS.filter((section) => section.id !== "overview").map(
            (section) => (
              <a
                key={section.id}
                href={href("docs", section.id)}
                className="text-[12.5px] text-muted transition-colors hover:text-fg"
              >
                {section.label}
              </a>
            ),
          )}
        </nav>

        <p className="mt-4 text-[12.5px] text-faint">
          RepoGuide runs approved commands only. Review the{" "}
          <a
            href={href("docs", "policy")}
            className="rounded-sm text-muted underline underline-offset-2 transition-colors hover:text-fg"
          >
            command policy
          </a>{" "}
          before you start.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-faint">
          <span className="text-muted">RepoGuide</span>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span>Firecracker MicroVM</span>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span>0ms persistence</span>
        </div>
      </Rise>
    </section>
  );
}
