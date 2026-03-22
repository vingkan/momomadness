import { useRef, useState } from "react";
import type { MutableRefObject } from "react";
import {
  Ham,
  Drumstick,
  Vegan,
  Shrimp,
  Beef,
  TreeDeciduous,
  CircleHelp,
  ArrowUpRight,
  CircleAlert,
  Fish,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Restaurant } from "../data/restaurants";
import type { Choices } from "../data/bracket";
import { MATCHES, resolveSlot } from "../data/bracket";
import {
  getResultByIndex,
  getResultWinner,
  getPreviewByIndex,
  resolveActualSlot,
  getReplacementSource,
  totalScore,
} from "../data/results";
import type { MatchResult } from "../data/results";
import scoresData from "../data/scores.json";
import "./MatchupModal.css";

interface JudgeRow {
  judge: string;
  quarter: number;
  topPts: number;
  bottomPts: number;
}

function getJudgeRows(topName: string, bottomName: string): JudgeRow[] {
  const entry = scoresData.find(
    (e) =>
      (e.pair[0] === topName && e.pair[1] === bottomName) ||
      (e.pair[0] === bottomName && e.pair[1] === topName),
  );
  if (!entry) return [];
  return entry.judgeDetails.map((d) => ({
    judge: d.judge,
    quarter: d.quarter,
    topPts: d.source === topName ? d.pointsEarned : 0,
    bottomPts: d.source === bottomName ? d.pointsEarned : 0,
  }));
}

interface Props {
  topTeam: Restaurant | null;
  bottomTeam: Restaurant | null;
  matchLabel: string;
  /** Which team is currently the picked winner (0=top, 1=bottom, null=none) */
  currentWinner: 0 | 1 | null;
  /** If true, show details only — no pick buttons */
  readOnly: boolean;
  /** Bracket position (0-14) */
  matchIndex: number;
  /** The user's bracket choices (for badge comparison) */
  userChoices: Choices;
  onPick: (value: 0 | 1) => void;
  onClose: () => void;
}

const INGREDIENT_ICONS: Record<string, LucideIcon> = {
  P: Ham,
  C: Drumstick,
  V: Vegan,
  S: Shrimp,
  B: Beef,
  L: TreeDeciduous,
  F: Fish,
};

const INGREDIENT_LABELS: Record<string, string> = {
  P: "Pork",
  C: "Chicken",
  V: "Vegetarian",
  S: "Seafood",
  B: "Beef",
  L: "Lamb",
  F: "Fish",
};

function parseMenuItem(
  item: string | undefined,
): { name: string; codes: string[] } | null {
  if (!item) return null;
  const match = item.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!match) return { name: item, codes: [] };
  return {
    name: match[1].trim(),
    codes: match[2].split(",").map((c) => c.trim()),
  };
}

function MenuItemRow({ item }: { item: string | undefined }) {
  const parsed = parseMenuItem(item);
  if (!parsed) {
    return (
      <div className="menu-item-tbd">
        <CircleHelp size={13} />
        Menu Item TBD
      </div>
    );
  }
  return (
    <div className="menu-item-row">
      {parsed.codes.length > 0 && (
        <span className="menu-item-icons">
          {parsed.codes.map((code, i) => {
            const Icon = INGREDIENT_ICONS[code];
            return Icon ? <Icon key={i} size={13} /> : null;
          })}
        </span>
      )}
      <span className="menu-item-name">{parsed.name}</span>
    </div>
  );
}

interface Badge {
  text: string;
  type: "won" | "lost" | "user-won" | "user-lost" | "your-pick" | "eliminated";
  tooltip?: string;
}

