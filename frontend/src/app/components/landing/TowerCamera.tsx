// Procedural tower whose SVG viewBox animates between specific windows
// as scrollYProgress moves through the pinned section.

import { motion, MotionValue, useTransform } from 'motion/react';

export const FLOORS = 14;
export const UNITS_PER_FLOOR = 6;
export const FLOOR_H = 36;
export const UNIT_W = 60;
export const START_X = 90;
export const START_Y = 60;

export const TOWER_W = START_X * 2 + UNIT_W * UNITS_PER_FLOOR;
export const TOWER_H = START_Y * 2 + FLOORS * FLOOR_H + 40;

export type Window = { floor: number; unit: number };

export function windowRect(w: Window) {
  const rowIdx = FLOORS - w.floor; // top-down index
  const x = START_X + w.unit * UNIT_W;
  const y = START_Y + rowIdx * FLOOR_H;
  return { x, y, w: UNIT_W, h: FLOOR_H, cx: x + UNIT_W / 2, cy: y + FLOOR_H / 2 };
}

// build a viewBox string that focuses on a given rectangle with padding
export function focusViewBox(target: { x: number; y: number; w: number; h: number }, pad = 0.6) {
  const padX = target.w * pad;
  const padY = target.h * pad;
  const x = target.x - padX;
  const y = target.y - padY;
  const w = target.w + padX * 2;
  const h = target.h + padY * 2;
  // maintain aspect by widening one axis
  const targetAspect = TOWER_W / TOWER_H;
  const have = w / h;
  if (have < targetAspect) {
    const newW = h * targetAspect;
    return { x: x - (newW - w) / 2, y, w: newW, h };
  }
  const newH = w / targetAspect;
  return { x, y: y - (newH - h) / 2, w, h: newH };
}

export function fullViewBox() {
  return { x: 0, y: 0, w: TOWER_W, h: TOWER_H };
}

// litness deterministic
export const isLit = (f: number, u: number) => ((f * 7 + u * 3) % 11) < 4;

