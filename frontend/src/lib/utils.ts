import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** "3m ago", "2h ago" — compact relative time for the session list. */
export function relativeTime(ts: number, now = Date.now()) {
  const seconds = Math.max(1, Math.round((now - ts) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

export const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export const GITHUB_URL_RE =
  /(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/;

/**
 * Reads `owner/repo` out of whatever was pasted — a full URL, `github.com/o/r`
 * or a bare `o/r`. Returns null when the input is not a repository yet, which
 * is what keeps the intake's Analyze button disabled.
 */
export function parseRepoInput(value: string) {
  const trimmed = value.trim();
  const fromUrl = trimmed.match(GITHUB_URL_RE);
  const short = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  const match = fromUrl ?? short;
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}
