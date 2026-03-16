import { ChevronDown } from "lucide-react";
import logo from "/assets/logo/logo.png";
import RestaurantMap from "../components/RestaurantMap";
import RestaurantLeaderboard from "../components/RestaurantLeaderboard";
import BracketLeaderboard from "../components/BracketLeaderboard";
import "../App.css";

const STORAGE_KEY = "momomadness-bracket";

function hasSavedBracket(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.some((v) => v !== null);
  } catch {
    return false;
  }
}

interface Props {
  onGoToBracket: () => void;
  onViewBracket: (encoded: string) => void;
}

export default function LandingPage({ onGoToBracket, onViewBracket }: Props) {
  const hasBracket = hasSavedBracket();

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <img src={logo} alt="Momo Madness logo" className="landing-logo" />
        <h1 className="landing-title">Momo Madness</h1>
        <p className="landing-subtitle">
          The Bracket Tournament to Find San Francisco's Best Dumplings
        </p>
        <button className="landing-cta" onClick={onGoToBracket}>
          {hasBracket ? "Continue Your Bracket" : "Create Your Bracket"}
        </button>
        <div className="scroll-hint" aria-hidden="true">
          <ChevronDown size={28} />
        </div>
      </section>

      <section className="map-section">
        <RestaurantMap />
      </section>

      <section className="leaderboard-section leaderboard-section-restaurants">
        <div className="scoring-explanation">
          <h3>How Restaurant Scoring Works</h3>
          <p>
            At each tasting event, judges rank four restaurants from 1st to 4th.
            For every pair of restaurants, the higher-ranked one earns points
            against the lower-ranked one based on the gap between their ranks.
          </p>
          <p>
            The table below shows how many points the higher-ranked restaurant
            earns against each lower-ranked restaurant. A restaurant ranked
            fourth earns no points from that judge.
          </p>
          <table className="points-matrix">
            <thead>
              <tr>
                <th></th>
                <th>2nd</th>
                <th>3rd</th>
                <th>4th</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>1st</th>
                <td>7</td>
                <td>13</td>
                <td>16</td>
              </tr>
              <tr>
                <th>2nd</th>
                <td></td>
                <td>5</td>
                <td>10</td>
              </tr>
              <tr>
                <th>3rd</th>
                <td></td>
                <td></td>
                <td>3</td>
              </tr>
            </tbody>
          </table>
          <p>
            We use increments of two points and three points to emulate
            basketball scoring.
          </p>
          <p>
            Points are split into four quarters like a basketball box score,
            based on the order in which the judges voted. Last-minute votes turn
            into fourth quarter points.
          </p>
        </div>
        <RestaurantLeaderboard />
      </section>

      <section className="leaderboard-section leaderboard-section-brackets">
        <div className="scoring-explanation">
          <h3>How Prediction Scoring Works</h3>
          <p>
            Earn points for each match where your bracket correctly predicts the
            winning restaurant.
          </p>
          <p>Points increase with each round:</p>
          <ul>
            <li>
              Round of 16: <strong>1 pt</strong>
            </li>
            <li>
              Quarterfinals: <strong>2 pts</strong>
            </li>
            <li>
              Semifinals: <strong>4 pts</strong>
            </li>
            <li>
              Finals: <strong>8 pts</strong>
            </li>
          </ul>
          <p>
            A perfect bracket scores <strong>32 points</strong>.
          </p>
          <p>
            The leaderboard shows each competitor's current score and the
            maximum possible score they can achieve if all of their remaining,
            eligible picks are correct.
          </p>
        </div>
        <BracketLeaderboard onViewBracket={onViewBracket} />
      </section>
    </div>
  );
}
