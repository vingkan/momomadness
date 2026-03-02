import type { Restaurant } from './restaurants';
import { getRestaurantBySeed } from './restaurants';

/**
 * A slot identifies which team fills a position in a matchup.
 * - { seed } = a fixed seed (used in Round of 16)
 * - { matchIndex, pick: 0|1 } = winner of another match
 *   pick 0 = top team won that match; pick 1 = bottom team won
 */
export type Slot =
  | { seed: number }
  | { matchIndex: number; pick: 0 | 1 };

export interface MatchDef {
  /** Position in the 15-digit encoding (0-14, finals = 14) */
  index: number;
  /** Human-readable label */
  label: string;
  /** Top-positioned team slot (higher seed) */
  topSlot: Slot;
  /** Bottom-positioned team slot (lower seed) */
  bottomSlot: Slot;
  /**
   * Match indices that must have a winner before this match is available.
   * Empty for all Round of 16 matches.
   */
  prerequisites: number[];
  /** Which round this match belongs to (for highlight grouping) */
  round: 'r16' | 'qf' | 'sf' | 'final';
}

/**
 * 15-match definitions in encoding order (column-major left→right, finals last):
 *
 * Indices 0–3:  Left-side R16  (North top/bottom, West top/bottom)
 * Indices 4–5:  Left-side QF   (North, West)
 * Index  6:     Left-side SF   (North-West)
 * Index  7:     Right-side SF  (East-South)
 * Indices 8–9:  Right-side QF  (East, South)
 * Indices 10–13: Right-side R16 (East top/bottom, South top/bottom)
 * Index  14:    Finals
 */
export const MATCHES: MatchDef[] = [
  // ── Left side Round of 16 (North top, West bottom) ──
  {
    index: 0, label: 'North #5 vs #16', round: 'r16',
    topSlot: { seed: 5 }, bottomSlot: { seed: 16 },
    prerequisites: [],
  },
  {
    index: 1, label: 'North #7 vs #14', round: 'r16',
    topSlot: { seed: 7 }, bottomSlot: { seed: 14 },
    prerequisites: [],
  },
  {
    index: 2, label: 'West #3 vs #11', round: 'r16',
    topSlot: { seed: 3 }, bottomSlot: { seed: 11 },
    prerequisites: [],
  },
  {
    index: 3, label: 'West #9 vs #10', round: 'r16',
    topSlot: { seed: 9 }, bottomSlot: { seed: 10 },
    prerequisites: [],
  },

  // ── Left side Quarterfinals ──
  {
    index: 4, label: 'North Quarterfinal', round: 'qf',
    topSlot: { matchIndex: 0, pick: 0 }, bottomSlot: { matchIndex: 1, pick: 0 },
    prerequisites: [0, 1],
  },
  {
    index: 5, label: 'West Quarterfinal', round: 'qf',
    topSlot: { matchIndex: 2, pick: 0 }, bottomSlot: { matchIndex: 3, pick: 0 },
    prerequisites: [2, 3],
  },

  // ── Left side Semifinal (North-West) ──
  {
    index: 6, label: 'North–West Semifinal', round: 'sf',
    topSlot: { matchIndex: 4, pick: 0 }, bottomSlot: { matchIndex: 5, pick: 0 },
    prerequisites: [4, 5],
  },

  // ── Right side Semifinal (East-South) ──
  {
    index: 7, label: 'East–South Semifinal', round: 'sf',
    topSlot: { matchIndex: 8, pick: 0 }, bottomSlot: { matchIndex: 9, pick: 0 },
    prerequisites: [8, 9],
  },

  // ── Right side Quarterfinals ──
  {
    index: 8, label: 'East Quarterfinal', round: 'qf',
    topSlot: { matchIndex: 10, pick: 0 }, bottomSlot: { matchIndex: 11, pick: 0 },
    prerequisites: [10, 11],
  },
  {
    index: 9, label: 'South Quarterfinal', round: 'qf',
    topSlot: { matchIndex: 12, pick: 0 }, bottomSlot: { matchIndex: 13, pick: 0 },
    prerequisites: [12, 13],
  },

  // ── Right side Round of 16 (East top, South bottom) ──
  {
    index: 10, label: 'East #1 vs #15', round: 'r16',
    topSlot: { seed: 1 }, bottomSlot: { seed: 15 },
    prerequisites: [],
  },
  {
    index: 11, label: 'East #2 vs #4', round: 'r16',
    topSlot: { seed: 2 }, bottomSlot: { seed: 4 },
    prerequisites: [],
  },
  {
    index: 12, label: 'South #6 vs #13', round: 'r16',
    topSlot: { seed: 6 }, bottomSlot: { seed: 13 },
    prerequisites: [],
  },
  {
    index: 13, label: 'South #8 vs #12', round: 'r16',
    topSlot: { seed: 8 }, bottomSlot: { seed: 12 },
    prerequisites: [],
  },

  // ── Finals ──
  {
    index: 14, label: 'Momo Madness Finals', round: 'final',
    topSlot: { matchIndex: 6, pick: 0 }, bottomSlot: { matchIndex: 7, pick: 0 },
    prerequisites: [6, 7],
  },
];

