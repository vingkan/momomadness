import type { CSSProperties } from 'react';
import type { Restaurant } from '../data/restaurants';
import './MatchupSlot.css';

export type SlotState = 'locked' | 'available' | 'highlighted' | 'decided';

interface TeamRowProps {
  team: Restaurant | null;
  isWinner: boolean;
}

function TeamRow({ team, isWinner }: TeamRowProps) {
  return (
    <div className={`team-row ${isWinner ? 'winner' : ''} ${!team ? 'tbd' : ''}`}>
      <span className="team-seed">{team ? `#${team.seed}` : ''}</span>
      <span className="team-name">{team ? team.name : 'TBD'}</span>
    </div>
  );
}

interface Props {
  matchIndex: number;
  topTeam: Restaurant | null;
  bottomTeam: Restaurant | null;
  /** 0 = top won, 1 = bottom won, null = not picked */
  winner: 0 | 1 | null;
  state: SlotState;
  onClick: () => void;
  /** Which side of the bracket this slot is on */
  side: 'left' | 'right' | 'center';
  /** Inline style for absolute positioning (top value) */
  style?: CSSProperties;
}

export default function MatchupSlot({
  topTeam,
  bottomTeam,
  winner,
  state,
  onClick,
  side,
  style,
}: Props) {
  const clickable = state === 'available' || state === 'highlighted' || state === 'decided';

  return (
    <div
      className={`matchup-slot slot-${state} slot-side-${side}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      aria-disabled={state === 'locked'}
      style={style}
    >
      <TeamRow team={topTeam} isWinner={winner === 0} />
      <div className="slot-divider" />
      <TeamRow team={bottomTeam} isWinner={winner === 1} />
    </div>
  );
}
