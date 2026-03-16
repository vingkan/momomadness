import { useState, useRef, useEffect } from "react";
import type { Choices } from "../data/bracket";
import { MATCHES, resolveSlot, isMatchAvailable } from "../data/bracket";
import { getResultByIndex, getResultWinner, isUserSlotViable, resolveActualSlot, totalScore } from "../data/results";
import type { SlotState } from "./MatchupSlot";
import MatchupSlot from "./MatchupSlot";
import MatchupModal from "./MatchupModal";
import BracketConnector from "./BracketConnector";
import "./Bracket.css";

/**
 * Absolute-position top values for each slot within a 364px-tall column.
 *
 * SLOT_H=72, R16_GAP=12, DIV_GAP=52
 * R16 A (top div):  match 0 top=0,   match 1 top=84   (72+12)
 * R16 B (bot div):  match 2 top=208  (84+72+52), match 3 top=292  (208+72+12)
 * QF A center=(35+119)/2=77  → top=42
 * QF B center=(243+327)/2=285 → top=250
 * SF/Finals center=(77+285)/2=181 → top=146
 * Container height=364 (292+72)
 */
const TOP: Record<string, number> = {
  r16a0: 0,
  r16a1: 84,
  r16b0: 208,
  r16b1: 292,
  qfa: 42,
  qfb: 250,
  sf: 146,
  finals: 146,
};

interface Props {
  choices: Choices;
  nextHighlight: number | null;
  onPick: (matchIndex: number, value: 0 | 1) => void;
  readOnly?: boolean;
}

