import { useEffect } from "react";
import { CornerDownLeft } from "lucide-react";

export function ConfirmActions({
  question,
  enabled,
  onApprove,
  onReject,
}: {
  question: string;
  enabled: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "y" || event.key === "Y") {
        event.preventDefault();
        onApprove();
      } else if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        onReject();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, onApprove, onReject]);

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-muted">{question}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onApprove}
          disabled={!enabled}
          className="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-[12.5px] font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CornerDownLeft size={13} strokeWidth={2.1} />
          Yes, proceed
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={!enabled}
          className="rounded-md border border-border px-3 py-1.5 text-[12.5px] text-muted transition-colors hover:border-border-strong hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
        >
          No, cancel
        </button>
        {enabled && (
          <span className="font-mono text-[10.5px] text-faint">
            Y / N
          </span>
        )}
      </div>
    </div>
  );
}
