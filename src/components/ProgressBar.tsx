import './ProgressBar.css';

interface Props {
  picks: number;
  total: number;
}

export default function ProgressBar({ picks, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((picks / total) * 100);
  const complete = picks === total;

  return (
    <div className="progress-bar-wrapper">
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${complete ? 'complete' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="progress-bar-label">
        {complete ? '🏆 All picks made!' : `${picks} / ${total} picks made`}
      </span>
    </div>
  );
}
