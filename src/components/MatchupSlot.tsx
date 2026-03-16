import type { CSSProperties } from 'react';
import type { Restaurant } from '../data/restaurants';
import './MatchupSlot.css';

export type SlotState = 'locked' | 'available' | 'highlighted' | 'decided';

interface TeamRowProps {
  team: Restaurant | null;
  isWinner: boolean;
  pickClass?: string;
  score?: number | null;
}

function TeamRow({ team, isWinner, pickClass, score }: TeamRowProps) {
  const classes = [
    'team-row',
    isWinner ? 'winner' : '',
    !team ? 'tbd' : '',
    pickClass ?? '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <span className="team-seed">{team ? `#${team.seed}` : ''}</span>
      <span className="team-name">{team ? team.name : 'TBD'}</span>
      <span className="team-score">{score != null ? score : ''}</span>
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
  /** Total score for top team (null if no result) */
  topScore?: number | null;
  /** Total score for bottom team (null if no result) */
  bottomScore?: number | null;
  /** Which position the user picked (0=top, 1=bottom) */
  userPick?: 0 | 1 | null;
  /** Whether the user's pick was correct (true=correct, false=wrong, null=no result or no pick) */
  userPickCorrect?: boolean | null;
}

export default function MatchupSlot({
  topTeam,
  bottomTeam,
  winner,
  state,
  onClick,
  side,
  style,
  topScore,
  bottomScore,
  userPick,
  userPickCorrect,
}: Props) {
  const clickable = state === 'available' || state === 'highlighted' || state === 'decided';

  // Determine per-row pick classes for correct/incorrect coloring
  function getPickClass(position: 0 | 1): string {
    if (userPickCorrect === null) return ''; // no pick or no result — default gold
    if (userPickCorrect === true && winner === position) return 'pick-correct';
    if (userPickCorrect === false && userPick === position) return 'pick-incorrect';
    // Winner that the user didn't pick — bold but not gold
    if (winner === position && userPick !== position) return 'pick-other-won';
    return '';
  }

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
      <TeamRow team={topTeam} isWinner={winner === 0} pickClass={getPickClass(0)} score={topScore} />
      <div className="slot-divider" />
      <TeamRow team={bottomTeam} isWinner={winner === 1} pickClass={getPickClass(1)} score={bottomScore} />
    </div>
  );
}
