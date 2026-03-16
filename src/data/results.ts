import type { Slot } from "./bracket";
import type { Choices } from "./bracket";
import { MATCHES, resolveSlot } from "./bracket";
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
 * Check if a user's predicted team for a slot is still viable — i.e., hasn't
 * been eliminated by any result in the prerequisite chain.
 */
export function isUserSlotViable(slot: Slot, choices: Choices): boolean {
  if ("seed" in slot) return true;
  const { matchIndex } = slot;
  const result = getResultByIndex(matchIndex);
  if (!result) {
    // No result for this match — check if the user's pick for THIS match
    // is itself viable (recursive check on the prerequisite chain)
    const pick = choices[matchIndex];
    if (pick === null) return true;
    const pickedSlot =
      pick === 0 ? MATCHES[matchIndex].topSlot : MATCHES[matchIndex].bottomSlot;
    return isUserSlotViable(pickedSlot, choices);
  }
  // Result exists — check if user's predicted winner matches actual winner
  const winner = getResultWinner(result);
  const match = MATCHES[matchIndex];
  const actualWinnerSlot = winner === 0 ? match.topSlot : match.bottomSlot;
  const actualWinner = resolveActualSlot(actualWinnerSlot);
  const userPick = choices[matchIndex];
  if (userPick === null) return false;
  const userWinnerSlot = userPick === 0 ? match.topSlot : match.bottomSlot;
  const userWinner = resolveSlot(userWinnerSlot, choices);
  if (!actualWinner || !userWinner) return false;
  return actualWinner.seed === userWinner.seed;
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

// ── Game previews for upcoming matches ──

export interface GamePreview {
  matchIndex: number;
  preview: string;
}

export function getPreviewByIndex(matchIndex: number): GamePreview | null {
  return PREVIEWS.find((p) => p.matchIndex === matchIndex) ?? null;
}

export const PREVIEWS: GamePreview[] = [
  {
    matchIndex: 6,
    preview:
      "The North-West Semifinal pits two unlikely finalists against each other. Dumpling King, the 14-seed, has been the tournament's most dominant force — dismantling Cinderella Bakery 61-24 in R16 and ending DBCB's Cinderella run 66-41 in the North QF. Their Kurobuta Pork Bao has been nearly unstoppable, and their first-half scoring has been suffocating (opponents averaged just 7 points through Q2). Dumpling Specialist, the 9-seed, took a very different path — surviving a 62-61 thriller against House of Pancakes with a historic 36-0 fourth-quarter explosion. Their Shanghai Dumpling thrives under pressure, but can they keep up with DK's relentless early-quarter dominance? The key matchup: DK's first-half firepower vs. DS's fourth-quarter magic. The winner earns a trip to the Momo Madness Finals.",
  },
  {
    matchIndex: 7,
    preview:
      "The East-South Semifinal features the tournament's top overall seed against one of its most complete performers. Dumpling Home, the 1-seed, has lived up to expectations — cruising past Today Food 61-32 and dispatching Hon's Wun-Tun House 54-37 in the East QF. Their Juicy Pork Bao has been a fourth-quarter closer, posting 29 and 20 in Q4 across their two wins. Bao, the 8-seed, has been equally impressive on the other side — defeating Dumpling Kitchen 45-14 and demolishing Dumpling Time 60-7 with a 60-0 run over the final three quarters. Bao's Bi Feng Tang Har Gow has shown an ability to completely shut down opponents in the second half. The question: can Bao's late-game dominance overcome Dumpling Home's consistency and top-seed pedigree? A spot in the Momo Madness Finals is on the line.",
  },
];

// ── Results data ──
// Add MatchResult entries here as games are played.

export const RESULTS: MatchResult[] = [
  // ── North R16 ──
  // #5 Dumpling Story vs #16 Dumpling Baby China Bistro
  {
    matchId: "000415",
    matchIndex: 0,
    topScore: [0, 3, 7, 0],
    bottomScore: [6, 6, 26, 25],
    recap:
      "The biggest upset of the tournament! The 16-seed Dumpling Baby China Bistro stunned Dumpling Story 63-10. DBCB's Dumplings in Chili Oil Sauce dominated from the start with a 6-0 Q1, then delivered a devastating 26-7 Q3 to put it well out of reach. Dumpling Story was shut out in Q1 and Q4, managing just 3 points in Q2 and 7 in Q3 as the Gong Bao Chicken Dumpling never found its rhythm.",
  },
  // #7 Cinderella Bakery & Cafe vs #14 Dumpling King
  {
    matchId: "000613",
    matchIndex: 1,
    topScore: [7, 7, 0, 10],
    bottomScore: [7, 14, 21, 19],
    recap:
      "Dumpling King's Kurobuta Pork Bao powered the 14-seed to a convincing 61-24 victory. After a tied 7-7 first quarter, DK pulled away with a 14-7 Q2 and then delivered a 21-0 Q3 shutout that sealed the deal. Cinderella Bakery's pelmeni showed some late fight with 10 points in Q4, but it was too little, too late, bringing their Cinderella story to an end.",
  },
  // ── North QF ──
  // Dumpling Baby China Bistro vs Dumpling King
  {
    matchId: "011315",
    matchIndex: 4,
    topScore: [0, 0, 12, 29],
    bottomScore: [18, 34, 7, 7],
    recap:
      "Dumpling King ended Dumpling Baby China Bistro's tournament run with a 66-41 victory, but the second half told a different story. DK built a commanding 52-0 lead through two quarters — a complete first-half shutout. DBCB then mounted a furious rally, outscoring DK 41-14 in the second half, capped by a 29-7 fourth quarter. But the early deficit proved insurmountable.",
  },
  // ── West R16 ──
  // #3 Yuanbao Jiaozi vs #11 House of Pancakes
  {
    matchId: "000210",
    matchIndex: 2,
    topScore: [7, 17, 3, 8],
    bottomScore: [29, 16, 23, 5],
    recap:
      "House of Pancakes upset the 3-seed Yuanbao Jiaozi 73-35 behind a monster 29-7 first quarter. Yuanbao's Shitake Mushroom and Sole Fish Dumpling fought back in Q2 (17-16), but House of Pancakes slammed the door with a 23-3 Q3 blowout. Early judges overwhelmingly favored HoP's Pork Dumpling w/ Chives, setting the tone for the rout.",
  },
  // #9 Dumpling Specialist vs #10 Kingdom of Dumpling
  {
    matchId: "000809",
    matchIndex: 3,
    topScore: [15, 18, 8, 39],
    bottomScore: [3, 3, 7, 0],
    recap:
      "The Parkside derby was all Dumpling Specialist. The 9-seed cruised to an 80-13 victory punctuated by a jaw-dropping 39-0 fourth-quarter shutout — every late judge ranked the Shanghai Dumpling first. Kingdom of Dumpling's Lamb Dumpling managed just 7 points in Q3, its only competitive quarter, before being completely shut out in Q4.",
  },
  // ── West QF ──
  // House of Pancakes vs Dumpling Specialist
  {
    matchId: "010810",
    matchIndex: 5,
    topScore: [24, 17, 20, 0],
    bottomScore: [0, 16, 10, 36],
    recap:
      "Dumpling Specialist pulled off a stunning 62-61 comeback over House of Pancakes in the closest match of the West. HoP dominated the first three quarters, building a 61-26 lead behind a 24-0 Q1 shutout. But Dumpling Specialist exploded for 36-0 in Q4 — a complete fourth-quarter shutout and the biggest single-quarter output of the tournament — to steal the West division crown by a single point.",
  },
  // ── East R16 ──
  // #1 Dumpling Home vs #15 Today Food
  {
    matchId: "000014",
    matchIndex: 10,
    topScore: [16, 16, 0, 29],
    bottomScore: [10, 0, 12, 10],
    recap:
      "The 1-seed Dumpling Home advanced with a solid 61-32 victory. After building a 32-10 halftime lead, Dumpling Home was held scoreless in Q3 while Today Food chipped away with 12 points. But the Juicy Pork Bao roared back with a dominant 29-10 fourth quarter to put it away, as points from the late judges rained in favoring the top seed.",
  },
  // #2 Hon's Wun-Tun House vs #4 Palette Tea House
  {
    matchId: "000103",
    matchIndex: 11,
    topScore: [0, 0, 19, 23],
    bottomScore: [18, 17, 0, 5],
    recap:
      "Hon's Wun-Tun House staged a remarkable second-half comeback to defeat Palette Tea House 42-40 in the closest match of the tournament. PTH dominated the first half with a 35-0 shutout — the early judges overwhelmingly favored the Sichuan Seafood Dumpling. But Hon's stormed back with a 19-0 Q3 shutout and 23-5 in Q4. The Pan-Fried Pork Soup Dumpling proved irresistible to the later judges, edging it by just 2 points.",
  },
  // ── East QF ──
  // Dumpling Home vs Hon's Wun-Tun House
  {
    matchId: "010001",
    matchIndex: 8,
    topScore: [13, 16, 5, 20],
    bottomScore: [3, 5, 13, 16],
    recap:
      "The 1-seed Dumpling Home defeated Hon's Wun-Tun House 54-37 in a game that was closer than the final score suggests. DH led 29-8 at halftime, but Hon's battled back with a 13-5 Q3 and 16-20 Q4. The Juicy Pork Bao held off the Pan-Fried Pork Soup Dumpling to book Dumpling Home's spot in the Final Four.",
  },
  // ── South R16 ──
  // #6 Dumpling Time vs #13 United Dumplings
  {
    matchId: "000512",
    matchIndex: 12,
    topScore: [16, 10, 3, 13],
    bottomScore: [0, 3, 3, 0],
    recap:
      "Dumpling Time cruised past United Dumplings 42-6. The 6-seed's Boiled Lamb Dumpling led with a 16-0 Q1 shutout and never looked back, finishing strong with 13 points in Q4. United Dumplings were shut out in Q1 and Q4, with their Korean BBQ Beef Dumplings managing just 3 points in Q2 and Q3 each.",
  },
  // #8 Bao vs #12 Dumpling Kitchen
  {
    matchId: "000711",
    matchIndex: 13,
    topScore: [5, 13, 7, 20],
    bottomScore: [0, 7, 7, 0],
    recap:
      "Bao advanced with a comfortable 45-14 win over Dumpling Kitchen. After a quiet 5-0 Q1, Bao's Bi Feng Tang Har Gow built momentum through Q2 (13-7) and Q3 (7-7), then pulled away with a 20-0 Q4 shutout. Dumpling Kitchen's Pork & Napa Cabbage Potsticker was competitive in the middle quarters but had nothing left for the finish.",
  },
  // ── South QF ──
  // Dumpling Time vs Bao
  {
    matchId: "010507",
    matchIndex: 9,
    topScore: [7, 0, 0, 0],
    bottomScore: [0, 17, 23, 20],
    recap:
      "Bao demolished Dumpling Time 60-7 in the most lopsided quarterfinal of the tournament. Dumpling Time grabbed a 7-0 Q1 lead, then scored exactly zero points over the final three quarters. Bao rallied with 17-0 in Q2, 23-0 in Q3, and 20-0 in Q4 — a 60-0 run that made the early deficit irrelevant. The worst second-half collapse of the tournament sends Bao to the Final Four.",
  },
];
