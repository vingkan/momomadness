import { MATCHES, decodeChoices, resolveSlot } from "./bracket";
import type { Choices } from "./bracket";
import {
  getResultByIndex,
  getResultWinner,
  resolveActualSlot,
} from "./results";

const ROUND_POINTS: Record<string, number> = {
  r16: 1,
  qf: 2,
  sf: 4,
  final: 8,
};

export interface BracketScore {
  current: number;
  max: number;
  wins: number;
  losses: number;
}

/**
 * Check if a user's predicted restaurant for a slot is still viable
 * (could still end up in this slot given results so far).
 * A prediction is viable if:
 * - The slot is a fixed seed (always viable)
 * - The prerequisite match has no result yet (still undetermined)
 * - The prerequisite match has a result AND the user's predicted winner matches the actual winner
 */
function isSlotPredictionViable(
  slotMatchIndex: number,
  choices: Choices,
): boolean {
  const result = getResultByIndex(slotMatchIndex);
  if (!result) return true; // no result yet — still possible

  const match = MATCHES[slotMatchIndex];
  const winner = getResultWinner(result);
  const actualWinnerSlot = winner === 0 ? match.topSlot : match.bottomSlot;
  const actualWinner = resolveActualSlot(actualWinnerSlot);

  const userPick = choices[slotMatchIndex];
  if (userPick === null) return false;
  const userWinnerSlot = userPick === 0 ? match.topSlot : match.bottomSlot;
  const userWinner = resolveSlot(userWinnerSlot, choices);

  if (!actualWinner || !userWinner) return false;
  return actualWinner.seed === userWinner.seed;
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

  for (const match of MATCHES) {
    const points = ROUND_POINTS[match.round];
    const result = getResultByIndex(match.index);

    if (result) {
      // Match has a result — check if user predicted the winner
      const resultWinner = getResultWinner(result);
      const actualWinnerSlot =
        resultWinner === 0 ? match.topSlot : match.bottomSlot;
      const actualWinner = resolveActualSlot(actualWinnerSlot);

      const userPick = choices[match.index];
      if (userPick !== null) {
        const userWinnerSlot =
          userPick === 0 ? match.topSlot : match.bottomSlot;
        const userWinner = resolveSlot(userWinnerSlot, choices);

        if (actualWinner && userWinner && actualWinner.seed === userWinner.seed) {
          current += points;
          wins++;
        } else {
          losses++;
        }
      }
      max += current - (max < current ? 0 : 0); // will set max = current after loop section
    } else {
      // No result yet — check if this match is still eligible for max points
      // A match is eligible if the user's predicted winner could still appear
      // For R16 matches (fixed seeds), always eligible
      if (match.round === "r16") {
        max += points;
      } else {
        // Check if at least one of the user's predicted teams for this match
        // could still end up here
        const topSlot = match.topSlot;
        const bottomSlot = match.bottomSlot;

        let topViable = false;
        let bottomViable = false;

        if ("seed" in topSlot) {
          topViable = true;
        } else {
          topViable = isSlotPredictionViable(topSlot.matchIndex, choices);
        }

        if ("seed" in bottomSlot) {
          bottomViable = true;
        } else {
          bottomViable = isSlotPredictionViable(
            bottomSlot.matchIndex,
            choices,
          );
        }

        // The user's predicted winner needs to be viable
        const userPick = choices[match.index];
        if (userPick !== null) {
          const viable = userPick === 0 ? topViable : bottomViable;
          if (viable) {
            max += points;
          }
        } else {
          // User didn't pick — not eligible
        }
      }
    }
  }

  max += current;

  return { current, max, wins, losses };
}
