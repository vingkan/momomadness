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
        <h2 className="leaderboard-title">Bracket Leaderboard</h2>
        <p className="leaderboard-placeholder">Results forthcoming...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h2 className="leaderboard-title">Bracket Leaderboard</h2>
      <div className="leaderboard-scroll">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th title="Rank">#</th>
              <th>Name</th>
              <th title="Current Score">Score</th>
              <th title="Maximum Possible Score">Max</th>
              <th title="Correct Predictions">W</th>
              <th title="Incorrect Predictions">L</th>
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
                    {b.name}
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
