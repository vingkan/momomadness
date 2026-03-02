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

interface RestaurantCardProps {
  restaurant: Restaurant | null;
  position: 0 | 1;
  isCurrentWinner: boolean;
  readOnly: boolean;
  onPick: (value: 0 | 1) => void;
}

function RestaurantCard({ restaurant, position, isCurrentWinner, readOnly, onPick }: RestaurantCardProps) {
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
      <div className="restaurant-name">{restaurant.name}</div>
      <div className="restaurant-neighborhood">{restaurant.neighborhood}</div>
      <div className="restaurant-stats">
        <div className="stat">
          <span className="stat-value">{restaurant.beliScore.toFixed(1)}</span>
          <span className="stat-label">Beli Score</span>
        </div>
        <div className="stat">
          <span className="stat-value">{restaurant.beliRatings.toLocaleString()}</span>
          <span className="stat-label">Ratings</span>
        </div>
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
      onClick={() => onPick(position)}
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
          />
          <div className="vs-divider">VS</div>
          <RestaurantCard
            restaurant={bottomTeam}
            position={1}
            isCurrentWinner={currentWinner === 1}
            readOnly={readOnly}
            onPick={onPick}
          />
        </div>
      </div>
    </div>
  );
}
