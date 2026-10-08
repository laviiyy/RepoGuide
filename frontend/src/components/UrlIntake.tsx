import { useState } from "react";
import { cn, parseRepoInput } from "../lib/utils";

export const SAMPLE_REPO = "anmolkapil/plexo";

/**
 * The single entry point into RepoGuide: a 56px bar with a GitHub glyph, a mono
 * input and a 36px accent button. Submitting hands the raw text to the engine —
 * it accepts a URL, `github.com/owner/repo` or a bare `owner/repo`.
 */
export function UrlIntake({
  onSubmit,
  label = "GitHub Repository URL",
  suggestion = false,
  className,
  inputId = "repo-url-input",
}: {
  onSubmit: (value: string, owner: string, repo: string) => void;
  label?: string;
  suggestion?: boolean;
  className?: string;
  inputId?: string;
}) {
  const [value, setValue] = useState("");
  const parsed = parseRepoInput(value);

  const submit = () => {
    if (!parsed) return;
    onSubmit(value.trim(), parsed.owner, parsed.repo);
    setValue("");
  };

  return (
    <div className={className}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="flex h-14 items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 p-2 transition-colors focus-within:border-accent/80 hover:border-border-strong">
          <div className="flex min-w-0 flex-1 items-center gap-3.5 pl-2.5">
            <svg
              className="h-5 w-5 shrink-0 text-faint"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 2C5.58 2 2 5.58 2 10c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0018 10c0-4.42-3.58-8-8-8z" />
            </svg>

            <label htmlFor={inputId} className="sr-only">
              {label}
            </label>
            <input
              id={inputId}
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="github.com/owner/repo"
              spellCheck={false}
              autoComplete="off"
              className="w-full min-w-0 border-none bg-transparent p-0 font-mono text-[13px] leading-normal text-fg placeholder:text-faint focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!parsed}
            className={cn(
              "h-9 shrink-0 whitespace-nowrap rounded-md bg-accent px-4 text-[13px] font-semibold text-accent-fg transition-opacity",
              parsed ? "hover:opacity-90" : "cursor-not-allowed opacity-40",
            )}
          >
            Analyze
          </button>
        </div>
      </form>

      {suggestion && (
        <div className="pt-1.5 text-left">
          <span className="font-mono text-[11px] text-faint">
            Try:{" "}
            <button
              type="button"
              onClick={() => setValue(SAMPLE_REPO)}
              className="rounded-sm text-muted underline underline-offset-2 transition-colors hover:text-fg"
            >
              {SAMPLE_REPO}
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
