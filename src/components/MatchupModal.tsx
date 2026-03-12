import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import { Ham, Drumstick, Vegan, Shrimp, Beef, TreeDeciduous, CircleHelp, ArrowUpRight, CircleAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Restaurant } from '../data/restaurants';
import './MatchupModal.css';

interface Props {
  topTeam: Restaurant | null;
  bottomTeam: Restaurant | null;
  matchLabel: string;
  /** Which team is currently the picked winner (0=top, 1=bottom, null=none) */
  currentWinner: 0 | 1 | null;
  /** If true, show details only — no pick buttons */
  readOnly: boolean;
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
};

const INGREDIENT_LABELS: Record<string, string> = {
  P: 'Pork',
  C: 'Chicken',
  V: 'Vegetarian',
  S: 'Seafood',
  B: 'Beef',
  L: 'Lamb',
};

function parseMenuItem(item: string | undefined): { name: string; codes: string[] } | null {
  if (!item) return null;
  const match = item.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!match) return { name: item, codes: [] };
  return {
    name: match[1].trim(),
    codes: match[2].split(',').map(c => c.trim()),
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

interface RestaurantCardProps {
  restaurant: Restaurant | null;
  position: 0 | 1;
  isCurrentWinner: boolean;
  readOnly: boolean;
  onPick: (value: 0 | 1) => void;
  openedAt: MutableRefObject<number>;
}

function RestaurantCard({ restaurant, position, isCurrentWinner, readOnly, onPick, openedAt }: RestaurantCardProps) {
  if (!restaurant) {
    return (
      <div className="restaurant-card tbd">
        <span className="tbd-label">TBD</span>
      </div>
    );
  }

  const cardClass = [
    'restaurant-card',
    isCurrentWinner ? 'current-winner' : '',
    readOnly ? 'view-only' : '',
  ].filter(Boolean).join(' ');

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
          const scoreText = restaurant.infatuationScore != null
            ? restaurant.infatuationScore.toFixed(1)
            : '??';
          const isUnrated = restaurant.infatuationScore == null;
          return (
            <div className="stat">
              <span className={`stat-value${isUnrated ? ' stat-value-unrated' : ''}`}>{scoreText}</span>
              <span className="stat-label">
                Infatuation<br />Score
                {restaurant.infatuationLink && (
                  <a
                    className="infatuation-link"
                    href={restaurant.infatuationLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
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
          <span className="stat-value">{restaurant.beliRatings.toLocaleString()}</span>
          <span className="stat-label">Beli<br />Ratings</span>
        </div>
      </div>
      <div className="restaurant-menu-items">
        <MenuItemRow item={restaurant.menuItemA} />
        <MenuItemRow item={restaurant.menuItemB} />
      </div>
      {readOnly && isCurrentWinner && (
        <div className="winner-badge">✓ Winner</div>
      )}
      {!readOnly && (
        <div className="pick-btn-label">
          {isCurrentWinner ? '✓ Current Pick' : 'Pick Winner'}
        </div>
      )}
    </>
  );

  if (readOnly) {
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
  onPick,
  onClose,
}: Props) {
  const openedAt = useRef(Date.now());

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="modal-title">{matchLabel}</h2>
        <p className="modal-subtitle">
          {readOnly ? 'Match details' : 'Pick the winner'}
        </p>
        <div className="matchup-cards">
          <RestaurantCard
            restaurant={topTeam}
            position={0}
            isCurrentWinner={currentWinner === 0}
            readOnly={readOnly}
            onPick={onPick}
            openedAt={openedAt}
          />
          <div className="vs-divider">VS</div>
          <RestaurantCard
            restaurant={bottomTeam}
            position={1}
            isCurrentWinner={currentWinner === 1}
            readOnly={readOnly}
            onPick={onPick}
            openedAt={openedAt}
          />
        </div>
        {(() => {
          const allCodes = new Set(
            [topTeam?.menuItemA, topTeam?.menuItemB, bottomTeam?.menuItemA, bottomTeam?.menuItemB]
              .flatMap(item => parseMenuItem(item)?.codes ?? [])
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
      </div>
    </div>
  );
}
