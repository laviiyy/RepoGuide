import { useEffect, useRef, useState } from "react";
import { ArrowUp, ShieldAlert, Square } from "lucide-react";
import { cn, isMac } from "../lib/utils";

export function Composer({
  status,
  onSubmit,
  onCancel,
}: {
  status: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const busy = status === "executing" || status === "analyzing";

  useEffect(() => {
    const node = input.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 180)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || busy) return;
    onSubmit(text);
    setValue("");
  };

  return (
    <div className="shrink-0 border-t border-border bg-canvas px-4 pb-4 pt-3">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-end gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-2 transition-colors focus-within:border-border-strong">
          <textarea
            id="composer-input"
            ref={input}
            rows={1}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder={
              busy
                ? "Working… press Stop to interrupt"
                : "Paste a GitHub repository URL…"
            }
            className="max-h-[180px] flex-1 resize-none bg-transparent py-1.5 text-[13px] leading-relaxed text-fg outline-none placeholder:text-faint"
          />

          {busy ? (
            <button
              type="button"
              onClick={onCancel}
              className="flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-[12px] text-muted transition-colors hover:border-danger/50 hover:text-danger"
            >
              <Square size={11} strokeWidth={2.4} />
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim()}
              aria-label="Send"
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                value.trim()
                  ? "bg-accent text-accent-fg hover:bg-accent-hover"
                  : "bg-surface-3 text-faint",
              )}
            >
              <ArrowUp size={14} strokeWidth={2.2} />
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 px-0.5">
          <span className="flex items-center gap-1.5 text-[10.5px] text-faint">
            <ShieldAlert size={11} strokeWidth={1.9} />
            Commands run locally under ~/RepoGuide and always ask first.
          </span>
          <span className="hidden font-mono text-[10.5px] text-faint sm:block">
            {isMac ? "↵ send · ⇧↵ newline" : "Enter send · Shift+Enter newline"}
          </span>
        </div>
      </div>
    </div>
  );
}
