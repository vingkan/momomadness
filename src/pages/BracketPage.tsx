import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Choices } from '../data/bracket';
import { decodeChoices, encodeChoicesFull } from '../data/bracket';
import { useBracket, clearStorage } from '../hooks/useBracket';
import Bracket from '../components/Bracket';
import ProgressBar from '../components/ProgressBar';
import ShareModal from '../components/ShareModal';
import Confetti from '../components/Confetti';
import './BracketPage.css';

const STORAGE_KEY = 'momomadness-bracket';

function loadSavedChoices(): Choices | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 15) return null;
    return parsed as Choices;
  } catch {
    return null;
  }
}

export default function BracketPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showShare, setShowShare] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const urlChoicesParam = searchParams.get('choices');

  const urlChoices = useMemo(
    () => (urlChoicesParam ? decodeChoices(urlChoicesParam) : null),
    [urlChoicesParam]
  );

  const savedChoices = useMemo(() => loadSavedChoices(), []);

  const isViewingOther = useMemo(() => {
    if (!urlChoices || !savedChoices) return false;
    return JSON.stringify(urlChoices) !== JSON.stringify(savedChoices);
  }, [urlChoices, savedChoices]);

  const initialChoices = urlChoices ?? savedChoices ?? undefined;
  const { choices, pick, clearBracket, complete, picksCount, nextHighlight } =
    useBracket(initialChoices, !isViewingOther);

  // Auto-open share modal + confetti when the 15th pick is made
  const prevPicksRef = useRef(picksCount);
  useEffect(() => {
    if (prevPicksRef.current === 14 && picksCount === 15 && !isViewingOther) {
      setShowShare(true);
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5500);
      return () => clearTimeout(timer);
    }
    prevPicksRef.current = picksCount;
  }, [picksCount, isViewingOther]);

  const shareUrl = useMemo(() => {
    const encoded = encodeChoicesFull(choices);
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}#/bracket?choices=${encoded}`;
  }, [choices]);

  function handleClear() {
    clearBracket();
    clearStorage();
    navigate('/bracket', { replace: true });
  }

  return (
    <div className="bracket-page">
      {showConfetti && <Confetti />}

      {isViewingOther && (
        <div className="other-bracket-banner">
          <span>You're viewing someone else's bracket.</span>
          <button
            className="btn-ghost banner-btn"
            onClick={() => navigate('/bracket', { replace: true })}
          >
            View Your Bracket
          </button>
        </div>
      )}

      <header className="bracket-header">
        <button
          className="btn-ghost back-btn"
          onClick={() => navigate('/')}
          aria-label="Back to home"
        >
          ← Home
        </button>
        <h1 className="bracket-page-title">Momo Madness 2026</h1>
        {!isViewingOther ? (
          <button className="btn-ghost clear-btn" onClick={handleClear}>
            Clear
          </button>
        ) : (
          <div />
        )}
      </header>

      <Bracket
        choices={choices}
        nextHighlight={isViewingOther ? null : nextHighlight}
        onPick={isViewingOther ? () => {} : pick}
        readOnly={isViewingOther}
      />

      <footer className="bracket-footer">
        {!isViewingOther && <ProgressBar picks={picksCount} total={15} />}
        <div className="bracket-footer-buttons">
          <button
            className={`btn-primary share-btn ${!complete ? 'disabled' : ''}`}
            onClick={() => complete && setShowShare(true)}
            disabled={!complete}
            title={complete ? 'Share your bracket' : 'Complete all 15 picks to share'}
          >
            Share Bracket
          </button>
        </div>
      </footer>

      {showShare && (
        <ShareModal url={shareUrl} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
