import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, LoaderCircle } from "lucide-react";
import type { CommandBlock as Block } from "../types";
import { cn, formatDuration } from "../lib/utils";

const STATUS_LABEL: Record<Block["status"], string> = {
  queued: "Queued",
  running: "Running",
  success: "Completed",
  failed: "Failed",
};

const STATUS_TONE: Record<Block["status"], string> = {
  queued: "text-muted",
  running: "text-accent",
  success: "text-success",
  failed: "text-danger",
};

export function CommandBlock({ block }: { block: Block }) {
  const [copied, setCopied] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Follow the tail while output streams in.
  useEffect(() => {
    const node = scroller.current;
    if (node && block.status === "running") node.scrollTop = node.scrollHeight;
  }, [block.lines.length, block.status]);

  const copy = async () => {
    await navigator.clipboard.writeText(block.command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const collapsed = useMemo(() => block.lines.length > 14, [block.lines.length]);
  const [expanded, setExpanded] = useState(false);
  const hidden = collapsed && !expanded ? block.lines.length - 12 : 0;
  const visible = hidden > 0 ? block.lines.slice(hidden) : block.lines;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-terminal">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <code className="min-w-0 truncate font-mono text-[12px] text-fg">
          <span className="mr-2 select-none text-faint">$</span>
          {block.command}
        </code>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={cn("flex items-center gap-1.5 text-[11px]", STATUS_TONE[block.status])}>
            {block.status === "running" ? (
              <LoaderCircle size={11} className="animate-spin" strokeWidth={2.2} />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            )}
            {STATUS_LABEL[block.status]}
          </span>
          {typeof block.durationMs === "number" && (
            <span className="font-mono text-[10px] text-faint">
              {formatDuration(block.durationMs)}
            </span>
          )}
          {typeof block.exitCode === "number" && block.exitCode !== 0 && (
            <span className="rounded-sm border border-danger/40 px-1 font-mono text-[10px] text-danger">
              exit {block.exitCode}
            </span>
          )}
          <button
            type="button"
            onClick={copy}
            title="Copy command"
            aria-label="Copy command"
            className="flex h-6 w-6 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface-3 hover:text-fg"
          >
            {copied ? <Check size={12} strokeWidth={2.2} /> : <Copy size={12} strokeWidth={1.9} />}
          </button>
        </div>
      </div>

      {block.cwd && (
        <div className="border-b border-border/60 px-3 py-1 font-mono text-[10.5px] text-faint">
          {block.cwd}
        </div>
      )}

      <div ref={scroller} className="max-h-64 overflow-auto px-3 py-2">
        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mb-1 block w-full text-left font-mono text-[11px] text-faint hover:text-accent"
          >
            … {hidden} earlier lines hidden
          </button>
        )}
        <pre className="font-mono text-[11.5px] leading-[1.7] whitespace-pre-wrap break-words">
          {visible.map((line) => (
            <div
              key={line.id}
              className={cn(
                line.stream === "stderr" && "text-danger",
                line.stream === "info" && "text-faint",
                line.stream === "stdout" && "text-muted",
              )}
            >
              {line.text || "\u00a0"}
            </div>
          ))}
          {block.status === "running" && (
            <span className="inline-block h-3.5 w-1.5 translate-y-0.5 bg-accent align-middle" />
          )}
        </pre>
      </div>
    </div>
  );
}
