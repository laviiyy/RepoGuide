# RepoGuide — frontend

The RepoGuide web app: the landing page, the workspace and the docs route. See the
[root README](../README.md) for what the project is, screenshots, the design system and the demo
status.

```bash
npm install
npm run dev       # dev server with HMR
npm run build     # tsc -b && vite build -> dist/
npm run preview   # serve the production build
npm run lint      # oxlint
npx tsc -b        # type check only
```

## What lives where

| Path | Contents |
| --- | --- |
| `src/pages/` | `Landing.tsx` and `Docs.tsx` — the routed screens |
| `src/components/` | landing sections (`Landing*.tsx`), workspace (`TopBar`, `Sidebar`, `ChatView`, `Composer`), shared UI (`UrlIntake`, `SiteHeader`, `BackgroundLayers`, `Rise`) |
| `src/hooks/` | `useChat` (the scripted engine), `useRoute` (hash router), `useScroll`, `useInView`, `useTheme`, `useMediaQuery` |
| `src/store/` | the zustand session store |
| `src/lib/utils.ts` | class merging, relative time, GitHub URL parsing |
| `src/index.css` | design tokens, the four background layers, motion helpers |
| `index.html` | the inline boot screen and the pre-paint theme script |

Routing is hash-based (`#/`, `#/workspace`, `#/docs/<section>`), so the build can be served from any
static host without rewrite rules.
