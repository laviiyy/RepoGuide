#!/usr/bin/env node
/**
 * Capture the README screenshots from a running app.
 *
 * Usage:
 *   node tools/capture-screenshots.mjs [outputDir]
 *
 * Requirements:
 *   - the app served at APP_URL (default http://127.0.0.1:5173 — `npm run dev` in frontend/)
 *   - a Chromium browser (CHROME_PATH overrides the default Windows locations)
 *
 * Everything is driven over the Chrome DevTools Protocol, so there is no
 * dependency to install: the script spawns the browser on a private profile,
 * sets a viewport, emulates the colour scheme the app reads, navigates by hash,
 * scrolls to a named anchor and writes a PNG.
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const APP_URL = process.env.APP_URL ?? "http://127.0.0.1:5173";
const PORT = Number(process.env.CDP_PORT ?? 9333);
const OUT_DIR = process.argv[2] ?? "docs/screenshots";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false };
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 3, mobile: true };

/**
 * Shots run top to bottom. `target` is either a css id to sit 24px below the
 * sticky header, the literal "top" or the literal "bottom".
 */
const SHOTS = [
  {
    file: "01-landing-hero-dark.png",
    hash: "#/",
    theme: "dark",
    target: "top",
    note: "hero, eyebrow, headline, URL intake",
  },
  {
    file: "02-landing-process-dark.png",
    hash: "#/",
    theme: "dark",
    target: "process",
    note: "four-step rail + first two steps",
  },
  {
    file: "03-landing-live-session-dark.png",
    hash: "#/",
    theme: "dark",
    target: "session-frame",
    note: "live session frame, approval card",
  },
  {
    file: "04-landing-safety-dark.png",
    hash: "#/",
    theme: "dark",
    target: "safety",
    note: "safety grid",
  },
  {
    file: "05-landing-close-dark.png",
    hash: "#/",
    theme: "dark",
    target: "bottom",
    note: "close section + footer strip",
  },
  {
    file: "06-workspace-plan-dark.png",
    hash: "#/workspace",
    theme: "dark",
    target: "top",
    prepare: "open-demo-session",
    scrollTranscript: "top",
    note: "workspace: explanation, plan, approval",
  },
  {
    file: "07-workspace-terminal-dark.png",
    hash: "#/workspace",
    theme: "dark",
    target: "top",
    prepare: "open-demo-session",
    scrollTranscript: "bottom",
    note: "workspace: terminal output, diagnosis",
  },
  {
    file: "08-docs-command-policy-dark.png",
    hash: "#/docs/policy",
    theme: "dark",
    target: "top",
    note: "docs route: command policy",
  },
  {
    file: "09-landing-hero-light.png",
    hash: "#/",
    theme: "light",
    target: "top",
    note: "light palette is a token swap",
  },
  {
    file: "10-boot-screen-dark.png",
    hash: "#/",
    theme: "dark",
    target: "top",
    freezeBoot: true,
    note: "inline boot screen",
  },
  {
    file: "11-mobile-landing-dark.png",
    hash: "#/",
    theme: "dark",
    target: "top",
    viewport: MOBILE,
    note: "responsive: landing at 390px",
  },
  {
    file: "12-mobile-workspace-dark.png",
    hash: "#/workspace",
    theme: "dark",
    target: "top",
    viewport: MOBILE,
    prepare: "open-demo-session",
    scrollTranscript: "bottom",
    note: "responsive: workspace at 390px",
  },
];

/* ------------------------------------------------------------------ CDP glue */

class Cdp {
  #ws;
  #id = 0;
  #pending = new Map();
  #events = new Map();

  static async attach(port) {
    const list = await waitForJson(`http://127.0.0.1:${port}/json/list`);
    const page = list.find((target) => target.type === "page");
    if (!page) throw new Error("no page target from the browser");
    const cdp = new Cdp();
    await cdp.#connect(page.webSocketDebuggerUrl);
    return cdp;
  }

  async #connect(url) {
    this.#ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      this.#ws.addEventListener("open", resolve, { once: true });
      this.#ws.addEventListener("error", reject, { once: true });
    });
    this.#ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.#pending.has(message.id)) {
        const { resolve, reject } = this.#pending.get(message.id);
        this.#pending.delete(message.id);
        message.error
          ? reject(new Error(`${message.error.message} (${JSON.stringify(message.error.data ?? "")})`))
          : resolve(message.result);
        return;
      }
      const listeners = this.#events.get(message.method);
      if (listeners) listeners.forEach((listener) => listener(message.params));
    });
  }

  send(method, params = {}) {
    const id = ++this.#id;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.#ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.#pending.delete(id)) reject(new Error(`${method} timed out`));
      }, 30_000);
    });
  }

  once(method, timeoutMs = 10_000) {
    return new Promise((resolve, reject) => {
      const listeners = this.#events.get(method) ?? [];
      const listener = (params) => {
        this.#events.set(method, listeners.filter((entry) => entry !== listener));
        resolve(params);
      };
      this.#events.set(method, [...listeners, listener]);
      setTimeout(() => reject(new Error(`${method} never fired`)), timeoutMs);
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? "evaluate failed");
    }
    return result.result.value;
  }

  async setViewport({ width, height, deviceScaleFactor, mobile }) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor,
      mobile,
      screenWidth: width,
      screenHeight: height,
    });
  }

  async setColorScheme(value) {
    await this.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-color-scheme", value }],
    });
  }

  close() {
    this.#ws.close();
  }
}