export type Choices = (0 | 1 | null)[];

/** Return a blank 15-element choices array */
export function emptyChoices(): Choices {
  return Array(15).fill(null);
}

/**
 * Resolve which restaurant occupies a slot given current choices.
 * Returns null if the slot's prerequisite match hasn't been picked yet.
 */
export function resolveSlot(slot: Slot, choices: Choices): Restaurant | null {
  if ('seed' in slot) {
    return getRestaurantBySeed(slot.seed);
  }
  const { matchIndex } = slot;
  const choice = choices[matchIndex];
  if (choice === null) return null;
  const match = MATCHES[matchIndex];
  const winningSlot = choice === 0 ? match.topSlot : match.bottomSlot;
  return resolveSlot(winningSlot, choices);
}

/** Check whether a match's prerequisites are all satisfied */
export function isMatchAvailable(matchIndex: number, choices: Choices): boolean {
  return MATCHES[matchIndex].prerequisites.every(i => choices[i] !== null);
}

/** Decode a URL `choices` param string into a Choices array.
 *
 * Handles two formats for backward compatibility:
 *   - New format (length <= 4): 3-char base-36 string (e.g., "PA7")
 *   - Legacy format (length >= 5): 15-char binary string of '0' and '1' characters
 */
export function decodeChoices(param: string): Choices {
  const result: Choices = Array(15).fill(null);

  if (param.length <= 4) {
    const num = parseInt(param, 36);
    if (isNaN(num)) return result;
    const binaryStr = num.toString(2).padStart(15, '0');
    const bits = binaryStr.length > 15 ? binaryStr.slice(-15) : binaryStr;
    for (let i = 0; i < 15; i++) {
      if (bits[i] === '0') result[i] = 0;
      else if (bits[i] === '1') result[i] = 1;
    }
  } else {
    // Legacy: 15-char binary string
    for (let i = 0; i < 15 && i < param.length; i++) {
      const c = param[i];
      if (c === '0') result[i] = 0;
      else if (c === '1') result[i] = 1;
    }
  }

  return result;
}

/** Encode a Choices array to a 15-char string (null → '?'). Internal use only. */
export function encodeChoices(choices: Choices): string {
  return choices.map(c => (c === null ? '?' : String(c))).join('');
}

/** Return a shareable 3-character base-36 encoded string.
 * Interprets the 15 binary choices as a binary integer and converts to base-36.
 * Should only be called when the bracket is complete (all 15 picks made).
 */
export function encodeChoicesFull(choices: Choices): string {
  const binaryStr = choices.map(c => (c === null ? '0' : String(c))).join('');
  const num = parseInt(binaryStr, 2);
  return num.toString(36).toUpperCase().padStart(3, '0');
}

/**
 * Determine the next match index to highlight for the user.
 *
 * Logic: After a pick, highlight the next unpicked-but-available match
 * in the same round. If the round is fully complete, highlight the first
 * available match in the next round.
 */
export function getNextHighlight(choices: Choices): number | null {
  const roundOrder: Array<MatchDef['round']> = ['r16', 'qf', 'sf', 'final'];

  for (const round of roundOrder) {
    const roundMatches = MATCHES.filter(m => m.round === round);
    const unpickedAvailable = roundMatches.filter(
      m => choices[m.index] === null && isMatchAvailable(m.index, choices)
    );
    if (unpickedAvailable.length > 0) {
      return unpickedAvailable[0].index;
    }
    // If this round has unpicked matches that are NOT yet available, stop here
    const unpicked = roundMatches.filter(m => choices[m.index] === null);
    if (unpicked.length > 0) return null;
  }
  return null;
}

/** Check if all 15 matches have been picked */
export function isComplete(choices: Choices): boolean {
  return choices.every(c => c !== null);
}

/** Count how many matches have been picked */
export function countPicks(choices: Choices): number {
  return choices.filter(c => c !== null).length;
}
