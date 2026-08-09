import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'sidebar:open';

function readStored(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Default to open on first visit.
    return stored === null ? true : stored === 'true';
  } catch {
    // localStorage can throw in private-mode/sandboxed contexts; fall back to open.
    return true;
  }
}

/**
 * Desktop sidebar open/closed state, persisted across reloads.
 * The mobile overlay drawer has its own transient state — see AppLayout.
 */
export function useSidebarOpen() {
  const [isOpen, setIsOpen] = useState<boolean>(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isOpen));
    } catch {
      // Persistence is best-effort; ignore storage failures.
    }
  }, [isOpen]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, toggle };
}
