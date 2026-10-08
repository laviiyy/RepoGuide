import type { ThemeChoice } from "../hooks/useTheme";
import { Modal } from "./Modal";
import { cn } from "../lib/utils";

const CONFIG = [
  ["LLM model", "kimi-k3"],
  ["LLM base url", "https://api.moonshot.cn/v1"],
  ["Projects dir", "~/RepoGuide/projects"],
  ["Command timeout", "300s"],
  ["Max retries", "3"],
] as const;

const THEMES: ThemeChoice[] = ["light", "dark", "system"];

export function SettingsDialog({
  theme,
  setTheme,
  onClose,
}: {
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Settings"
      description="Values come from config.py / .env — secrets are never sent to the browser."
      onClose={onClose}
    >
      <div className="space-y-4">
        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
            Appearance
          </h3>
          <div className="inline-flex rounded-md border border-border p-0.5">
            {THEMES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-[12px] capitalize transition-colors",
                  theme === option
                    ? "bg-surface-3 text-fg"
                    : "text-muted hover:text-fg",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
            Runtime
          </h3>
          <dl className="divide-y divide-border overflow-hidden rounded-md border border-border">
            {CONFIG.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 px-3 py-2"
              >
                <dt className="text-[12.5px] text-muted">{label}</dt>
                <dd className="truncate font-mono text-[11.5px] text-fg">{value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 px-3 py-2">
              <dt className="text-[12.5px] text-muted">GitHub token</dt>
              <dd className="font-mono text-[11.5px] text-faint">
                not set · 60 req/hr
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </Modal>
  );
}