export function TowerCamera({
  progress,
  scenes,
  highlight,
}: {
  progress: MotionValue<number>;
  scenes: { at: number; window: Window | 'full' }[];
  highlight: MotionValue<Window | null>;
}) {
  // Interpolate viewBox by stitching the scenes as keyframes
  const vbX = useTransform(progress, scenes.map(s => s.at), scenes.map(s => s.window === 'full' ? 0 : focusViewBox(windowRect(s.window)).x));
  const vbY = useTransform(progress, scenes.map(s => s.at), scenes.map(s => s.window === 'full' ? 0 : focusViewBox(windowRect(s.window)).y));
  const vbW = useTransform(progress, scenes.map(s => s.at), scenes.map(s => s.window === 'full' ? TOWER_W : focusViewBox(windowRect(s.window)).w));
  const vbH = useTransform(progress, scenes.map(s => s.at), scenes.map(s => s.window === 'full' ? TOWER_H : focusViewBox(windowRect(s.window)).h));

  const viewBox = useTransform([vbX, vbY, vbW, vbH], ([x, y, w, h]) => `${x} ${y} ${w} ${h}`);

  return (
    <motion.svg
      viewBox={viewBox as any}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      <defs>
        <pattern id="t-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--line)" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="t-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.08" />
        </linearGradient>
        <filter id="window-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      <rect x="0" y="0" width={TOWER_W} height={START_Y + 20} fill="url(#t-sky)" />

      {/* horizon */}
      <line x1="0" y1={START_Y + FLOORS * FLOOR_H + 20} x2={TOWER_W} y2={START_Y + FLOORS * FLOOR_H + 20} stroke="var(--line)" strokeWidth="0.5" />
      <rect x="0" y={START_Y + FLOORS * FLOOR_H + 20} width={TOWER_W} height="40" fill="url(#t-hatch)" opacity="0.4" />

      {/* crown */}
      <polyline
        points={`${START_X - 16},${START_Y} ${TOWER_W / 2},${START_Y - 30} ${START_X + UNIT_W * UNITS_PER_FLOOR + 16},${START_Y}`}
        fill="none" stroke="var(--ink)" strokeWidth="1"
      />

      {/* rooftop signage — the marquee */}
      <g>
        <line x1={START_X + 30} y1={START_Y - 18} x2={START_X + UNIT_W * UNITS_PER_FLOOR - 30} y2={START_Y - 18} stroke="var(--accent)" strokeWidth="0.4" />
        <text
          x={TOWER_W / 2}
          y={START_Y - 7}
          textAnchor="middle"
          fill="var(--accent)"
          fontSize="9"
          fontFamily="var(--font-mono)"
          letterSpacing="3"
        >
          FLUXORA
        </text>
        <text
          x={TOWER_W / 2}
          y={START_Y - 24}
          textAnchor="middle"
          fill="var(--ink-muted)"
          fontSize="4"
          fontFamily="var(--font-mono)"
          letterSpacing="2.5"
        >
          A RESIDENCE OS · EST. DHAKA 2024
        </text>
      </g>

      <line x1={TOWER_W / 2} y1={START_Y - 36} x2={TOWER_W / 2} y2={START_Y - 70} stroke="var(--accent)" strokeWidth="1" />
      <circle cx={TOWER_W / 2} cy={START_Y - 74} r="3" fill="var(--accent)" />

      {/* floors */}
      {Array.from({ length: FLOORS }).map((_, i) => {
        const f = FLOORS - i;
        const y = START_Y + i * FLOOR_H;
        return (
          <g key={f}>
            <motion.line
              x1={START_X - 18} y1={y + FLOOR_H} x2={START_X + UNIT_W * UNITS_PER_FLOOR + 18} y2={y + FLOOR_H}
              stroke="var(--ink)" strokeWidth="0.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: i * 0.03 }}
            />
            <text x={START_X - 22} y={y + FLOOR_H - 10} textAnchor="end" fill="var(--ink-muted)" fontSize="6" fontFamily="var(--font-mono)">
              {String(f).padStart(2, '0')}
            </text>

            {Array.from({ length: UNITS_PER_FLOOR }).map((_, u) => {
              const x = START_X + u * UNIT_W;
              const lit = isLit(f, u);
              return (
                <Window key={u} f={f} u={u} x={x} y={y} lit={lit} highlight={highlight} />
              );
            })}
          </g>
        );
      })}

      {/* base */}
      <rect x={START_X - 30} y={START_Y + FLOORS * FLOOR_H} width={UNIT_W * UNITS_PER_FLOOR + 60} height={20} fill="var(--bg-raised)" stroke="var(--ink)" strokeWidth="0.5" />

      {/* dimension callout */}
      <g stroke="var(--accent)" strokeWidth="0.4">
        <line x1={START_X + UNIT_W * UNITS_PER_FLOOR + 30} y1={START_Y} x2={START_X + UNIT_W * UNITS_PER_FLOOR + 30} y2={START_Y + FLOORS * FLOOR_H} />
        <line x1={START_X + UNIT_W * UNITS_PER_FLOOR + 26} y1={START_Y} x2={START_X + UNIT_W * UNITS_PER_FLOOR + 34} y2={START_Y} />
        <line x1={START_X + UNIT_W * UNITS_PER_FLOOR + 26} y1={START_Y + FLOORS * FLOOR_H} x2={START_X + UNIT_W * UNITS_PER_FLOOR + 34} y2={START_Y + FLOORS * FLOOR_H} />
      </g>
      <text x={START_X + UNIT_W * UNITS_PER_FLOOR + 38} y={START_Y + (FLOORS * FLOOR_H) / 2} fill="var(--accent)" fontSize="6" fontFamily="var(--font-mono)">14F</text>
    </motion.svg>
  );
}

function Window({ f, u, x, y, lit, highlight }: { f: number; u: number; x: number; y: number; lit: boolean; highlight: MotionValue<{ floor: number; unit: number } | null> }) {
  const isHL = useTransform(highlight, h => h && h.floor === f && h.unit === u);
  const stroke = useTransform(isHL, v => v ? 'var(--accent)' : 'var(--ink)');
  const strokeW = useTransform(isHL, v => v ? 0.9 : 0.4);
  const fill = useTransform(isHL, v => v ? 'var(--accent)' : (lit ? 'var(--accent)' : 'var(--bg-sunken)'));
  const opacity = useTransform(isHL, v => v ? 1 : (lit ? 0.7 : 0.45));

  return (
    <motion.rect
      x={x + 6} y={y + 6}
      width={UNIT_W - 12} height={FLOOR_H - 12}
      fill={fill as any}
      stroke={stroke as any}
      strokeWidth={strokeW as any}
      opacity={opacity as any}
    />
  );
}
