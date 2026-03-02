import './Confetti.css';

const COLORS = ['#D94F1E', '#F5A623', '#FFF8F0', '#5CB85C', '#7BA5C9'];

// Generated once at module level so pieces are stable across renders
const PIECES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: `${(i * 1.68) % 100}%`,
  color: COLORS[i % COLORS.length],
  animationDelay: `${(i * 0.09) % 2}s`,
  animationDuration: `${2.5 + (i * 0.07) % 2.5}s`,
  width: `${8 + (i % 4) * 2}px`,
  height: `${8 + ((i + 1) % 4) * 2}px`,
  borderRadius: i % 3 === 0 ? '50%' : '2px',
}));

export default function Confetti() {
  return (
    <div className="confetti-overlay" aria-hidden="true">
      {PIECES.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: p.borderRadius,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
