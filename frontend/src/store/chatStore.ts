import { create } from "zustand";
import type {
  CommandBlock,
  Message,
  OutputLine,
  Session,
  SessionStatus,
  SidebarPanel,
} from "../types";
import { uid } from "../lib/utils";

const now = Date.now();
const minutesAgo = (m: number) => now - m * 60_000;

function line(stream: OutputLine["stream"], text: string): OutputLine {
  return { id: uid("ln"), stream, text };
}

/** A finished session so the sidebar and every message variant are visible. */
function demoSession(): Session {
  return {
    id: "demo-plexo",
    title: "anmolkapil/plexo",
    owner: "anmolkapil",
    repo: "plexo",
    status: "done",
    updatedAt: minutesAgo(4),
    messages: [
      {
        id: uid("m"),
        role: "user",
        kind: "text",
        text: "https://github.com/anmolkapil/plexo",
        ts: minutesAgo(9),
      },
      {
        id: uid("m"),
        role: "assistant",
        kind: "text",
        ts: minutesAgo(9),
        text: [
          "**plexo** is a download accelerator — it opens several connections to the same file and stitches the chunks back together, so a single slow connection stops being your bottleneck.",
          "",
          "It ships as a desktop app: Electron 44 + React 19 + TypeScript, built with `electron-vite`, with `webtorrent` and `koffi` (native FFI) doing the heavy lifting.",
          "",
          "Heads up: the `postinstall` script runs `patch-package` and `electron-builder install-app-deps`, which pulls ~120 MB of Electron and needs native build tools.",
        ].join("\n"),
      },
      {
        id: uid("m"),
        role: "assistant",
        kind: "plan",
        ts: minutesAgo(9),
        plan: {
          steps: [
            {
              id: uid("s"),
              label: "Clone repository (shallow)",
              command: "git clone --depth 1 https://github.com/anmolkapil/plexo src",
              tool: "git",
            },
            {
              id: uid("s"),
              label: "Install dependencies",
              command: "npm install",
              tool: "npm",
            },
            {
              id: uid("s"),
              label: "Launch the Electron app",
              command: "npm run dev",
              tool: "npm",
            },
          ],
          question:
            "Shall I clone it, install dependencies, and launch the app? This runs third-party code on your machine.",
        },
      },
      {
        id: uid("m"),
        role: "assistant",
        kind: "command",
        ts: minutesAgo(7),
        block: {
          id: uid("b"),
          command:
            "git clone --depth 1 https://github.com/anmolkapil/plexo src",
          cwd: "~/RepoGuide/projects/anmolkapil_plexo",
          status: "success",
          exitCode: 0,
          durationMs: 4200,
          lines: [
            line("info", "Cloning into 'src'..."),
            line("stdout", "remote: Enumerating objects: 412, done."),
            line(
              "stdout",
              "remote: Total 412 (delta 78), reused 331 (delta 60), pack-reused 0",
            ),
            line(
              "stdout",
              "Receiving objects: 100% (412/412), 2.14 MiB | 8.60 MiB/s, done.",
            ),
            line("stdout", "Resolving deltas: 100% (78/78), done."),
          ],
        },
      },
      {
        id: uid("m"),
        role: "assistant",
        kind: "command",
        ts: minutesAgo(4),
        block: {
          id: uid("b"),
          command: "npm install",
          cwd: "~/RepoGuide/projects/anmolkapil_plexo/src",
          status: "failed",
          exitCode: 1,
          durationMs: 186_400,
          lines: [
            line("info", "added 612 packages in 3m 6s"),
            line("stderr", "> plexo@1.0.0-rc.14 postinstall"),
            line(
              "stderr",
              "> patch-package && install-electron && electron-builder install-app-deps",
            ),
            line("stderr", ""),
            line("stderr", "gyp ERR! find VS - msvs_version not set from command line"),
            line(
              "stderr",
              "gyp ERR! stack Error: Could not find any Visual Studio installation to use",
            ),
            line("stderr", "npm ERR! code ELIFECYCLE"),
            line("stderr", "npm ERR! errno 1"),
          ],
        },
      },
      {
        id: uid("m"),
        role: "assistant",
        kind: "notice",
        ts: minutesAgo(4),
        text: "Diagnosis: `koffi` needs the MSVC toolchain to build its native binding.",
      },
      {
        id: uid("m"),
        role: "assistant",
        kind: "text",
        ts: minutesAgo(4),
        text: [
          "**What failed** — `koffi` compiles a native module during `postinstall`, and it could not find a Visual Studio C++ toolchain.",
          "",
          "**Suggested fix** — install the *Desktop development with C++* workload, then retry `npm install`. I stopped before retrying so you can review the command.",
          "",
          "Want me to run the fix and retry the install?",
        ].join("\n"),
      },
    ],
  };
}

