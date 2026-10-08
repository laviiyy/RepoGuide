import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { MessageBubble } from "./MessageBubble";
import { EmptyState } from "./EmptyState";
import { cn } from "../lib/utils";

export function ChatView({
  onSubmit,
  onApprove,
  onReject,
}: {
  onSubmit: (text: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const session = useChatStore((s) => s.active());
  const scroller = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  const lastLength = session.messages.at(-1)?.text?.length ?? 0;

  useEffect(() => {
    if (!pinned) return;
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [session.id, session.messages.length, lastLength, pinned]);

  const onScroll = () => {
    const node = scroller.current;
    if (!node) return;
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    setPinned(distance < 64);
  };

  const jumpToLatest = () => {
    const node = scroller.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    setPinned(true);
  };

  if (session.messages.length === 0) {
    return (
      <div className="flex flex-1 overflow-y-auto">
        <EmptyState onPick={onSubmit} />
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scroller}
        onScroll={onScroll}
        className="h-full overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6">
          {session.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              status={session.status}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={jumpToLatest}
        aria-label="Scroll to latest"
        className={cn(
          "absolute bottom-4 left-1/2 flex h-7 -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 text-[11px] text-muted shadow-sm transition-all hover:text-fg",
          pinned ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100",
        )}
      >
        <ArrowDown size={12} strokeWidth={2} />
        Latest
      </button>
    </div>
  );
}
