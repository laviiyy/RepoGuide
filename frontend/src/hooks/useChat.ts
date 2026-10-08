import { useCallback, useEffect, useRef } from "react";
import { useChatStore } from "../store/chatStore";
import type { Message, OutputLine, PlanStep, StreamName } from "../types";
import { GITHUB_URL_RE, uid } from "../lib/utils";

/*
 * Simulated engine.
 *
 * The FastAPI backend does not exist yet, so this drives the UI with the same
 * event shapes the WebSocket will emit (assistant_text, plan, step_start,
 * stdout, stderr, done). Swapping it for a real socket means replacing the
 * `run()` body with send/receive on `/ws/{session_id}` — the components never
 * read anything but the store.
 */

type Scripted = { stream: StreamName; text: string; delay: number };

const timers = new Set<number>();
let cancelled = false;

function wait(delay: number) {
  return new Promise<void>((resolve) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      resolve();
    }, delay);
    timers.add(id);
  });
}

function clearTimers() {
  timers.forEach((id) => window.clearTimeout(id));
  timers.clear();
}

function streamLine(stream: StreamName, text: string): OutputLine {
  return { id: uid("ln"), stream, text };
}

function explanation(owner: string, repo: string): string {
  return [
    `**${owner}/${repo}** is a download accelerator — it opens several connections to the same file and stitches the chunks back together, so one slow connection stops being your bottleneck.`,
    "",
    `It ships as a desktop app: **Electron 44 + React 19 + TypeScript**, built with \`electron-vite\`, with \`webtorrent\` and \`koffi\` (native FFI) doing the heavy lifting.`,
    "",
    "Two things worth knowing before we run it: `postinstall` pulls ~120 MB of Electron, and `koffi` compiles a native binding, so it needs a C++ toolchain.",
  ].join("\n");
}

