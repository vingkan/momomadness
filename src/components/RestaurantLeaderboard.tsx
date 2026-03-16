import { RESTAURANTS } from "../data/restaurants";
import { MATCHES } from "../data/bracket";
import {
  RESULTS,
  getResultWinner,
  resolveActualSlot,
  totalScore,
} from "../data/results";

interface RestaurantStats {
  seed: number;
  name: string;
  division: string;
  neighborhood: string;
  pf: number;
  pa: number;
  diff: number;
  wins: number;
  losses: number;
  eliminated: boolean;
}

function computeStats(): RestaurantStats[] {
  const stats = new Map<
    number,
    { pf: number; pa: number; wins: number; losses: number; eliminated: boolean }
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
      eliminated: s.eliminated,
    };
  }).sort(
    (a, b) => b.pf - a.pf || b.diff - a.diff || a.seed - b.seed,
  );
}

export default function RestaurantLeaderboard() {
  const rows = computeStats();

  if (RESULTS.length === 0) {
    return (
      <div className="leaderboard">
        <h2 className="leaderboard-title">Restaurant Standings</h2>
        <p className="leaderboard-placeholder">Results forthcoming...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h2 className="leaderboard-title">Restaurant Standings</h2>
      <div className="leaderboard-scroll">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th title="Seed">#</th>
              <th>Name</th>
              <th>Div</th>
              <th className="hide-mobile">Neighborhood</th>
              <th title="Points For">PF</th>
              <th title="Points Against">PA</th>
              <th title="Point Differential">Diff</th>
              <th title="Wins">W</th>
              <th title="Losses">L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.seed}
                className={r.eliminated ? "row-eliminated" : ""}
              >
                <td className="col-seed">{r.seed}</td>
                <td className="col-name">{r.name}</td>
                <td>{r.division}</td>
                <td className="hide-mobile">{r.neighborhood}</td>
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
    </div>
  );
}
