import { ChevronDown } from 'lucide-react';
import logo from "/assets/logo/logo.png";
import RestaurantMap from '../components/RestaurantMap';
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
}

export default function LandingPage({ onGoToBracket }: Props) {
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
    </div>
  );
}
