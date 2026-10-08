import { useChatStore } from "../store/chatStore";
import { Modal } from "./Modal";

/**
 * Mirrors the planned `logs/session_*.jsonl` shape: one JSON object per line
 * with { ts, type, payload }. Until the backend lands it is derived from the
 * in-memory transcript.
 */
export function LogsDialog({ onClose }: { onClose: () => void }) {
  const session = useChatStore((s) => s.active());

  const entries = session.messages.flatMap((message) => {
    const rows = [
      {
        ts: new Date(message.ts).toISOString(),
        type: message.kind === "text" ? "assistant_text" : message.kind,
        payload: message.text ?? message.plan?.question ?? message.block?.command,
      },
    ];
    for (const line of message.block?.lines ?? []) {
      rows.push({ ts: new Date(message.ts).toISOString(), type: line.stream, payload: line.text });
    }
    return rows;
  });

  return (
    <Modal
      title="Session log"
      description={
        session.owner
          ? `session_${session.owner}_${session.repo}.jsonl · ${entries.length} entries`
          : `${entries.length} entries`
      }
      onClose={onClose}
      width="max-w-2xl"
    >
      {entries.length === 0 ? (
        <p className="py-6 text-center text-[12.5px] text-faint">
          Nothing logged yet — start a session to record commands and output.
        </p>
      ) : (
        <div className="space-y-1 font-mono text-[11px] leading-relaxed break-words">
          {entries.map((entry, index) => (
            <div key={index} className="rounded-sm px-1 py-0.5 hover:bg-surface-2">
              <span className="text-faint">{entry.ts}</span>{" "}
              <span className="text-accent">{entry.type}</span>{" "}
              <span className="text-muted">{entry.payload}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
