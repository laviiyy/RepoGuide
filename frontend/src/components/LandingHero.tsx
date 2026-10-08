import type { CSSProperties } from "react";
import { UrlIntake } from "./UrlIntake";

/** stagger(step=60ms) — entrance delays for the hero column. */
const delay = (ms: number) => ({ "--rg-delay": `${ms}ms` }) as CSSProperties;

export function LandingHero({
  onSubmit,
}: {
  onSubmit: (value: string, owner: string, repo: string) => void;
}) {
  return (
    <section className="relative z-10 mx-auto w-full max-w-[1120px] px-6 pt-[104px] text-center lg:px-8">
      <div
        className="rg-rise inline-flex items-center rounded-full border border-accent-border bg-accent-soft px-3 py-1"
        style={delay(0)}
      >
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
          repo -&gt; understood -&gt; running
        </span>
      </div>

      <h1
        className="rg-rise mx-auto mt-8 mb-6 max-w-[920px] text-[40px] leading-[1.05] font-semibold tracking-[-0.02em] text-fg sm:text-[48px] lg:text-[56px]"
        style={delay(60)}
      >
        Understand any repository before you{" "}
        <span className="text-accent">run</span> it.
      </h1>

      <p
        className="rg-rise mx-auto mb-10 max-w-[640px] text-[16px] leading-[1.6] text-muted"
        style={delay(120)}
      >
        Paste a GitHub URL. RepoGuide explains what the project is, why it
        exists, and how to get it running — proposing every command for your
        approval first.
      </p>

      <div className="rg-rise mx-auto mb-3 w-full max-w-[640px]" style={delay(180)}>
        <UrlIntake onSubmit={onSubmit} suggestion />
      </div>

      <p
        className="rg-rise mt-12 text-[12px] text-faint select-none"
        style={delay(240)}
      >
        Clones into an isolated sandbox · Nothing runs without your approval ·
        Public and private repos
      </p>

      {/* Fold continuity: a single hairline fading out at both ends. */}
      <div
        className="flex h-24 items-center justify-center"
        aria-hidden="true"
      >
        <div className="h-12 w-px bg-gradient-to-b from-transparent via-border-strong to-transparent" />
      </div>
    </section>
  );
}
