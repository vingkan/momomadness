import { useEffect, useMemo, useRef, useState } from 'react';
import type { Choices } from '../data/bracket';
import { decodeChoices, encodeChoicesFull } from '../data/bracket';
import { hasAnyResults } from '../data/results';
import { scoreBracketFromChoices } from '../data/scoring';
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

interface Props {
  choicesParam: string | null;
  onGoToLanding: () => void;
  onClearChoicesParam: () => void;
}

export default function BracketPage({ choicesParam, onGoToLanding, onClearChoicesParam }: Props) {
  const [showShare, setShowShare] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const urlChoicesParam = choicesParam;

  const urlChoices = useMemo(
    () => (urlChoicesParam ? decodeChoices(urlChoicesParam) : null),
    [urlChoicesParam]
  );

  const savedChoices = useMemo(() => loadSavedChoices(), []);

  const isViewingOther = useMemo(() => {
    if (!urlChoices || !savedChoices) return false;
    return JSON.stringify(urlChoices) !== JSON.stringify(savedChoices);
  }, [urlChoices, savedChoices]);

  const resultsExist = hasAnyResults();
  const readOnly = isViewingOther || resultsExist;

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
    return `${base}?choices=${encoded}`;
  }, [choices]);

  function handleClear() {
    clearBracket();
    clearStorage();
    onClearChoicesParam();
  }

  return (
    <div className="bracket-page">
      {showConfetti && <Confetti />}

      {isViewingOther && (
        <div className="other-bracket-banner">
          <span>You're viewing someone else's bracket.</span>
          <button
            className="btn-ghost banner-btn"
            onClick={onClearChoicesParam}
          >
            View Your Bracket
          </button>
        </div>
      )}

      <header className="bracket-header">
        <button
          className="btn-ghost back-btn"
          onClick={onGoToLanding}
          aria-label="Back to home"
        >
          ← Home
        </button>
        <h1 className="bracket-page-title">Momo Madness 2026</h1>
        {!readOnly ? (
          <button className="btn-ghost clear-btn" onClick={handleClear}>
            Clear
          </button>
        ) : (
          <div />
        )}
      </header>

      <Bracket
        choices={choices}
        nextHighlight={readOnly ? null : nextHighlight}
        onPick={readOnly ? () => {} : pick}
        readOnly={readOnly}
      />

      <footer className="bracket-footer">
        {!isViewingOther && !resultsExist && <ProgressBar picks={picksCount} total={15} />}
        {resultsExist && complete && (() => {
          const score = scoreBracketFromChoices(choices);
          return (
            <div className="bracket-score-display">
              <span className="bracket-score-item">
                <span className="bracket-score-label">Score</span>
                <span className="bracket-score-value">{score.current}</span>
              </span>
              <span className="bracket-score-item">
                <span className="bracket-score-label">Max</span>
                <span className="bracket-score-value">{score.max}</span>
              </span>
            </div>
          );
        })()}
        <div className="bracket-footer-buttons">
          {!readOnly || complete ? (
            <button
              className={`btn-primary share-btn ${!complete ? 'disabled' : ''}`}
              onClick={() => complete && setShowShare(true)}
              disabled={!complete}
              title={complete ? 'Share your bracket' : 'Complete all 15 picks to share'}
            >
              Share Bracket
            </button>
          ) : null}
        </div>
      </footer>

      {showShare && (
        <ShareModal url={shareUrl} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
