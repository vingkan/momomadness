import { useState } from "react";
import { RESTAURANTS, getRestaurantBySeed } from "../data/restaurants";
import { MATCHES } from "../data/bracket";
import {
  RESULTS,
  getResultWinner,
  resolveActualSlot,
  totalScore,
} from "../data/results";
import RestaurantModal from "./RestaurantModal";

interface RestaurantRow {
  seed: number;
  name: string;
  division: string;
  neighborhood: string;
  pf: number;
  pa: number;
  diff: number;
  wins: number;
  losses: number;
  games: number;
  ppg: number;
  eliminated: boolean;
}

function computeStats(): RestaurantRow[] {
  const stats = new Map<
    number,
    {
      pf: number;
      pa: number;
      wins: number;
      losses: number;
      eliminated: boolean;
    }
  >();

  for (const r of RESTAURANTS) {
    stats.set(r.seed, { pf: 0, pa: 0, wins: 0, losses: 0, eliminated: false });
  }

  for (const result of RESULTS) {
    const match = MATCHES[result.matchIndex];
    const topTeam = resolveActualSlot(match.topSlot);
    const bottomTeam = resolveActualSlot(match.bottomSlot);
    if (!topTeam || !bottomTeam) continue;

    const topTotal = totalScore(result.topScore);
    const bottomTotal = totalScore(result.bottomScore);
    const winner = getResultWinner(result);

    const topStats = stats.get(topTeam.seed)!;
    const bottomStats = stats.get(bottomTeam.seed)!;

    topStats.pf += topTotal;
    topStats.pa += bottomTotal;
    bottomStats.pf += bottomTotal;
    bottomStats.pa += topTotal;

    if (winner === 0) {
      topStats.wins++;
      bottomStats.losses++;
      bottomStats.eliminated = true;
    } else {
      bottomStats.wins++;
      topStats.losses++;
      topStats.eliminated = true;
    }
  }

  // Apply mid-tournament replacements
  for (const r of RESTAURANTS) {
    if (!r.replacedBy) continue;
    const replacedStats = stats.get(r.seed)!;
    replacedStats.eliminated = true;
    const replacementStats = stats.get(r.replacedBy.replacementSeed)!;
    replacementStats.eliminated = false;
  }

  return RESTAURANTS.map((r) => {
    const s = stats.get(r.seed)!;
    return {
      seed: r.seed,
      name: r.name,
      division: r.division,
      neighborhood: r.neighborhood,
      pf: s.pf,
      pa: s.pa,
      diff: s.pf - s.pa,
      wins: s.wins,
      losses: s.losses,
      games: s.wins + s.losses,
      ppg: s.wins + s.losses > 0 ? s.pf / (s.wins + s.losses) : 0,
      eliminated: s.eliminated,
    };
  }).sort((a, b) => b.ppg - a.ppg || b.diff - a.diff || a.seed - b.seed);
}

export default function RestaurantLeaderboard() {
  const rows = computeStats();
  const [selectedSeed, setSelectedSeed] = useState<number | null>(null);

  if (RESULTS.length === 0) {
    return (
      <div className="leaderboard">
        <h2 className="leaderboard-title">Restaurant Standings</h2>
        <p className="leaderboard-placeholder">Results forthcoming...</p>
      </div>
    );
  }

  const selectedRow =
    selectedSeed !== null ? rows.find((r) => r.seed === selectedSeed) : null;

  return (
    <div className="leaderboard">
      <h2 className="leaderboard-title">Restaurant Standings</h2>
      <div className="leaderboard-scroll">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th data-tip="Seed" className="col-seed" tabIndex={0}>
                #
              </th>
              <th>Name</th>
              <th data-tip="Division" tabIndex={0}>
                Div
              </th>
              <th>Neighborhood</th>
              <th data-tip="Points Per Game" tabIndex={0} className="col-num">
                PPG
              </th>
              <th data-tip="Points For" tabIndex={0} className="col-num">
                PF
              </th>
              <th data-tip="Points Against" tabIndex={0} className="col-num">
                PA
              </th>
              <th
                data-tip="Point Differential"
                tabIndex={0}
                className="col-num"
              >
                Diff
              </th>
              <th data-tip="Wins" tabIndex={0} className="col-num">
                W
              </th>
              <th data-tip="Losses" tabIndex={0} className="col-num">
                L
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.seed} className={r.eliminated ? "row-eliminated" : ""}>
                <td className="col-seed">{r.seed}</td>
                <td className="col-name">
                  <button
                    className="bracket-link"
                    onClick={() => setSelectedSeed(r.seed)}
                  >
                    {r.name}
                  </button>
                </td>
                <td>{r.division}</td>
                <td>{r.neighborhood}</td>
                <td className="col-num">{r.ppg.toFixed(1)}</td>
                <td className="col-num">{r.pf}</td>
                <td className="col-num">{r.pa}</td>
                <td className="col-num col-diff">
                  {r.diff > 0 ? `+${r.diff}` : r.diff}
                </td>
                <td className="col-num">{r.wins}</td>
                <td className="col-num">{r.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedRow && (
        <RestaurantModal
          restaurant={getRestaurantBySeed(selectedRow.seed)}
          stats={{
            pf: selectedRow.pf,
            pa: selectedRow.pa,
            diff: selectedRow.diff,
            wins: selectedRow.wins,
            losses: selectedRow.losses,
            eliminated: selectedRow.eliminated,
          }}
          onClose={() => setSelectedSeed(null)}
        />
      )}
    </div>
  );
}
