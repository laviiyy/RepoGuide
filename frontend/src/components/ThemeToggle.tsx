import { Monitor, Moon, Sun } from "lucide-react";
import type { ThemeChoice } from "../hooks/useTheme";

const ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

export function ThemeToggle({
  theme,
  onCycle,
}: {
  theme: ThemeChoice;
  onCycle: () => void;
}) {
  const Icon = ICONS[theme];
  const label =
    theme === "light" ? "Light theme" : theme === "dark" ? "Dark theme" : "System theme";

  return (
    <button
      type="button"
      onClick={onCycle}
      title={`${label} — click to switch`}
      aria-label={`Theme: ${label}. Switch theme`}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted transition-colors hover:border-border hover:bg-surface-2 hover:text-fg"
    >
      <Icon size={15} strokeWidth={1.8} />
    </button>
  );
}