function computeBadge(
  matchIndex: number,
  position: 0 | 1,
  userChoices: Choices,
  result: MatchResult,
): Badge {
  const resultWinner = getResultWinner(result);
  const thisTeamWon = resultWinner === position;
  const match = MATCHES[matchIndex];
  const userPick = userChoices[matchIndex];

  // Check if user's predicted team for this slot matches who actually played
  const slot = position === 0 ? match.topSlot : match.bottomSlot;
  const actualTeam = resolveActualSlot(slot, match.round);
  const userTeam = resolveSlot(slot, userChoices);
  const slotMatchesActual =
    actualTeam !== null &&
    userTeam !== null &&
    userTeam.seed === actualTeam.seed;

  // Check if the user's predicted WINNER restaurant matches the actual winner restaurant
  // This gives credit even when the opponent was different
  let userPickedWinnerCorrectly = false;
  if (userPick !== null) {
    const userWinnerSlot = userPick === 0 ? match.topSlot : match.bottomSlot;
    const userWinner = resolveSlot(userWinnerSlot, userChoices);
    const actualWinnerSlot = resultWinner === 0 ? match.topSlot : match.bottomSlot;
    const actualWinner = resolveActualSlot(actualWinnerSlot, match.round);
    userPickedWinnerCorrectly = !!(userWinner && actualWinner && userWinner.seed === actualWinner.seed);
  }

  // Did the user pick THIS position to win?
  const userPickedThisPosition = userPick === position;

  // If user predicted the winning restaurant correctly
  if (userPickedWinnerCorrectly) {
    if (thisTeamWon && userPickedThisPosition) {
      return { text: "Your Pick Won", type: "user-won" };
    }
    if (thisTeamWon) {
      // Winner but user picked the other position — shouldn't happen if userPickedWinnerCorrectly
      return { text: "Winner", type: "won" };
    }
    // This is the losing team and user picked the winner correctly
    if (userPickedThisPosition) {
      // User picked this position but it lost — shouldn't happen if they picked winner correctly
      return { text: "Loser", type: "lost" };
    }
    return { text: "Loser", type: "lost" };
  }

  // User predicted the winner incorrectly
  if (userPick !== null) {
    if (userPickedThisPosition) {
      // User picked this team to win but it lost (or the team they thought was here wasn't)
      if (!slotMatchesActual) {
        return thisTeamWon
          ? { text: "Winner", type: "won", tooltip: "Your pick did not make it to this round." }
          : { text: "Loser", type: "lost", tooltip: "Your pick did not make it to this round." };
      }
      return { text: "Your Pick Lost", type: "user-lost" };
    }
    // Not the user's picked position
    if (!slotMatchesActual) {
      return thisTeamWon
        ? { text: "Winner", type: "won", tooltip: "Your pick did not make it to this round." }
        : { text: "Loser", type: "lost", tooltip: "Your pick did not make it to this round." };
    }
    return thisTeamWon
      ? { text: "Winner", type: "won" }
      : { text: "Loser", type: "lost" };
  }

  // No user pick at all
  return thisTeamWon
    ? { text: "Winner", type: "won" }
    : { text: "Loser", type: "lost" };
}

function computePendingBadge(
  matchIndex: number,
  position: 0 | 1,
  userChoices: Choices,
): Badge | null {
  const match = MATCHES[matchIndex];
  const slot = position === 0 ? match.topSlot : match.bottomSlot;
  const actualTeam = resolveActualSlot(slot, match.round);
  const userTeam = resolveSlot(slot, userChoices);
  if (!actualTeam || !userTeam) return null;

  // Only show "Your Pick" for the position the user actually picked to win
  const userPick = userChoices[matchIndex];
  if (userPick === position) {
    // This is the team the user picked to win this match
    if (actualTeam.seed === userTeam.seed) {
      return { text: "Your Pick", type: "your-pick" };
    }
    return { text: "Your Pick Was Eliminated", type: "eliminated" };
  }

  // The other position — no badge
  return null;
}

interface RestaurantCardProps {
  restaurant: Restaurant | null;
  position: 0 | 1;
  isCurrentWinner: boolean;
  readOnly: boolean;
  badge: Badge | null;
  onPick: (value: 0 | 1) => void;
  openedAt: MutableRefObject<number>;
  round: 'r16' | 'qf' | 'sf' | 'final';
}