function emptySession(): Session {
  return {
    id: uid("s"),
    title: "New session",
    status: "idle",
    updatedAt: Date.now(),
    messages: [],
  };
}

interface ChatState {
  sessions: Session[];
  activeId: string;
  sidebarOpen: boolean;
  paletteOpen: boolean;
  panel: SidebarPanel;
  dialog: "settings" | "logs" | null;

  active: () => Session;
  newSession: () => void;
  selectSession: (id: string) => void;
  setStatus: (status: SessionStatus, id?: string) => void;
  setRepo: (owner: string, repo: string, id?: string) => void;
  appendMessage: (message: Message, id?: string) => void;
  patchMessage: (
    messageId: string,
    patch: Partial<Message>,
    id?: string,
  ) => void;
  appendBlockLine: (
    messageId: string,
    output: OutputLine,
    id?: string,
  ) => void;
  patchBlock: (
    messageId: string,
    patch: Partial<CommandBlock>,
    id?: string,
  ) => void;

  toggleSidebar: (open?: boolean) => void;
  setPalette: (open: boolean) => void;
  setPanel: (panel: SidebarPanel) => void;
  setDialog: (dialog: "settings" | "logs" | null) => void;
}

const demo = demoSession();
const fresh = emptySession();

export const useChatStore = create<ChatState>((set, get) => {
  /** Apply `mutate` to one session, replacing it in the list immutably. */
  const withSession = (
    id: string | undefined,
    mutate: (session: Session) => Session,
  ) => {
    const target = id ?? get().activeId;
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === target ? { ...mutate(session), updatedAt: Date.now() } : session,
      ),
    }));
  };

  return {
    sessions: [fresh, demo],
    activeId: fresh.id,
    sidebarOpen: false,
    paletteOpen: false,
    panel: "sessions",
    dialog: null,

    active: () => {
      const { sessions, activeId } = get();
      return sessions.find((s) => s.id === activeId) ?? sessions[0]!;
    },

    newSession: () => {
      const session = emptySession();
      set((state) => ({
        sessions: [session, ...state.sessions],
        activeId: session.id,
        sidebarOpen: false,
      }));
    },

    selectSession: (id) => set({ activeId: id, sidebarOpen: false }),

    setStatus: (status, id) => withSession(id, (s) => ({ ...s, status })),

    setRepo: (owner, repo, id) =>
      withSession(id, (s) => ({ ...s, owner, repo, title: `${owner}/${repo}` })),

    appendMessage: (message, id) =>
      withSession(id, (s) => ({ ...s, messages: [...s.messages, message] })),

    patchMessage: (messageId, patch, id) =>
      withSession(id, (s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === messageId ? { ...m, ...patch } : m,
        ),
      })),

    appendBlockLine: (messageId, output, id) =>
      withSession(id, (s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === messageId && m.block
            ? { ...m, block: { ...m.block, lines: [...m.block.lines, output] } }
            : m,
        ),
      })),

    patchBlock: (messageId, patch, id) =>
      withSession(id, (s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === messageId && m.block
            ? { ...m, block: { ...m.block, ...patch } }
            : m,
        ),
      })),

    toggleSidebar: (open) =>
      set((state) => ({ sidebarOpen: open ?? !state.sidebarOpen })),

    setPalette: (paletteOpen) => set({ paletteOpen }),

    setPanel: (panel) => set({ panel }),

    setDialog: (dialog) => set({ dialog }),
  };
});
