import { useState } from 'react';
import './ShareModal.css';

interface Props {
  url: string;
  onClose: () => void;
}

export default function ShareModal({ url, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="share-trophy">🏆</div>
        <h2 className="share-title">Your Bracket is Ready!</h2>
        <p className="share-desc">
          Share this link so others can see your predictions. Even if you change
          your bracket later, the link preserves your original picks.
        </p>
        <div className="share-url-box">
          <span className="share-url-text">{url}</span>
        </div>
        <button className={`share-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
}
