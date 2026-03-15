import type { Slot } from "./bracket";
import type { Choices } from "./bracket";
import { MATCHES } from "./bracket";
import { getRestaurantBySeed } from "./restaurants";
import type { Restaurant } from "./restaurants";

export interface MatchResult {
  /** Unique ID: roundId + higherSeedId + lowerSeedId */
  matchId: string;
  /** Bracket position (0-14) */
  matchIndex: number;
  /** Quarter scores for the bracket top-positioned team */
  topScore: [number, number, number, number];
  /** Quarter scores for the bracket bottom-positioned team */
  bottomScore: [number, number, number, number];
  /** Game recap commentary (leave empty, fill in later) */
  recap: string;
}

// ── ID helpers ──

/** Convert a seed (1-16) to a two-digit restaurant ID ("00"-"15") */
export function seedToId(seed: number): string {
  return (seed - 1).toString().padStart(2, "0");
}

/** Convert a round to a two-digit round ID */
export function roundToId(round: "r16" | "qf" | "sf" | "final"): string {
  const map = { r16: "00", qf: "01", sf: "02", final: "03" };
  return map[round];
}

// ── Score helpers ──

/** Sum the four quarter scores */
export function totalScore(quarters: [number, number, number, number]): number {
  return quarters[0] + quarters[1] + quarters[2] + quarters[3];
}

/** Determine winner from a result: 0 = top team won, 1 = bottom team won */
export function getResultWinner(result: MatchResult): 0 | 1 {
  return totalScore(result.topScore) >= totalScore(result.bottomScore) ? 0 : 1;
}

// ── Lookup helpers ──

/** Look up a result by bracket match index. Returns null if no result exists. */
export function getResultByIndex(matchIndex: number): MatchResult | null {
  return RESULTS.find((r) => r.matchIndex === matchIndex) ?? null;
}

/** Check whether any results have been reported */
export function hasAnyResults(): boolean {
  return RESULTS.length > 0;
}

/**
 * Resolve which restaurant actually occupies a slot, using reported results
 * instead of user picks. Returns null if the prerequisite result doesn't exist.
 */
export function resolveActualSlot(slot: Slot): Restaurant | null {
  if ("seed" in slot) {
    return getRestaurantBySeed(slot.seed);
  }
  const { matchIndex } = slot;
  const result = getResultByIndex(matchIndex);
  if (!result) return null;
  const winner = getResultWinner(result);
  const match = MATCHES[matchIndex];
  const winningSlot = winner === 0 ? match.topSlot : match.bottomSlot;
  return resolveActualSlot(winningSlot);
}

/**
 * Build a Choices array from actual results.
 * For each match with a result, the choice is the result winner; otherwise null.
 */
export function getResultChoices(): Choices {
  const choices: Choices = Array(15).fill(null);
  for (const result of RESULTS) {
    choices[result.matchIndex] = getResultWinner(result);
  }
  return choices;
}

// ── Results data ──
// Add MatchResult entries here as games are played.

export const RESULTS: MatchResult[] = [
  // // North R16: #5 Dumpling Story vs #16 Dumpling Baby China Bistro
  // {
  //   matchId: '000415',
  //   matchIndex: 0,
  //   topScore: [22, 18, 25, 20],
  //   bottomScore: [14, 16, 12, 19],
  //   recap: 'Dumpling Story came out firing on all cylinders, with the Gong Bao Chicken Dumpling putting up huge numbers in Q3. Dumpling Baby fought valiantly but couldn\'t keep pace with the 5-seed\'s depth.',
  // },
  // // North R16: #7 Cinderella Bakery vs #14 Dumpling King
  // {
  //   matchId: '000613',
  //   matchIndex: 1,
  //   topScore: [15, 20, 17, 22],
  //   bottomScore: [19, 21, 23, 18],
  //   recap: 'The upset of the tournament so far! Dumpling King\'s Kurobuta Pork Bao dominated Q3, and despite a late surge from Cinderella\'s pelmeni, the 14-seed held on for a gutsy 81-74 victory.',
  // },
  // // North QF: #5 Dumpling Story vs #14 Dumpling King (Dumpling King upset in R16)
  // {
  //   matchId: '010413',
  //   matchIndex: 4,
  //   topScore: [20, 24, 19, 23],
  //   bottomScore: [18, 17, 22, 15],
  //   recap: 'Dumpling King\'s Cinderella run ends here. After their stunning first-round upset, the 14-seed ran out of gas against Dumpling Story\'s relentless Mongolian Beef Dumpling, which dominated Q2 and Q4.',
  // },
];
