import { useState, useEffect, useCallback } from 'react';
import type { Choices } from '../data/bracket';
import {
  MATCHES,
  emptyChoices,
  getNextHighlight,
  isComplete,
  countPicks,
} from '../data/bracket';

const STORAGE_KEY = 'momomadness-bracket';

function loadFromStorage(): Choices | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 15) return null;
    return parsed as Choices;
  } catch {
    return null;
  }
}

function saveToStorage(choices: Choices) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choices));
  } catch {
    // ignore storage errors
  }
}

export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Recursively clear picks for any match that has `matchIndex` as a prerequisite
 * (directly or transitively). This handles the case where changing a pick
 * invalidates a later round's winner.
 */
function clearDownstream(choices: Choices, changedIndex: number): void {
  for (const match of MATCHES) {
    if (match.prerequisites.includes(changedIndex) && choices[match.index] !== null) {
      choices[match.index] = null;
      clearDownstream(choices, match.index);
    }
  }
}

interface UseBracketResult {
  choices: Choices;
  pick: (matchIndex: number, value: 0 | 1) => void;
  clearBracket: () => void;
  complete: boolean;
  picksCount: number;
  nextHighlight: number | null;
}

export function useBracket(initialChoices?: Choices, persist = true): UseBracketResult {
  const [choices, setChoices] = useState<Choices>(() => {
    if (initialChoices) return [...initialChoices] as Choices;
    return loadFromStorage() ?? emptyChoices();
  });

  // Sync when initialChoices prop changes (URL param loaded after mount)
  useEffect(() => {
    if (initialChoices) {
      setChoices([...initialChoices] as Choices);
    }
  // We only want to re-sync when the encoded string changes, not on every render.
  // Stringify gives a stable comparison.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialChoices)]);

  // Auto-save to localStorage on every change (only when persist is enabled)
  useEffect(() => {
    if (persist) saveToStorage(choices);
  }, [choices, persist]);

  const pick = useCallback((matchIndex: number, value: 0 | 1) => {
    setChoices(prev => {
      const next = [...prev] as Choices;
      next[matchIndex] = value;
      // If this pick changed a winner, invalidate dependent downstream picks
      if (prev[matchIndex] !== value) {
        clearDownstream(next, matchIndex);
      }
      return next;
    });
  }, []);

  const clearBracket = useCallback(() => {
    const empty = emptyChoices();
    setChoices(empty);
    clearStorage();
  }, []);

  return {
    choices,
    pick,
    clearBracket,
    complete: isComplete(choices),
    picksCount: countPicks(choices),
    nextHighlight: getNextHighlight(choices),
  };
}
