export type Role = "user" | "assistant" | "system";

export type MessageKind =
  | "text"
  | "command"
  | "error"
  | "plan"
  | "notice";

export type SessionStatus =
  | "idle"
  | "analyzing"
  | "awaiting_confirmation"
  | "executing"
  | "done"
  | "failed";

export type StreamName = "stdout" | "stderr" | "info";

export interface OutputLine {
  id: string;
  stream: StreamName;
  text: string;
}

export type CommandStatus = "queued" | "running" | "success" | "failed";

export interface CommandBlock {
  id: string;
  command: string;
  cwd?: string;
  status: CommandStatus;
  exitCode?: number | null;
  lines: OutputLine[];
  durationMs?: number;
}

export interface PlanStep {
  id: string;
  label: string;
  command: string;
  tool: string;
}

export interface Message {
  id: string;
  role: Role;
  kind: MessageKind;
  text?: string;
  block?: CommandBlock;
  plan?: { steps: PlanStep[]; question: string };
  /** Assistant text still arriving token-by-token. */
  streaming?: boolean;
  ts: number;
}

export interface Session {
  id: string;
  title: string;
  owner?: string;
  repo?: string;
  status: SessionStatus;
  updatedAt: number;
  messages: Message[];
}

export type SidebarPanel = "sessions" | "logs" | "settings";
