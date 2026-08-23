/**
 * Theme handling: dark-first, persisted override, system fallback.
 * The `.dark` class on <html> is applied by the no-flash inline script in
 * app/layout.tsx before paint; this module manages runtime switching.
 */

import { useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "c2c-theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : "system";
}

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

export function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function setStoredTheme(theme: Theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private mode etc.) — theme still applies live.
  }
  applyTheme(theme);
  window.dispatchEvent(new Event("c2c-theme-change"));
}

/** Subscribe to OS scheme changes while in "system" mode. Returns cleanup. */
export function watchSystemTheme(onChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

// ── React binding ─────────────────────────────────────────────────────────

const subscribers = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  subscribers.add(onChange);
  window.addEventListener("storage", onChange);
  const unwatch = watchSystemTheme(onChange); // re-render when system flips
  return () => {
    subscribers.delete(onChange);
    window.removeEventListener("storage", onChange);
    unwatch();
  };
}

function getSnapshot(): Theme {
  return getStoredTheme();
}

function getServerSnapshot(): Theme {
  return "system";
}

/** Reactive stored theme. Applies the `.dark` class while mounted. */
export function useTheme(): [Theme, (t: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // External-system sync: keep <html> class matching storage + OS scheme.
  useEffect(() => {
    applyTheme(getStoredTheme());
    return watchSystemTheme(() => {
      if (getStoredTheme() === "system") applyTheme("system");
    });
  }, []);

  return [theme, setStoredTheme];
}
