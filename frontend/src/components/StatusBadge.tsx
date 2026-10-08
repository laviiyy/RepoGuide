import type { SessionStatus } from "../types";
import { cn } from "../lib/utils";

const LABELS: Record<SessionStatus, string> = {
  idle: "Ready",
  analyzing: "Analyzing",
  awaiting_confirmation: "Needs approval",
  executing: "Running",
  done: "Done",
  failed: "Failed",
};

const TONES: Record<SessionStatus, string> = {
  idle: "text-muted",
  analyzing: "text-accent",
  awaiting_confirmation: "text-warn",
  executing: "text-accent",
  done: "text-success",
  failed: "text-danger",
};

const DOTS: Record<SessionStatus, string> = {
  idle: "bg-faint",
  analyzing: "bg-accent",
  awaiting_confirmation: "bg-warn",
  executing: "bg-accent",
  done: "bg-success",
  failed: "bg-danger",
};

export function StatusBadge({
  status,
  compact = false,
  className,
}: {
  status: SessionStatus;
  compact?: boolean;
  className?: string;
}) {
  const pulsing = status === "executing" || status === "analyzing";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium",
        TONES[status],
        className,
      )}
      title={LABELS[status]}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulsing && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
              DOTS[status],
            )}
          />
        )}
        <span className={cn("relative h-1.5 w-1.5 rounded-full", DOTS[status])} />
      </span>
      {!compact && LABELS[status]}
    </span>
  );
}
