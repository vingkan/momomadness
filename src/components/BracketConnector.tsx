/**
 * SVG connector lines between bracket columns.
 *
 * Layout constants (px):
 *   SLOT_H=72, R16_GAP=12, DIV_GAP=28, CONTAINER_H=340
 *
 * "Center" = top + 35 (position of the divider line, between two 35px rows).
 *   R16 A top: 35  (top=0)
 *   R16 A bottom: 119  (top=84)
 *   R16 B top: 219  (top=184)
 *   R16 B bottom: 303  (top=268)
 *   QF A: 77  (top=42)
 *   QF B: 285  (top=250)
 *   SF / Finals: 181  (top=146)
 */

const H = 364;
const W = 32;

type ConnectorType =
  | "r16-qf-left"
  | "r16-qf-right"
  | "qf-sf-left"
  | "qf-sf-right"
  | "sf-finals-left"
  | "sf-finals-right";

// Each line: [x1, y1, x2, y2]
type Line = [number, number, number, number];

const LINES: Record<ConnectorType, Line[]> = {
  "r16-qf-left": [
    // East: match 0 (center 35) and match 1 (center 119) → East QF (center 77)
    [0, 35, 16, 35], // horizontal from match 0
    [16, 35, 16, 119], // vertical spine
    [0, 119, 16, 119], // horizontal from match 1
    [16, 77, 32, 77], // horizontal to East QF
    // South: match 2 (center 243) and match 3 (center 327) → South QF (center 285)
    [0, 243, 16, 243],
    [16, 243, 16, 327],
    [0, 327, 16, 327],
    [16, 285, 32, 285],
  ],
  "r16-qf-right": [
    // West: mirrored (source at x=32, spine at x=16, output at x=0)
    [32, 35, 16, 35],
    [16, 35, 16, 119],
    [32, 119, 16, 119],
    [16, 77, 0, 77],
    // North:
    [32, 243, 16, 243],
    [16, 243, 16, 327],
    [32, 327, 16, 327],
    [16, 285, 0, 285],
  ],
  "qf-sf-left": [
    // East QF (77) and South QF (285) → Left SF (181)
    [0, 77, 16, 77],
    [16, 77, 16, 285],
    [0, 285, 16, 285],
    [16, 181, 32, 181],
  ],
  "qf-sf-right": [
    // West QF (77) and North QF (285) → Right SF (181), mirrored
    [32, 77, 16, 77],
    [16, 77, 16, 285],
    [32, 285, 16, 285],
    [16, 181, 0, 181],
  ],
  "sf-finals-left": [[0, 181, 32, 181]],
  "sf-finals-right": [[32, 181, 0, 181]],
};

interface Props {
  type: ConnectorType;
}

export default function BracketConnector({ type }: Props) {
  const lines = LINES[type];
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ flexShrink: 0, overflow: "visible" }}
      aria-hidden="true"
    >
      <g transform="translate(0, 2)">
        {lines.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--color-border)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
}