function RestaurantCard({
  restaurant,
  position,
  isCurrentWinner,
  readOnly,
  badge,
  onPick,
  openedAt,
  round,
}: RestaurantCardProps) {
  if (!restaurant) {
    return (
      <div className="restaurant-card tbd">
        <span className="tbd-label">Opponent TBD</span>
      </div>
    );
  }

  const cardClass = [
    "restaurant-card",
    isCurrentWinner ? "current-winner" : "",
    readOnly ? "view-only" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <div className="restaurant-seed">#{restaurant.seed}</div>
      <div className="restaurant-name">
        {restaurant.name}
        {restaurant.substitutedFor && (
          <span
            className="substitution-icon"
            data-tooltip={`Substituted for ${restaurant.substitutedFor}`}
            title={`Substituted for ${restaurant.substitutedFor}`}
          >
            <CircleAlert size={14} />
          </span>
        )}
        {(() => {
          const replacedRestaurant = getReplacementSource(restaurant.seed, round);
          if (!replacedRestaurant) return null;
          return (
            <span
              className="substitution-icon"
              data-tooltip={`Replacing ${replacedRestaurant.name} (ineligible)`}
              title={`Replacing ${replacedRestaurant.name} (ineligible)`}
            >
              <CircleAlert size={14} />
            </span>
          );
        })()}
      </div>
      <div className="restaurant-neighborhood">{restaurant.neighborhood}</div>
      <div className="restaurant-stats">
        {(() => {
          const scoreText =
            restaurant.infatuationScore != null
              ? restaurant.infatuationScore.toFixed(1)
              : "??";
          const isUnrated = restaurant.infatuationScore == null;
          return (
            <div className="stat">
              <span
                className={`stat-value${isUnrated ? " stat-value-unrated" : ""}`}
              >
                {scoreText}
              </span>
              <span className="stat-label">
                Infatuation
                <br />
                Score
                {restaurant.infatuationLink && (
                  <a
                    className="infatuation-link"
                    href={restaurant.infatuationLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Open Infatuation review"
                  >
                    <ArrowUpRight size={12} />
                  </a>
                )}
              </span>
            </div>
          );
        })()}
        <div className="stat">
          <span className="stat-value">
            {restaurant.beliRatings.toLocaleString()}
          </span>
          <span className="stat-label">
            Beli
            <br />
            Ratings
          </span>
        </div>
      </div>
      <div className="restaurant-menu-items">
        <MenuItemRow item={restaurant.menuItemA} />
        <MenuItemRow item={restaurant.menuItemB} />
      </div>
      {badge ? (
        <div
          className={`result-badge badge-${badge.type}`}
          title={badge.tooltip}
        >
          {badge.text}
        </div>
      ) : readOnly && isCurrentWinner ? (
        <div className="result-badge badge-your-pick">Your Pick</div>
      ) : !readOnly ? (
        <div className="pick-btn-label">
          {isCurrentWinner ? "✓ Current Pick" : "Pick Winner"}
        </div>
      ) : null}
    </>
  );

  if (readOnly || badge) {
    return <div className={cardClass}>{content}</div>;
  }

  return (
    <button
      className={cardClass}
      onClick={() => {
        if (Date.now() - openedAt.current < 350) return;
        onPick(position);
      }}
      aria-label={`Pick ${restaurant.name}`}
    >
      {content}
    </button>
  );
}

export default function MatchupModal({
  topTeam,
  bottomTeam,
  matchLabel,
  currentWinner,
  readOnly,
  matchIndex,
  userChoices,
  onPick,
  onClose,
}: Props) {
  const openedAt = useRef(Date.now());
  const [showJudges, setShowJudges] = useState(false);
  const result = getResultByIndex(matchIndex);

  const resultWinner = result ? getResultWinner(result) : null;

  // Detect when neither of the user's predicted teams made it to this match
  const neitherPickAdvanced = (() => {
    const userPick = userChoices[matchIndex];
    if (userPick === null) return false;
    const match = MATCHES[matchIndex];
    const topUserTeam = resolveSlot(match.topSlot, userChoices);
    const topActualTeam = resolveActualSlot(match.topSlot, match.round);
    const bottomUserTeam = resolveSlot(match.bottomSlot, userChoices);
    const bottomActualTeam = resolveActualSlot(match.bottomSlot, match.round);
    // Only check if at least one actual team is known (prerequisite has a result)
    if (!topActualTeam && !bottomActualTeam) return false;
    const topMatches = topUserTeam && topActualTeam && topUserTeam.seed === topActualTeam.seed;
    const bottomMatches = bottomUserTeam && bottomActualTeam && bottomUserTeam.seed === bottomActualTeam.seed;
    return !topMatches && !bottomMatches;
  })();

  // Suppress badges when neither pick advanced — the message replaces them
  const topBadge = neitherPickAdvanced ? null
    : result ? computeBadge(matchIndex, 0, userChoices, result)
    : computePendingBadge(matchIndex, 0, userChoices);
  const bottomBadge = neitherPickAdvanced ? null
    : result ? computeBadge(matchIndex, 1, userChoices, result)
    : computePendingBadge(matchIndex, 1, userChoices);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className="modal-title">{matchLabel}</h2>
        <p className="modal-subtitle">
          {result
            ? "Final result"
            : readOnly
              ? "Match details"
              : "Pick the winner"}
        </p>
        {neitherPickAdvanced && (
          <p className="modal-no-picks">None of your picks advanced to this match.</p>
        )}
        <div className="matchup-cards">
          <RestaurantCard
            restaurant={topTeam}
            position={0}
            isCurrentWinner={!neitherPickAdvanced && currentWinner === 0 && !topBadge?.tooltip}
            readOnly={readOnly}
            badge={topBadge}
            onPick={onPick}
            openedAt={openedAt}
            round={MATCHES[matchIndex].round}
          />
          <div className="vs-divider">VS</div>
          <RestaurantCard
            restaurant={bottomTeam}
            position={1}
            isCurrentWinner={!neitherPickAdvanced && currentWinner === 1 && !bottomBadge?.tooltip}
            readOnly={readOnly}
            badge={bottomBadge}
            onPick={onPick}
            openedAt={openedAt}
            round={MATCHES[matchIndex].round}
          />
        </div>
        {(() => {
          const allCodes = new Set(
            [
              topTeam?.menuItemA,
              topTeam?.menuItemB,
              bottomTeam?.menuItemA,
              bottomTeam?.menuItemB,
            ].flatMap((item) => parseMenuItem(item)?.codes ?? []),
          );
          return allCodes.size > 0 ? (
            <div className="ingredient-legend">
              {(Object.entries(INGREDIENT_ICONS) as [string, LucideIcon][])
                .filter(([code]) => allCodes.has(code))
                .map(([code, Icon]) => (
                  <span key={code} className="legend-item">
                    <Icon size={12} />
                    {INGREDIENT_LABELS[code]}
                  </span>
                ))}
            </div>
          ) : null;
        })()}
        {!result && (() => {
          const preview = getPreviewByIndex(matchIndex);
          if (!preview) return null;
          return (
            <div className="game-preview-section">
              <h3 className="game-preview-title">Game Preview</h3>
              <p className="game-preview">{preview.preview}</p>
            </div>
          );
        })()}
        {result && (
          <div className="box-score-section">
            <table className="box-score-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Q1</th>
                  <th>Q2</th>
                  <th>Q3</th>
                  <th>Q4</th>
                  <th className="box-score-total">F</th>
                </tr>
              </thead>
              <tbody>
                <tr className={resultWinner === 0 ? "box-score-winner" : ""}>
                  <td className="box-score-team">{topTeam?.name ?? "TBD"}</td>
                  {result.topScore.map((q, i) => (
                    <td key={i}>{q}</td>
                  ))}
                  <td className="box-score-total">
                    {totalScore(result.topScore)}
                  </td>
                </tr>
                <tr className={resultWinner === 1 ? "box-score-winner" : ""}>
                  <td className="box-score-team">
                    {bottomTeam?.name ?? "TBD"}
                  </td>
                  {result.bottomScore.map((q, i) => (
                    <td key={i}>{q}</td>
                  ))}
                  <td className="box-score-total">
                    {totalScore(result.bottomScore)}
                  </td>
                </tr>
              </tbody>
            </table>
            {result.recap && <p className="game-recap">{result.recap}</p>}
            {topTeam && bottomTeam && (() => {
              const judgeRows = getJudgeRows(topTeam.name, bottomTeam.name);
              if (judgeRows.length === 0) return null;
              const topTotal = judgeRows.reduce((s, r) => s + r.topPts, 0);
              const bottomTotal = judgeRows.reduce((s, r) => s + r.bottomPts, 0);
              return (
                <>
                  <button
                    className="judge-scores-toggle"
                    onClick={() => setShowJudges(!showJudges)}
                  >
                    {showJudges ? "Collapse Scores" : "Expand Scores"}
                  </button>
                  {showJudges && (
                    <table className="judge-scores-table">
                      <thead>
                        <tr>
                          <th>Judge</th>
                          <th>Q</th>
                          <th className="col-num">{topTeam.name}</th>
                          <th className="col-num">{bottomTeam.name}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {judgeRows.map((r, i) => (
                          <tr key={i} className={r.quarter % 2 === 0 ? "judge-q-even" : ""}>
                            <td>{r.judge}</td>
                            <td>Q{r.quarter}</td>
                            <td className="col-num">{r.topPts || ""}</td>
                            <td className="col-num">{r.bottomPts || ""}</td>
                          </tr>
                        ))}
                        <tr className="judge-total-row">
                          <td colSpan={2}>Total</td>
                          <td className="col-num">{topTotal}</td>
                          <td className="col-num">{bottomTotal}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
