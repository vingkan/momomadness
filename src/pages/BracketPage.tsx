import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Choices } from '../data/bracket';
import { decodeChoices, encodeChoicesFull } from '../data/bracket';
import { useBracket, clearStorage } from '../hooks/useBracket';
import Bracket from '../components/Bracket';
import ProgressBar from '../components/ProgressBar';
import ShareModal from '../components/ShareModal';
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

  const urlChoicesParam = searchParams.get('choices');

  // Determine if we're viewing someone else's bracket
  const urlChoices = useMemo(
    () => (urlChoicesParam ? decodeChoices(urlChoicesParam) : null),
    [urlChoicesParam]
  );

  const savedChoices = useMemo(() => loadSavedChoices(), []);

  const isViewingOther = useMemo(() => {
    if (!urlChoices || !savedChoices) return false;
    return JSON.stringify(urlChoices) !== JSON.stringify(savedChoices);
  }, [urlChoices, savedChoices]);

  // The bracket state: if viewing URL, use URL choices (read-only if different from own)
  const initialChoices = urlChoices ?? savedChoices ?? undefined;
  const { choices, pick, clearBracket, complete, picksCount, nextHighlight } =
    useBracket(initialChoices, !isViewingOther);

  const shareUrl = useMemo(() => {
    const encoded = encodeChoicesFull(choices);
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}#/bracket?choices=${encoded}`;
  }, [choices]);

  function handleClear() {
    clearBracket();
    clearStorage();
    // Navigate to bracket without choices param to clear URL too
    navigate('/bracket', { replace: true });
  }

  return (
    <div className="bracket-page">
      {/* Banner for viewing someone else's bracket */}
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

      {/* Header */}
      <header className="bracket-header">
        <button
          className="btn-ghost back-btn"
          onClick={() => navigate('/')}
          aria-label="Back to home"
        >
          ← Home
        </button>
        <h1 className="bracket-page-title">Momo Madness 2026</h1>
        <div className="bracket-header-actions">
          {!isViewingOther && (
            <button className="btn-ghost" onClick={handleClear}>
              Clear
            </button>
          )}
          <button
            className={`btn-primary share-btn ${!complete ? 'disabled' : ''}`}
            onClick={() => complete && setShowShare(true)}
            disabled={!complete}
            title={complete ? 'Share your bracket' : 'Complete all 15 picks to share'}
          >
            Share Bracket
          </button>
        </div>
      </header>

      {/* Progress */}
      {!isViewingOther && (
        <ProgressBar picks={picksCount} total={15} />
      )}

      {/* Bracket */}
      <Bracket
        choices={choices}
        nextHighlight={isViewingOther ? null : nextHighlight}
        onPick={isViewingOther ? () => {} : pick}
        readOnly={isViewingOther}
      />

      {/* Share modal */}
      {showShare && (
        <ShareModal url={shareUrl} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
