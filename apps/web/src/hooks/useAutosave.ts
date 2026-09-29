import { useEffect, useRef, useState } from "react";

const KEY = "blogify:autosave";

export interface AutosavedDraft {
  at: number;
  form: Record<string, string>;
}

/**
 * Drop the stored draft without touching the form. Called after a successful
 * save — the work now lives on the server, so the local copy must go.
 */
export function clearAutosave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable — nothing to clear */
  }
}

const read = (): AutosavedDraft | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AutosavedDraft) : null;
  } catch {
    return null;
  }
};

/**
 * PRD §66 "Auto Save" — keeps the post form in localStorage so a refresh, a
 * crash or an accidental navigation does not lose a half-written article.
 *
 * Only an in-progress draft is stored, and only once it differs from what was
 * loaded from the server, so publishing never leaves stale state behind.
 */
export function useAutosave(
  form: Record<string, string>,
  enabled: boolean,
  onRestore: (draft: AutosavedDraft) => void,
  /** Called when the user rejects the recovery, so the form can be blanked. */
  onDiscard: () => void
) {
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [recovered, setRecovered] = useState<AutosavedDraft | null>(null);
  const pristine = useRef(true);

  // Offer a recovery once, on mount. Deliberately not re-running when
  // `onRestore` changes identity between renders.
  useEffect(() => {
    const draft = read();
    if (draft && Object.values(draft.form).some((v) => v.trim())) {
      setRecovered(draft);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    if (pristine.current) {
      pristine.current = false;
      return;
    }

    const hasContent = Object.values(form).some((v) => v.trim());
    if (!hasContent) {
      localStorage.removeItem(KEY);
      setSavedAt(null);
      return;
    }

    const timer = setTimeout(() => {
      const at = Date.now();
      try {
        localStorage.setItem(KEY, JSON.stringify({ at, form }));
        setSavedAt(at);
      } catch {
        // Storage full or blocked — auto-save is a convenience, not critical.
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [form, enabled]);

  const restore = () => {
    if (recovered) onRestore(recovered);
    setRecovered(null);
  };

  /**
   * Throws the stored copy away *and* blanks the form. Clearing only the
   * storage would be undone a beat later, because the still-populated form
   * immediately re-saves itself.
   */
  const discard = () => {
    localStorage.removeItem(KEY);
    setRecovered(null);
    setSavedAt(null);
    pristine.current = true;
    onDiscard();
  };

  return { savedAt, recovered, restore, discard };
}