/* ------------------------------------------------------------------- helpers */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** True when two URLs differ only by hash. */
function sameDocument(next, current) {
  if (!current) return false;
  return next.replace(/#.*$/, "") === current.replace(/#.*$/, "");
}

/** Resolves true as soon as the URL answers with any HTTP status. */
async function waitForOk(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (response.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  return false;
}

async function waitForJson(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw new Error(`no response from ${url}: ${lastError?.message ?? "timed out"}`);
}

/* --------------------------------------------------------------- the capture */

async function main() {
  const browserPath = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!browserPath) throw new Error("no Chromium browser found — set CHROME_PATH");
  const reachable = await waitForOk(APP_URL);
  if (!reachable) {
    throw new Error(`app not reachable at ${APP_URL} — start it with \`npm run dev\` in frontend/`);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const browser = spawn(
    browserPath,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${join(process.env.TEMP ?? process.env.TMP ?? ".", "rg-capture-profile")}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--hide-scrollbars",
      "--window-size=1440,900",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  let cdp;
  try {
    cdp = await Cdp.attach(PORT);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    const written = [];
    let currentUrl = null;
    for (const shot of SHOTS) {
      const viewport = shot.viewport ?? DESKTOP;

      // A frozen boot screen needs the dismissal stubbed *before* the document runs.
      let bootScriptId;
      if (shot.freezeBoot) {
        const { identifier } = await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
          source: `
            Object.defineProperty(window, "__rgBootDone", {
              configurable: true,
              get: () => () => {},
              set: () => {},
            });
          `,
        });
        bootScriptId = identifier;
      }

      await cdp.setViewport(viewport);
      await cdp.setColorScheme(shot.theme);

      const url = `${APP_URL}/${shot.hash}`;
      if (shot.freezeBoot) {
        // A full reload is required for the injected stub to take effect.
        const loaded = cdp.once("Page.loadEventFired").catch(() => null);
        await cdp.send("Page.reload", { ignoreCache: true });
        await loaded;
      } else if (sameDocument(url, currentUrl)) {
        // Hash-only change: the app re-renders in place, no load event is coming.
        if (url !== currentUrl) await cdp.send("Page.navigate", { url });
      } else {
        const loaded = cdp.once("Page.loadEventFired").catch(() => null);
        await cdp.send("Page.navigate", { url });
        await loaded;
      }
      currentUrl = url;
      await sleep(1600); // fonts, entrance animations, first paint

      if (bootScriptId) await cdp.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: bootScriptId });

      if (shot.prepare === "open-demo-session") {
        await cdp.evaluate(`
          (() => {
            const buttons = [...document.querySelectorAll("aside button")];
            const demo = buttons.find((b) => b.textContent.includes("anmolkapil/plexo"));
            if (!demo) throw new Error("demo session button not found");
            demo.click();
            return true;
          })()
        `);
        await sleep(500);
      }

      if (shot.scrollTranscript) {
        await cdp.evaluate(`
          (() => {
            const scroller = [...document.querySelectorAll("div")].find(
              (el) => el.className.includes("overscroll-contain"),
            );
            if (!scroller) throw new Error("transcript scroller not found");
            scroller.scrollTop = ${shot.scrollTranscript === "bottom" ? "scroller.scrollHeight" : "0"};
            return scroller.scrollTop;
          })()
        `);
        await sleep(600);
      }

      const position = await cdp.evaluate(`
        (() => {
          const target = ${JSON.stringify(shot.target)};
          const sticky = ${viewport.mobile ? 56 : 56};
          if (target === "top") window.scrollTo(0, 0);
          else if (target === "bottom") window.scrollTo(0, document.scrollingElement.scrollHeight);
          else {
            const el = document.getElementById(target);
            if (!el) throw new Error("no element #" + target);
            window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - sticky - 24);
          }
          return { y: Math.round(window.scrollY), hash: location.hash };
        })()
      `);
      await sleep(900); // parallax + reveal animations settle

      // Report what is actually inside the viewport, so a mis-framed shot is visible in the log.
      const visible = await cdp.evaluate(`
        (() => {
          const height = window.innerHeight;
          const inView = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return Math.round(r.top) >= -4 && Math.round(r.top) < height - 40;
          };
          return {
            h1: document.querySelector("h1")?.textContent.slice(0, 40) ?? null,
            h1Top: document.querySelector("h1") ? Math.round(document.querySelector("h1").getBoundingClientRect().top) : null,
            intake: inView(document.getElementById("repo-url-input")),
            frame: inView(document.getElementById("session-frame")),
            terminal: inView(document.querySelector(".bg-terminal")),
            card: inView(document.querySelector("#safety h3")) ?? inView([...document.querySelectorAll("h3")].find((h) => h.textContent.includes("Disposable sandbox"))),
            boot: !!document.getElementById("rg-boot"),
          };
        })()
      `);

      const { data } = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true });
      const bytes = Buffer.from(data, "base64");
      await writeFile(join(OUT_DIR, shot.file), bytes);
      written.push({ file: shot.file, kb: Math.round(bytes.length / 1024), y: position.y, visible });
      console.log(
        `${shot.file}  ${String(Math.round(bytes.length / 1024)).padStart(4)} KB  y=${position.y}  ` +
          `intake=${visible.intake} frame=${visible.frame} terminal=${visible.terminal} boot=${visible.boot}`,
      );
    }

    console.log(`\n${written.length} screenshots written to ${OUT_DIR}/`);
    const total = written.reduce((sum, entry) => sum + entry.kb, 0);
    console.log(`total ${(total / 1024).toFixed(1)} MB`);
  } finally {
    cdp?.close();
    browser.kill();
  }
}

main().catch((error) => {
  console.error(`capture failed: ${error.message}`);
  process.exitCode = 1;
});
