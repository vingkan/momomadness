import { MATCHES, decodeChoices, resolveSlot } from "./bracket";
import type { Choices } from "./bracket";
import {
  getResultByIndex,
  getResultWinner,
  isUserSlotViable,
  resolveActualSlot,
} from "./results";

const ROUND_POINTS: Record<string, number> = {
  r16: 1,
  qf: 2,
  sf: 4,
  final: 8,
};

const ROUND_LABELS: Record<string, string> = {
  r16: "Round of 16",
  qf: "Quarterfinal",
  sf: "Semifinal",
  final: "Finals",
};

const ROUND_ORDER: Record<string, number> = {
  r16: 0,
  qf: 1,
  sf: 2,
  final: 3,
};

export type PickStatus = "won" | "lost" | "eliminated" | "pending";

export interface MatchDetail {
  round: string;
  roundOrder: number;
  matchIndex: number;
  pickName: string | null;
  pts: number;
  maxPts: number;
  status: PickStatus;
}

export interface BracketScore {
  current: number;
  max: number;
  wins: number;
  losses: number;
  matches: MatchDetail[];
}

/**
 * Score a bracket given its encoded form (3-char base-36 string).
 */
export function scoreBracket(encoded: string): BracketScore {
  const choices = decodeChoices(encoded);
  return scoreBracketFromChoices(choices);
}

/**
 * Score a bracket given decoded choices array.
 */
export function scoreBracketFromChoices(choices: Choices): BracketScore {
  let current = 0;
  let max = 0;
  let wins = 0;
  let losses = 0;
  const matches: MatchDetail[] = [];

  for (const match of MATCHES) {
    const points = ROUND_POINTS[match.round];
    const result = getResultByIndex(match.index);
    const userPick = choices[match.index];

    // Resolve user's predicted winner name
    let pickName: string | null = null;
    if (userPick !== null) {
      const userWinnerSlot =
        userPick === 0 ? match.topSlot : match.bottomSlot;
      const userWinner = resolveSlot(userWinnerSlot, choices);
      pickName = userWinner?.name ?? null;
    }

    if (result) {
      const resultWinner = getResultWinner(result);
      const actualWinnerSlot =
        resultWinner === 0 ? match.topSlot : match.bottomSlot;
      const actualWinner = resolveActualSlot(actualWinnerSlot, match.round);

      if (userPick !== null) {
        const userWinnerSlot =
          userPick === 0 ? match.topSlot : match.bottomSlot;
        const userWinner = resolveSlot(userWinnerSlot, choices);

        if (actualWinner && userWinner && actualWinner.seed === userWinner.seed) {
          current += points;
          wins++;
          matches.push({
            round: ROUND_LABELS[match.round],
            roundOrder: ROUND_ORDER[match.round],
            matchIndex: match.index,
            pickName,
            pts: points,
            maxPts: points,
            status: "won",
          });
        } else {
          losses++;
          // Check if pick didn't even advance to this round
          const userWinnerSlotCheck = userPick === 0 ? match.topSlot : match.bottomSlot;
          const actualInSlot = resolveActualSlot(userWinnerSlotCheck, match.round);
          const didAdvance = actualInSlot && userWinner && actualInSlot.seed === userWinner.seed;
          matches.push({
            round: ROUND_LABELS[match.round],
            roundOrder: ROUND_ORDER[match.round],
            matchIndex: match.index,
            pickName,
            pts: 0,
            maxPts: 0,
            status: didAdvance ? "lost" : "eliminated",
          });
        }
      } else {
        matches.push({
          round: ROUND_LABELS[match.round],
          roundOrder: ROUND_ORDER[match.round],
          matchIndex: match.index,
          pickName: null,
          pts: 0,
          maxPts: 0,
          status: "lost",
        });
      }
    } else {
      // No result yet — check max eligibility
      let matchMax = 0;
      let status: PickStatus = "pending";

      if (userPick !== null) {
        if (match.round === "r16") {
          matchMax = points;
        } else {
          const topSlot = match.topSlot;
          const bottomSlot = match.bottomSlot;
          const topViable = isUserSlotViable(topSlot, choices, match.round);
          const bottomViable = isUserSlotViable(bottomSlot, choices, match.round);
          const viable = userPick === 0 ? topViable : bottomViable;
          if (viable) {
            matchMax = points;
          } else {
            status = "eliminated";
          }
        }
        max += matchMax;
      }

      matches.push({
        round: ROUND_LABELS[match.round],
        roundOrder: ROUND_ORDER[match.round],
        matchIndex: match.index,
        pickName,
        pts: 0,
        maxPts: matchMax,
        status,
      });
    }
  }

  max += current;

  matches.sort((a, b) => a.roundOrder - b.roundOrder || a.matchIndex - b.matchIndex);

  return { current, max, wins, losses, matches };
}
