import { GitBranch } from "lucide-react";
import { UrlIntake } from "./UrlIntake";

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[520px] min-w-0 flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-accent">
        <GitBranch size={16} strokeWidth={1.5} />
      </span>

      <div className="space-y-2">
        <h1 className="text-[15px] font-semibold tracking-tight text-fg">
          Point RepoGuide at a repository
        </h1>
        <p className="text-[13px] leading-relaxed text-muted">
          Clone any public or private repository into an isolated ephemeral
          sandbox to safely run and inspect execution commands.
        </p>
      </div>

      <UrlIntake
        className="w-full"
        inputId="repo-url-workspace"
        onSubmit={(value) => onPick(value)}
      />
    </div>
  );
}
