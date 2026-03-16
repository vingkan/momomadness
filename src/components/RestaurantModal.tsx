import {
  Ham,
  Drumstick,
  Vegan,
  Shrimp,
  Beef,
  TreeDeciduous,
  Fish,
  CircleHelp,
  ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Restaurant } from "../data/restaurants";
import "./RestaurantModal.css";

const INGREDIENT_ICONS: Record<string, LucideIcon> = {
  P: Ham, C: Drumstick, V: Vegan, S: Shrimp, B: Beef, L: TreeDeciduous, F: Fish,
};

const INGREDIENT_LABELS: Record<string, string> = {
  P: "Pork", C: "Chicken", V: "Vegetarian", S: "Seafood", B: "Beef", L: "Lamb", F: "Fish",
};

function parseMenuItem(item: string | undefined): { name: string; codes: string[] } | null {
  if (!item) return null;
  const match = item.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!match) return { name: item, codes: [] };
  return { name: match[1].trim(), codes: match[2].split(",").map((c) => c.trim()) };
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

export interface RestaurantStats {
  pf: number;
  pa: number;
  diff: number;
  wins: number;
  losses: number;
  eliminated: boolean;
}

interface Props {
  restaurant: Restaurant;
  stats: RestaurantStats;
  onClose: () => void;
}

export default function RestaurantModal({ restaurant, stats, onClose }: Props) {
  const allCodes = new Set(
    [restaurant.menuItemA, restaurant.menuItemB]
      .flatMap((item) => parseMenuItem(item)?.codes ?? []),
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content restaurant-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="restaurant-seed">#{restaurant.seed}</div>
        <h2 className="modal-title">{restaurant.name}</h2>
        <p className="restaurant-neighborhood">{restaurant.neighborhood} · {restaurant.division}</p>

        <div className="restaurant-stats">
          {(() => {
            const scoreText = restaurant.infatuationScore != null
              ? restaurant.infatuationScore.toFixed(1)
              : "??";
            const isUnrated = restaurant.infatuationScore == null;
            return (
              <div className="stat">
                <span className={`stat-value${isUnrated ? " stat-value-unrated" : ""}`}>{scoreText}</span>
                <span className="stat-label">
                  Infatuation<br />Score
                  {restaurant.infatuationLink && (
                    <a
                      className="infatuation-link"
                      href={restaurant.infatuationLink}
                      target="_blank"
                      rel="noreferrer"
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

        {allCodes.size > 0 && (
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
        )}

        <div className="restaurant-modal-stats">
          <div className="rms-row">
            <span className="rms-label">Record</span>
            <span className="rms-value">{stats.wins}W – {stats.losses}L</span>
          </div>
          <div className="rms-row">
            <span className="rms-label">Points For</span>
            <span className="rms-value">{stats.pf}</span>
          </div>
          <div className="rms-row">
            <span className="rms-label">Points Against</span>
            <span className="rms-value">{stats.pa}</span>
          </div>
          <div className="rms-row">
            <span className="rms-label">Differential</span>
            <span className="rms-value">{stats.diff > 0 ? `+${stats.diff}` : stats.diff}</span>
          </div>
          <div className="rms-row">
            <span className="rms-label">Status</span>
            <span className={`rms-value ${stats.eliminated ? "rms-status-eliminated" : "rms-status-inplay"}`}>
              {stats.eliminated ? "Eliminated" : "In-Play"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
