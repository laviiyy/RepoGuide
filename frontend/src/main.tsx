import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

declare global {
  interface Window {
    /** Provided by the inline boot screen in index.html. */
    __rgBootDone?: () => void;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Hand off from the boot screen once the first frame has actually painted — two
// frames, so fonts and the initial layout are settled before the fade starts.
requestAnimationFrame(() => {
  requestAnimationFrame(() => window.__rgBootDone?.());
});
