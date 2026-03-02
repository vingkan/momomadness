import type { Restaurant } from '../data/restaurants';
import './MatchupModal.css';

interface Props {
  topTeam: Restaurant | null;
  bottomTeam: Restaurant | null;
  matchLabel: string;
  onPick: (value: 0 | 1) => void;
  onClose: () => void;
}

function RestaurantCard({
  restaurant,
  position,
  onPick,
}: {
  restaurant: Restaurant | null;
  position: 0 | 1;
  onPick: (value: 0 | 1) => void;
}) {
  if (!restaurant) {
    return (
      <div className="restaurant-card tbd">
        <span className="tbd-label">TBD</span>
      </div>
    );
  }

  return (
    <button
      className="restaurant-card"
      onClick={() => onPick(position)}
      aria-label={`Pick ${restaurant.name}`}
    >
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
      <div className="pick-btn-label">Pick Winner</div>
    </button>
  );
}

export default function MatchupModal({ topTeam, bottomTeam, matchLabel, onPick, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="modal-title">{matchLabel}</h2>
        <p className="modal-subtitle">Pick the winner</p>
        <div className="matchup-cards">
          <RestaurantCard restaurant={topTeam} position={0} onPick={onPick} />
          <div className="vs-divider">VS</div>
          <RestaurantCard restaurant={bottomTeam} position={1} onPick={onPick} />
        </div>
      </div>
    </div>
  );
}
