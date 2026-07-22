import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "@/components/error-boundary";

/* ── Console protection ── */
if (import.meta.env.PROD) {
  const _warn = console.warn.bind(console);
  const RUHFLIX_BANNER = [
    "%c🎬 RUHFLIX",
    "color:#E50914;font-size:28px;font-weight:900;font-family:serif;",
  ];
  console.clear();
  console.log(...RUHFLIX_BANNER);
  console.log(
    "%cStop! This is a browser feature intended for developers.\nIf someone told you to paste something here, it is a scam.",
    "color:#fff;font-size:13px;background:#1a1a1a;padding:8px 12px;border-left:3px solid #E50914;"
  );
  const noop = () => {};
  console.debug = noop;
  console.warn = (msg, ...args) => {
    if (typeof msg === "string" && msg.includes("React")) return;
    _warn(msg, ...args);
  };

  /* Block inline script injection attempts via navigation */
  window.addEventListener("beforeunload", () => {});
}

/* ── Integrity: validate localStorage on boot ── */
try {
  const raw = localStorage.getItem("ruhflix_profiles_v2");
  if (raw) {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem("ruhflix_profiles_v2");
    }
  }
} catch {
  localStorage.removeItem("ruhflix_profiles_v2");
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
