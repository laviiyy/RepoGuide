import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Info, Sparkles, TriangleAlert, User } from "lucide-react";
import type { Message, SessionStatus } from "../types";
import { CommandBlock } from "./CommandBlock";
import { ConfirmActions } from "./ConfirmActions";
import { cn } from "../lib/utils";

export function MessageBubble({
  message,
  status,
  onApprove,
  onReject,
}: {
  message: Message;
  status: SessionStatus;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (message.role === "user") {
    return (
      <div className="rg-in flex items-start justify-end gap-2.5">
        <div className="max-w-[85%] rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap text-fg sm:max-w-[75%]">
          {message.text}
        </div>
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-muted">
          <User size={12} strokeWidth={2} />
        </span>
      </div>
    );
  }

  return (
    <div className="rg-in flex items-start gap-2.5">
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
          message.kind === "notice" || message.kind === "error"
            ? "bg-surface-2 text-warn ring-border"
            : "bg-accent-soft text-accent ring-accent-border",
        )}
      >
        {message.kind === "notice" || message.kind === "error" ? (
          <Info size={12} strokeWidth={2} />
        ) : (
          <Sparkles size={12} strokeWidth={2} />
        )}
      </span>

      <div className="min-w-0 flex-1 space-y-3 pt-0.5">
        {message.kind === "text" &&
          (message.streaming && !message.text ? (
            <TypingDots />
          ) : (
            <div className="md text-[13px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.text ?? ""}
              </ReactMarkdown>
              {message.streaming && (
                <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-accent align-middle" />
              )}
            </div>
          ))}

        {message.kind === "notice" && (
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-[12.5px] text-muted">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text ?? ""}
            </ReactMarkdown>
          </div>
        )}

        {message.kind === "error" && (
          <div className="flex gap-2 rounded-lg border border-danger/40 bg-danger-soft px-3 py-2 text-[12.5px] text-danger">
            <TriangleAlert size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {message.kind === "plan" && message.plan && (
          <div className="overflow-hidden rounded-lg border border-border">
            <ol className="divide-y divide-border">
              {message.plan.steps.map((step, index) => (
                <li key={step.id} className="flex items-start gap-3 bg-surface-2/40 px-3 py-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 font-mono text-[10px] text-muted">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] text-fg">{step.label}</span>
                      <span className="rounded-sm border border-border px-1 font-mono text-[10px] text-faint">
                        {step.tool}
                      </span>
                    </div>
                    <code className="mt-1 block truncate font-mono text-[11.5px] text-muted">
                      {step.command}
                    </code>
                  </div>
                </li>
              ))}
            </ol>
            <div className="border-t border-border bg-surface-2 px-3 py-3">
              <ConfirmActions
                question={message.plan.question}
                enabled={status === "awaiting_confirmation"}
                onApprove={onApprove}
                onReject={onReject}
              />
            </div>
          </div>
        )}

        {message.kind === "command" && message.block && (
          <CommandBlock block={message.block} />
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Assistant is thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="rg-dot h-1.5 w-1.5 rounded-full bg-faint"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}
