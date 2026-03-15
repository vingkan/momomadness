import { useRef } from "react";
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
  resolveActualSlot,
  totalScore,
} from "../data/results";
import type { MatchResult } from "../data/results";
import "./MatchupModal.css";

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
  type: "won" | "lost" | "user-won" | "user-lost";
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

  const slot = position === 0 ? match.topSlot : match.bottomSlot;
  const actualTeam = resolveActualSlot(slot);
  const userTeam = resolveSlot(slot, userChoices);

  // Check if user's predicted team for this slot matches who actually played
  const userMatchesActual =
    actualTeam !== null &&
    userTeam !== null &&
    userTeam.seed === actualTeam.seed;

  // Did the user pick THIS position to win this match?
  const userPickedThisPosition = userChoices[matchIndex] === position;

  // User's predicted team didn't make it to this round
  if (userTeam !== null && !userMatchesActual) {
    return thisTeamWon
      ? {
          text: "Winner",
          type: "won",
          tooltip: "Your pick did not make it to this round.",
        }
      : {
          text: "Loser",
          type: "lost",
          tooltip: "Your pick did not make it to this round.",
        };
  }

  // User picked this position to win
  if (userMatchesActual && userPickedThisPosition) {
    return thisTeamWon
      ? { text: "Your Pick Won", type: "user-won" }
      : { text: "Your Pick Lost", type: "user-lost" };
  }

  // User didn't pick, or picked the other team — just show Winner/Loser
  return thisTeamWon
    ? { text: "Winner", type: "won" }
    : { text: "Loser", type: "lost" };
}

interface RestaurantCardProps {
  restaurant: Restaurant | null;
  position: 0 | 1;
  isCurrentWinner: boolean;
  readOnly: boolean;
  badge: Badge | null;
  onPick: (value: 0 | 1) => void;
  openedAt: MutableRefObject<number>;
}

function RestaurantCard({
  restaurant,
  position,
  isCurrentWinner,
  readOnly,
  badge,
  onPick,
  openedAt,
}: RestaurantCardProps) {
  if (!restaurant) {
    return (
      <div className="restaurant-card tbd">
        <span className="tbd-label">TBD</span>
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
  const result = getResultByIndex(matchIndex);

  const topBadge = result
    ? computeBadge(matchIndex, 0, userChoices, result)
    : null;
  const bottomBadge = result
    ? computeBadge(matchIndex, 1, userChoices, result)
    : null;

  const resultWinner = result ? getResultWinner(result) : null;

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
        <div className="matchup-cards">
          <RestaurantCard
            restaurant={topTeam}
            position={0}
            isCurrentWinner={currentWinner === 0}
            readOnly={readOnly}
            badge={topBadge}
            onPick={onPick}
            openedAt={openedAt}
          />
          <div className="vs-divider">VS</div>
          <RestaurantCard
            restaurant={bottomTeam}
            position={1}
            isCurrentWinner={currentWinner === 1}
            readOnly={readOnly}
            badge={bottomBadge}
            onPick={onPick}
            openedAt={openedAt}
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
          </div>
        )}
      </div>
    </div>
  );
}
