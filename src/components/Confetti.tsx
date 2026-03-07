import './Confetti.css';

const COLORS = ['#D94F1E', '#F5A623', '#FFF8F0', '#5CB85C', '#7BA5C9'];

// Seeded pseudo-random so pieces are stable across renders
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49311;
  return x - Math.floor(x);
}

const PIECES = Array.from({ length: 60 }, (_, i) => {
  const r = seededRandom;
  // Angle from center — full 360° spread
  const angle = (i / 60) * 2 * Math.PI + r(i + 1) * 0.5;
  // Horizontal: scatter outward from center
  const tx = Math.cos(angle) * (120 + r(i + 2) * 280);
  // Vertical burst: go up first, then gravity pulls down
  const tyBurst = Math.sin(angle) * (100 + r(i + 3) * 200) - 60;
  const tyEnd = tyBurst + 400 + r(i + 4) * 500;
  const rotation = 360 + r(i + 5) * 720;

  return {
    id: i,
    color: COLORS[i % COLORS.length],
    delay: `${r(i + 6) * 0.4}s`,
    duration: `${2.5 + r(i + 7) * 2}s`,
    width: `${8 + (i % 4) * 2}px`,
    height: `${8 + ((i + 1) % 4) * 2}px`,
    borderRadius: i % 3 === 0 ? '50%' : '2px',
    tx: `${tx}px`,
    tyBurst: `${tyBurst}px`,
    tyEnd: `${tyEnd}px`,
    rot: `${rotation}deg`,
  };
});

export default function Confetti() {
  return (
    <div className="confetti-overlay" aria-hidden="true">
      {PIECES.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: p.borderRadius,
            '--delay': p.delay,
            '--duration': p.duration,
            '--tx': p.tx,
            '--ty-burst': p.tyBurst,
            '--ty-end': p.tyEnd,
            '--rot': p.rot,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
