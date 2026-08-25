/**
 * Transient UI posture flags persisted across reloads but never synced
 * anywhere else. Same external-store pattern as lib/theme.ts.
 */
import { useCallback, useSyncExternalStore } from "react";

const KEY = "c2c-focus";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** [focusEnabled, toggle] — hides sidebar + topbar for pure-board mode. */
export function useFocusMode(): [boolean, () => void] {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const toggle = useCallback(() => {
    try {
      window.localStorage.setItem(KEY, getSnapshot() ? "0" : "1");
    } catch {
      // Storage unavailable — still flip live.
    }
    listeners.forEach((l) => l());
  }, []);

  return [enabled, toggle];
}