function plan(): { steps: PlanStep[]; question: string } {
  return {
    steps: [
      {
        id: uid("s"),
        label: "Clone repository (shallow)",
        command: `git clone --depth 1 https://github.com/anmolkapil/plexo src`,
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
  };
}

const INSTALL_SCRIPT: Scripted[] = [
  { stream: "info", text: "npm install", delay: 260 },
  { stream: "stdout", text: "npm warn deprecated node-domexception@1.0.0", delay: 320 },
  { stream: "stdout", text: "added 612 packages in 3m 6s", delay: 520 },
  { stream: "stderr", text: "> plexo@1.0.0-rc.14 postinstall", delay: 240 },
  { stream: "stderr", text: "> patch-package && install-electron", delay: 200 },
  { stream: "stderr", text: "gyp ERR! find VS - msvs_version not set", delay: 420 },
  {
    stream: "stderr",
    text: "gyp ERR! stack Error: Could not find any Visual Studio installation to use",
    delay: 300,
  },
  { stream: "stderr", text: "npm ERR! code ELIFECYCLE", delay: 200 },
];

export function useChat() {
  const streamingRef = useRef(false);

  useEffect(() => clearTimers, []);

  const streamText = useCallback(
    async (messageId: string, body: string) => {
      const store = useChatStore.getState();
      const tokens = body.split(/(\s+)/);
      let accumulated = "";

      for (let i = 0; i < tokens.length; i++) {
        if (cancelled) break;
        accumulated += tokens[i];
        store.patchMessage(messageId, { text: accumulated });
        await wait(i % 3 === 0 ? 26 : 14);
      }

      useChatStore.getState().patchMessage(messageId, { streaming: false });
    },
    [],
  );

  const pushAssistant = useCallback((message: Message) => {
    useChatStore.getState().appendMessage(message);
    return message.id;
  }, []);

  const run = useCallback(
    async (question: string, owner?: string, repo?: string) => {
      if (streamingRef.current) return;
      streamingRef.current = true;
      cancelled = false;

      const store = useChatStore.getState();
      store.appendMessage({
        id: uid("m"),
        role: "user",
        kind: "text",
        text: question,
        ts: Date.now(),
      });

      const match = question.match(GITHUB_URL_RE);
      const o = owner ?? match?.[1] ?? "anmolkapil";
      const r = repo ?? match?.[2]?.replace(/\.git$/, "") ?? "plexo";

      store.setRepo(o, r);
      store.setStatus("analyzing");

      const thinkingId = pushAssistant({
        id: uid("m"),
        role: "assistant",
        kind: "text",
        text: "Reading the repository…",
        streaming: true,
        ts: Date.now(),
      });
      await wait(600);

      if (cancelled) return;
      useChatStore.getState().patchMessage(thinkingId, { text: "" });
      await streamText(thinkingId, explanation(o, r));

      if (cancelled) return;
      await wait(220);
      pushAssistant({
        id: uid("m"),
        role: "assistant",
        kind: "plan",
        plan: plan(),
        ts: Date.now(),
      });
      useChatStore.getState().setStatus("awaiting_confirmation");
      streamingRef.current = false;
    },
    [pushAssistant, streamText],
  );

  const approve = useCallback(async () => {
    if (streamingRef.current) return;
    streamingRef.current = true;
    cancelled = false;

    const store = useChatStore.getState();
    const blockId = uid("b");
    const messageId = pushAssistant({
      id: uid("m"),
      role: "assistant",
      kind: "command",
      ts: Date.now(),
      block: {
        id: blockId,
        command: "npm install",
        cwd: "~/RepoGuide/projects/anmolkapil_plexo/src",
        status: "running",
        lines: [],
      },
    });

    store.setStatus("executing");
    const started = Date.now();

    for (const step of INSTALL_SCRIPT) {
      if (cancelled) break;
      await wait(step.delay);
      useChatStore
        .getState()
        .appendBlockLine(messageId, streamLine(step.stream, step.text));
    }

    if (cancelled) return;

    useChatStore.getState().patchBlock(messageId, {
      status: "failed",
      exitCode: 1,
      durationMs: Date.now() - started,
    });

    pushAssistant({
      id: uid("m"),
      role: "assistant",
      kind: "notice",
      text: "Diagnosis: `koffi` needs the MSVC toolchain to build its native binding.",
      ts: Date.now(),
    });
    await wait(200);

    const replyId = pushAssistant({
      id: uid("m"),
      role: "assistant",
      kind: "text",
      text: "",
      streaming: true,
      ts: Date.now(),
    });
    await streamText(
      replyId,
      [
        "**What failed** — `koffi` compiles a native module during `postinstall`, and no Visual Studio C++ toolchain was found.",
        "",
        "**Suggested fix** — install the *Desktop development with C++* workload, then retry `npm install`. I stopped before retrying so you can review the command.",
        "",
        "Want me to run the fix and retry the install?",
      ].join("\n"),
    );

    useChatStore.getState().setStatus("failed");
    streamingRef.current = false;
  }, [pushAssistant, streamText]);

  const reject = useCallback(async () => {
    cancelled = true;
    clearTimers();
    streamingRef.current = false;
    useChatStore.getState().setStatus("idle");
    const id = pushAssistant({
      id: uid("m"),
      role: "assistant",
      kind: "text",
      text: "",
      streaming: true,
      ts: Date.now(),
    });
    await streamText(
      id,
      "No problem — nothing was downloaded or executed. Paste another repo URL whenever you're ready.",
    );
  }, [pushAssistant, streamText]);

  const cancel = useCallback(() => {
    cancelled = true;
    clearTimers();
    streamingRef.current = false;
    useChatStore.getState().setStatus("idle");
    pushAssistant({
      id: uid("m"),
      role: "assistant",
      kind: "notice",
      text: "Cancelled. Running processes were stopped.",
      ts: Date.now(),
    });
  }, [pushAssistant]);

  return { run, approve, reject, cancel };
}
