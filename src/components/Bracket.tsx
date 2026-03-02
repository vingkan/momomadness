import { useState } from 'react';
import type { Choices } from '../data/bracket';
import { MATCHES, resolveSlot, isMatchAvailable } from '../data/bracket';
import type { SlotState } from './MatchupSlot';
import MatchupSlot from './MatchupSlot';
import MatchupModal from './MatchupModal';
import './Bracket.css';

interface Props {
  choices: Choices;
  nextHighlight: number | null;
  onPick: (matchIndex: number, value: 0 | 1) => void;
  readOnly?: boolean;
}

export default function Bracket({ choices, nextHighlight, onPick, readOnly = false }: Props) {
  const [openMatch, setOpenMatch] = useState<number | null>(null);

  function getSlotState(matchIndex: number): SlotState {
    if (choices[matchIndex] !== null) return 'decided';
    if (!isMatchAvailable(matchIndex, choices)) return 'locked';
    if (matchIndex === nextHighlight) return 'highlighted';
    return 'available';
  }

  function handleSlotClick(matchIndex: number) {
    if (readOnly) return;
    const state = getSlotState(matchIndex);
    if (state === 'locked') return;
    setOpenMatch(matchIndex);
  }

  function handlePick(value: 0 | 1) {
    if (openMatch === null) return;
    onPick(openMatch, value);
    setOpenMatch(null);
  }

  const openMatchDef = openMatch !== null ? MATCHES[openMatch] : null;
  const topTeam = openMatchDef ? resolveSlot(openMatchDef.topSlot, choices) : null;
  const bottomTeam = openMatchDef ? resolveSlot(openMatchDef.bottomSlot, choices) : null;

  function slot(matchIndex: number, side: 'left' | 'right' | 'center') {
    const match = MATCHES[matchIndex];
    const top = resolveSlot(match.topSlot, choices);
    const bottom = resolveSlot(match.bottomSlot, choices);
    return (
      <MatchupSlot
        key={matchIndex}
        matchIndex={matchIndex}
        topTeam={top}
        bottomTeam={bottom}
        winner={choices[matchIndex]}
        state={readOnly ? (choices[matchIndex] !== null ? 'decided' : 'locked') : getSlotState(matchIndex)}
        onClick={() => handleSlotClick(matchIndex)}
        side={side}
      />
    );
  }

  return (
    <>
      <div className="bracket-scroll-container">
        <div className="bracket">

          {/* ── Left side ── */}
          <div className="bracket-col col-r16-left">
            <div className="division-label">EAST</div>
            {slot(0, 'left')}
            {slot(1, 'left')}
            <div className="division-label division-label-south">SOUTH</div>
            {slot(2, 'left')}
            {slot(3, 'left')}
          </div>

          <div className="bracket-col col-qf-left">
            <div className="col-spacer-top-east" />
            {slot(4, 'left')}
            <div className="col-spacer-mid" />
            {slot(5, 'left')}
            <div className="col-spacer-bottom-south" />
          </div>

          <div className="bracket-col col-sf-left">
            <div className="col-sf-spacer" />
            {slot(6, 'left')}
            <div className="col-sf-spacer" />
          </div>

          {/* ── Finals ── */}
          <div className="bracket-col col-finals">
            <div className="finals-spacer" />
            {slot(14, 'center')}
            <div className="finals-spacer" />
          </div>

          {/* ── Right side ── */}
          <div className="bracket-col col-sf-right">
            <div className="col-sf-spacer" />
            {slot(7, 'right')}
            <div className="col-sf-spacer" />
          </div>

          <div className="bracket-col col-qf-right">
            <div className="col-spacer-top-west" />
            {slot(8, 'right')}
            <div className="col-spacer-mid" />
            {slot(9, 'right')}
            <div className="col-spacer-bottom-north" />
          </div>

          <div className="bracket-col col-r16-right">
            <div className="division-label">WEST</div>
            {slot(10, 'right')}
            {slot(11, 'right')}
            <div className="division-label division-label-north">NORTH</div>
            {slot(12, 'right')}
            {slot(13, 'right')}
          </div>

        </div>
      </div>

      {openMatch !== null && openMatchDef && (
        <MatchupModal
          topTeam={topTeam}
          bottomTeam={bottomTeam}
          matchLabel={openMatchDef.label}
          onPick={handlePick}
          onClose={() => setOpenMatch(null)}
        />
      )}
    </>
  );
}