export default function Bracket({
  choices,
  nextHighlight,
  onPick,
  readOnly = false,
}: Props) {
  const [openMatch, setOpenMatch] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ isDragging: boolean; startX: number; startY: number; scrollLeft: number; scrollTop: number }>({
    isDragging: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0,
  });

  // Center the bracket horizontally on mount
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    if (scrollWidth > clientWidth) {
      container.scrollLeft = (scrollWidth - clientWidth) / 2;
    }
  }, []);

  useEffect(() => {
    if (nextHighlight === null) return;
    const container = scrollRef.current;
    if (!container) return;
    const highlighted = container.querySelector('.slot-highlighted');
    if (highlighted) {
      highlighted.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [nextHighlight]);

  function handleMouseDown(e: React.MouseEvent) {
    const container = scrollRef.current;
    if (!container) return;
    dragState.current = {
      isDragging: true,
      startX: e.pageX - container.offsetLeft,
      startY: e.pageY - container.offsetTop,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragState.current.isDragging) return;
    const container = scrollRef.current;
    if (!container) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;
    container.scrollLeft = dragState.current.scrollLeft - (x - dragState.current.startX);
    container.scrollTop = dragState.current.scrollTop - (y - dragState.current.startY);
  }

  function handleMouseUp() {
    dragState.current.isDragging = false;
  }

  function getSlotState(matchIndex: number): SlotState {
    if (choices[matchIndex] !== null) return "decided";
    if (!isMatchAvailable(matchIndex, choices)) return "locked";
    if (matchIndex === nextHighlight) return "highlighted";
    return "available";
  }

  function handleSlotClick(matchIndex: number) {
    if (readOnly) {
      // In read-only mode: open modal for decided matches or matches with results
      if (choices[matchIndex] !== null || getResultByIndex(matchIndex) !== null) {
        setOpenMatch(matchIndex);
      }
      return;
    }
    const state = getSlotState(matchIndex);
    if (state === "locked") return;
    setOpenMatch(matchIndex);
  }

  function handlePick(value: 0 | 1) {
    if (openMatch === null) return;
    onPick(openMatch, value);
    setOpenMatch(null);
  }

  const openMatchDef = openMatch !== null ? MATCHES[openMatch] : null;
  const topTeam = openMatchDef
    ? (resolveActualSlot(openMatchDef.topSlot) ?? resolveSlot(openMatchDef.topSlot, choices))
    : null;
  const bottomTeam = openMatchDef
    ? (resolveActualSlot(openMatchDef.bottomSlot) ?? resolveSlot(openMatchDef.bottomSlot, choices))
    : null;
  const currentWinner = openMatch !== null ? choices[openMatch] : null;

  function slot(
    matchIndex: number,
    topValue: number,
    side: "left" | "right" | "center",
  ) {
    const match = MATCHES[matchIndex];
    const result = getResultByIndex(matchIndex);

    // For matches with results, show actual teams.
    // For no-result matches, show user's predicted team only if their pick
    // chain is still viable (not eliminated by any earlier result).
    let top, bottom;
    let topViable = true, bottomViable = true;
    if (result) {
      top = resolveActualSlot(match.topSlot);
      bottom = resolveActualSlot(match.bottomSlot);
    } else {
      // Try actual teams first (from prerequisite results), fall back to user's viable prediction
      const topActual = resolveActualSlot(match.topSlot);
      const bottomActual = resolveActualSlot(match.bottomSlot);
      topViable = isUserSlotViable(match.topSlot, choices);
      bottomViable = isUserSlotViable(match.bottomSlot, choices);
      top = topActual ?? (topViable ? resolveSlot(match.topSlot, choices) : null);
      bottom = bottomActual ?? (bottomViable ? resolveSlot(match.bottomSlot, choices) : null);
    }

    const state: SlotState = readOnly
      ? choices[matchIndex] !== null || result !== null
        ? "decided"
        : "locked"
      : getSlotState(matchIndex);

    // Show actual result winner when available.
    // For no-result matches, only highlight user's pick if viable.
    let displayWinner: 0 | 1 | null = null;
    const userPick = choices[matchIndex];
    let userPickCorrect: boolean | null = null;

    if (result) {
      displayWinner = getResultWinner(result);
      if (userPick !== null) {
        // Compare the user's predicted winner RESTAURANT against the actual winner RESTAURANT
        // This gives credit even when the opponent was different than predicted
        const userWinnerSlot = userPick === 0 ? match.topSlot : match.bottomSlot;
        const userWinnerTeam = resolveSlot(userWinnerSlot, choices);
        const actualWinner = getResultWinner(result);
        const actualWinnerSlot = actualWinner === 0 ? match.topSlot : match.bottomSlot;
        const actualWinnerTeam = resolveActualSlot(actualWinnerSlot);
        userPickCorrect = !!(userWinnerTeam && actualWinnerTeam && userWinnerTeam.seed === actualWinnerTeam.seed);
      }
    } else if (userPick !== null) {
      const pickedPosition = userPick;
      const pickedViable = pickedPosition === 0 ? topViable : bottomViable;
      displayWinner = pickedViable ? pickedPosition : null;
    }

    return (
      <MatchupSlot
        key={matchIndex}
        matchIndex={matchIndex}
        topTeam={top}
        bottomTeam={bottom}
        winner={displayWinner}
        state={state}
        onClick={() => handleSlotClick(matchIndex)}
        side={side}
        style={{ top: topValue }}
        topScore={result ? totalScore(result.topScore) : null}
        bottomScore={result ? totalScore(result.bottomScore) : null}
        userPick={userPick}
        userPickCorrect={userPickCorrect}
      />
    );
  }

  return (
    <>
      <div
        className="bracket-scroll-container"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="bracket-round-labels">
          <div className="round-label-col">Round of 16</div>
          <div className="round-label-gap" />
          <div className="round-label-col">Quarterfinals</div>
          <div className="round-label-gap" />
          <div className="round-label-col">Semifinals</div>
          <div className="round-label-gap" />
          <div className="round-label-col">Finals</div>
          <div className="round-label-gap" />
          <div className="round-label-col">Semifinals</div>
          <div className="round-label-gap" />
          <div className="round-label-col">Quarterfinals</div>
          <div className="round-label-gap" />
          <div className="round-label-col">Round of 16</div>
        </div>
        <div className="bracket">
          {/* ── Left R16 column (North top, West bottom) ── */}
          <div className="bracket-col">
            <div className="division-label" style={{ top: -20 }}>
              NORTH
            </div>
            {slot(0, TOP.r16a0, "left")}
            {slot(1, TOP.r16a1, "left")}
            <div className="division-label" style={{ top: 185 }}>
              WEST
            </div>
            {slot(2, TOP.r16b0, "left")}
            {slot(3, TOP.r16b1, "left")}
          </div>

          <BracketConnector type="r16-qf-left" />

          {/* ── Left QF column (North, West) ── */}
          <div className="bracket-col">
            {slot(4, TOP.qfa, "left")}
            {slot(5, TOP.qfb, "left")}
          </div>

          <BracketConnector type="qf-sf-left" />

          {/* ── Left SF column (North-West) ── */}
          <div className="bracket-col">{slot(6, TOP.sf, "left")}</div>

          <BracketConnector type="sf-finals-left" />

          {/* ── Finals column ── */}
          <div className="bracket-col">{slot(14, TOP.finals, "center")}</div>

          <BracketConnector type="sf-finals-right" />

          {/* ── Right SF column (East-South) ── */}
          <div className="bracket-col">{slot(7, TOP.sf, "right")}</div>

          <BracketConnector type="qf-sf-right" />

          {/* ── Right QF column (East, South) ── */}
          <div className="bracket-col">
            {slot(8, TOP.qfa, "right")}
            {slot(9, TOP.qfb, "right")}
          </div>

          <BracketConnector type="r16-qf-right" />

          {/* ── Right R16 column (East top, South bottom) ── */}
          <div className="bracket-col">
            <div className="division-label" style={{ top: -20 }}>
              EAST
            </div>
            {slot(10, TOP.r16a0, "right")}
            {slot(11, TOP.r16a1, "right")}
            <div className="division-label" style={{ top: 185 }}>
              SOUTH
            </div>
            {slot(12, TOP.r16b0, "right")}
            {slot(13, TOP.r16b1, "right")}
          </div>
        </div>
      </div>

      {openMatch !== null && openMatchDef && (
        <MatchupModal
          topTeam={topTeam}
          bottomTeam={bottomTeam}
          matchLabel={openMatchDef.label}
          currentWinner={currentWinner}
          readOnly={readOnly}
          matchIndex={openMatch}
          userChoices={choices}
          onPick={handlePick}
          onClose={() => setOpenMatch(null)}
        />
      )}
    </>
  );
}
