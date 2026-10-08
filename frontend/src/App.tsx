import { useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import { useChat } from "./hooks/useChat";
import { useRoute } from "./hooks/useRoute";
import { useChatStore } from "./store/chatStore";
import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar";
import { ChatView } from "./components/ChatView";
import { Composer } from "./components/Composer";
import { CommandPalette } from "./components/CommandPalette";
import { SettingsDialog } from "./components/SettingsDialog";
import { LogsDialog } from "./components/LogsDialog";
import { Landing } from "./pages/Landing";
import { Docs } from "./pages/Docs";

function App() {
  const { theme, setTheme, cycleTheme } = useTheme();
  const { run, approve, reject, cancel } = useChat();
  const route = useRoute();

  const session = useChatStore((s) => s.active());
  const dialog = useChatStore((s) => s.dialog);
  const setDialog = useChatStore((s) => s.setDialog);
  const setPalette = useChatStore((s) => s.setPalette);
  const paletteOpen = useChatStore((s) => s.paletteOpen);

  const inWorkspace = route.name === "workspace";

  // Global Cmd/Ctrl+K opens the palette — in the workspace, where it lives.
  useEffect(() => {
    if (!inWorkspace) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(!paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inWorkspace, paletteOpen, setPalette]);

  if (route.name === "landing") {
    return <Landing theme={theme} onCycleTheme={cycleTheme} onRun={run} />;
  }

  if (route.name === "docs") {
    return <Docs theme={theme} onCycleTheme={cycleTheme} />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-canvas text-fg">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar theme={theme} onCycleTheme={cycleTheme} />
        <ChatView onSubmit={run} onApprove={approve} onReject={reject} />
        <Composer status={session.status} onSubmit={run} onCancel={cancel} />
      </main>

      <CommandPalette onToggleTheme={cycleTheme} />
      {dialog === "settings" && (
        <SettingsDialog
          theme={theme}
          setTheme={setTheme}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "logs" && <LogsDialog onClose={() => setDialog(null)} />}
    </div>
  );
}

export default App;
