import { useNavigate } from 'react-router-dom';
import logo from '/assets/logo/logo.png';
import '../App.css';

const STORAGE_KEY = 'momomadness-bracket';

function hasSavedBracket(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.some(v => v !== null);
  } catch {
    return false;
  }
}

export default function LandingPage() {
  const navigate = useNavigate();
  const hasBracket = hasSavedBracket();

  return (
    <div className="landing-page">
      <img src={logo} alt="Momo Madness logo" className="landing-logo" />
      <h1 className="landing-title">Momo Madness</h1>
      <p className="landing-subtitle">March 2026 · San Francisco's Best Dumpling Tournament</p>
      <button
        className="landing-cta"
        onClick={() => navigate('/bracket')}
      >
        {hasBracket ? 'Continue Your Bracket' : 'Create Your Bracket'}
      </button>
    </div>
  );
}
