import bracketsData from "../data/brackets.json";
import { hasAnyResults } from "../data/results";

interface BracketEntry {
  name: string;
  timestamp: string;
  encoded: string;
  url: string;
  score: number;
  maxScore: number;
  wins: number;
  losses: number;
}

interface Props {
  onViewBracket: (encoded: string) => void;
}

export default function BracketLeaderboard({ onViewBracket }: Props) {
  const brackets = bracketsData as BracketEntry[];

  if (!hasAnyResults()) {
    return (
      <div className="leaderboard">
        <h2 className="leaderboard-title">Prediction Leaderboard</h2>
        <p className="leaderboard-placeholder">Results forthcoming...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h2 className="leaderboard-title">Prediction Leaderboard</h2>
      <div className="leaderboard-scroll">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th data-tip="Rank" className="col-seed" tabIndex={0}>
                #
              </th>
              <th>Name</th>
              <th data-tip="Current Score" tabIndex={0} className="col-num">
                Score
              </th>
              <th
                data-tip="Maximum Possible Score"
                tabIndex={0}
                className="col-num"
              >
                Max
              </th>
              <th
                data-tip="Correct Predictions"
                tabIndex={0}
                className="col-num"
              >
                W
              </th>
              <th
                data-tip="Incorrect Predictions"
                tabIndex={0}
                className="col-num"
              >
                L
              </th>
            </tr>
          </thead>
          <tbody>
            {brackets.map((b, i) => (
              <tr key={`${b.name}-${i}`}>
                <td className="col-seed">{i + 1}</td>
                <td className="col-name">
                  <button
                    className="bracket-link"
                    onClick={() => onViewBracket(b.encoded)}
                  >
                    {b.name}{i === 0 ? " 👑" : ""}
                  </button>
                </td>
                <td className="col-num col-score">{b.score}</td>
                <td className="col-num">{b.maxScore}</td>
                <td className="col-num">{b.wins}</td>
                <td className="col-num">{b.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
