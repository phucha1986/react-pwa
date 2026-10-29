import { GOLD, GRASS, INK, NIGHT, SKY, WATER } from './palette';
import type { SceneId } from './story';

const LINE = {
  fill: 'none',
  stroke: INK,
  strokeWidth: 3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

type Pos = { x: number; y: number; s?: number; flip?: boolean };

function Cricket({ x, y, s = 1, flip = false, color = '#5a4632' }: Pos & { color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx="-12" cy="0" rx="22" ry="13" fill={color} stroke={INK} strokeWidth={3} />
      <path d="M -32 -4 q 12 -12 24 -6" {...LINE} strokeWidth={2.5} />
      <circle cx="12" cy="-3" r="11" fill={color} stroke={INK} strokeWidth={3} />
      <circle cx="15" cy="-6" r="2.5" fill={INK} />
      <path d="M 18 -11 q 14 -10 22 -3" {...LINE} strokeWidth={2} />
      <path d="M -34 -2 q -10 -4 -14 -10" {...LINE} strokeWidth={2} />
      <path d="M -14 2 q -14 6 -20 14" {...LINE} strokeWidth={3} />
      <path d="M -20 12 l -6 12 M -8 13 l -2 11 M 4 12 l 6 11" {...LINE} strokeWidth={2.5} />
    </g>
  );
}

function Toad({ x, y, s = 1, flip = false }: Pos) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx="0" cy="0" rx="26" ry="19" fill="#9aa6c8" stroke={INK} strokeWidth={3} />
      <circle cx="14" cy="-16" r="7" fill="#9aa6c8" stroke={INK} strokeWidth={3} />
      <circle cx="-8" cy="-18" r="7" fill="#9aa6c8" stroke={INK} strokeWidth={3} />
      <circle cx="14" cy="-17" r="3" fill={INK} />
      <circle cx="-8" cy="-19" r="3" fill={INK} />
      <path d="M 4 4 q 10 5 18 0" {...LINE} strokeWidth={2.5} />
      <path d="M -18 18 l -8 8 M 12 18 l 8 8" {...LINE} strokeWidth={3} />
    </g>
  );
}

function Snail({ x, y, s = 1, flip = false }: Pos) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx="-14" cy="8" rx="16" ry="8" fill="#e8b07a" stroke={INK} strokeWidth={3} />
      <circle cx="4" cy="-4" r="18" fill={GOLD} stroke={INK} strokeWidth={3} />
      <path d="M 4 -4 q 10 -1 8 -9 q -5 -8 -13 -4 q -8 6 5 13" {...LINE} strokeWidth={2.5} />
      <path d="M -26 3 q -6 -10 -2 -16 M -21 2 q -2 -12 4 -16" {...LINE} strokeWidth={2} />
      <circle cx="-24" cy="1" r="2.5" fill={INK} />
    </g>
  );
}

function Dragonfly({ x, y, s = 1, flip = false }: Pos) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx="0" cy="0" rx="24" ry="6" fill="#4d96ff" stroke={INK} strokeWidth={3} />
      <ellipse
        cx="-8"
        cy="-13"
        rx="19"
        ry="8"
        fill="rgba(255,255,255,0.8)"
        stroke={INK}
        strokeWidth={2}
      />
      <ellipse
        cx="-8"
        cy="13"
        rx="19"
        ry="8"
        fill="rgba(255,255,255,0.8)"
        stroke={INK}
        strokeWidth={2}
      />
      <circle cx="24" cy="0" r="8" fill="#4d96ff" stroke={INK} strokeWidth={3} />
      <circle cx="26" cy="-2" r="3" fill={INK} />
    </g>
  );
}

function WaterStrider({ x, y, s = 1 }: Pos) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="14" ry="6" fill="#6b5b45" stroke={INK} strokeWidth={3} />
      <path
        d="M -8 -2 l -20 -10 M 0 -3 l 0 -14 M 8 -2 l 20 -10 M -8 2 l -20 10 M 0 3 l 0 14 M 8 2 l 20 10"
        {...LINE}
        strokeWidth={2}
      />
    </g>
  );
}

function Spider({ x, y, s = 1 }: Pos) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="0" cy="0" r="14" fill="#3b4668" stroke={INK} strokeWidth={3} />
      <path
        d="M -12 -6 l -14 -10 M -13 0 l -17 -2 M -12 6 l -14 10 M 12 -6 l 14 -10 M 13 0 l 17 -2 M 12 6 l 14 10"
        {...LINE}
        strokeWidth={2}
      />
      <circle cx="-4" cy="-3" r="2" fill={INK} />
      <circle cx="4" cy="-3" r="2" fill={INK} />
    </g>
  );
}

function Leaf({ x, y, s = 1, rot = 0, fill = '#7fbf6b' }: Pos & { rot?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path
        d="M -40 0 q 20 -34 60 -10 q -14 34 -60 10 Z"
        fill={fill}
        stroke={INK}
        strokeWidth={3}
      />
      <path d="M -36 1 q 26 -6 52 -9" {...LINE} strokeWidth={2} />
    </g>
  );
}

function GrassTuft({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M ${x} ${y} q -6 -16 -10 -22 M ${x} ${y} q 0 -18 2 -26 M ${x} ${y} q 7 -15 12 -21`}
      {...LINE}
      strokeWidth={2.5}
    />
  );
}

function Stars() {
  const points = [
    [40, 40],
    [90, 70],
    [150, 35],
    [210, 60],
    [260, 30],
    [310, 75],
    [355, 45],
    [120, 110],
    [285, 120],
  ];
  return (
    <g>
      {points.map(([px, py], i) => (
        <g key={i}>
          <circle cx={px} cy={py} r={3.5} fill={GOLD} />
          <path
            d={`M ${px} ${py - 8} l 0 16 M ${px - 8} ${py} l 16 0`}
            stroke={GOLD}
            strokeWidth={1.5}
          />
        </g>
      ))}
    </g>
  );
}

function Rain() {
  const drops = [30, 70, 110, 150, 190, 230, 270, 310, 350];
  return (
    <g>
      {drops.map((x, i) => (
        <path
          key={i}
          d={`M ${x} ${30 + (i % 3) * 22} q 6 14 10 26`}
          stroke="#4d96ff"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </g>
  );
}

function SceneContent({ scene }: { scene: SceneId }) {
  switch (scene) {
    case 'cave':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill={SKY} />
          <rect x="0" y="210" width="400" height="90" fill={GRASS} />
          <path
            d="M 60 250 q 40 -70 120 -60 q 60 8 60 60 Z"
            fill="#c9a06a"
            stroke={INK}
            strokeWidth={3}
          />
          <ellipse cx="120" cy="240" rx="26" ry="22" fill="#3a2c1c" stroke={INK} strokeWidth={3} />
          <GrassTuft x={300} y={270} />
          <GrassTuft x={350} y={255} />
          <Cricket x={250} y={190} />
        </g>
      );
    case 'toad':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill={SKY} />
          <rect x="0" y="210" width="400" height="90" fill={GRASS} />
          <path
            d="M 100 250 q 20 -40 70 -34 q 40 6 40 34 Z"
            fill="#b9c1cc"
            stroke={INK}
            strokeWidth={3}
          />
          <Toad x={140} y={205} />
          <Cricket x={280} y={195} flip />
          <GrassTuft x={350} y={265} />
        </g>
      );
    case 'flood':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill={SKY} />
          <path
            d="M 0 190 q 120 -20 220 0 q 120 22 180 -6 l 0 116 l -400 0 Z"
            fill={WATER}
            stroke={INK}
            strokeWidth={3}
          />
          <Leaf x={110} y={150} rot={-12} />
          <WaterStrider x={280} y={215} />
          <g transform="translate(110 120) scale(0.8)">
            <Cricket x={0} y={0} />
          </g>
        </g>
      );
    case 'snail':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill={SKY} />
          <rect x="0" y="220" width="400" height="80" fill={GRASS} />
          <Leaf x={200} y={170} s={1.6} />
          <Snail x={190} y={150} />
          <Cricket x={320} y={250} flip />
        </g>
      );
    case 'flying':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill={SKY} />
          <ellipse cx="70" cy="60" rx="40" ry="18" fill="#ffffff" stroke={INK} strokeWidth={2.5} />
          <ellipse
            cx="330"
            cy="110"
            rx="34"
            ry="16"
            fill="#ffffff"
            stroke={INK}
            strokeWidth={2.5}
          />
          <Dragonfly x={250} y={90} />
          <g transform="translate(150 190)">
            <path d="M -20 -10 q 10 -26 34 -22" {...LINE} strokeWidth={3} />
            <Cricket x={0} y={0} s={0.9} />
          </g>
          <rect x="0" y="250" width="400" height="50" fill={GRASS} />
        </g>
      );
    case 'night':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill={NIGHT} />
          <Stars />
          <circle cx="340" cy="60" r="26" fill={GOLD} stroke={INK} strokeWidth={3} />
          <rect x="0" y="230" width="400" height="70" fill="#2f3b57" />
          <Cricket x={170} y={215} color="#46536f" />
        </g>
      );
    case 'spider':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill="#2b3557" />
          <path
            d="M 400 0 l -180 120 M 400 0 l -140 160 M 400 0 l -90 190 M 400 0 l -40 210"
            stroke="#8f9bbd"
            strokeWidth={2}
            fill="none"
          />
          <path
            d="M 250 40 q 60 40 110 30 M 210 80 q 70 50 130 40 M 170 120 q 70 55 140 45"
            stroke="#8f9bbd"
            strokeWidth={2}
            fill="none"
          />
          <Spider x={300} y={120} />
          <Cricket x={120} y={230} color="#46536f" />
        </g>
      );
    case 'storm':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill="#cfd8e6" />
          <Rain />
          <Leaf x={200} y={170} s={2.2} rot={-6} fill="#5fa855" />
          <Toad x={120} y={245} s={0.8} />
          <Snail x={230} y={250} s={0.8} />
          <Cricket x={320} y={250} s={0.85} flip />
        </g>
      );
    case 'after':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill={SKY} />
          <circle cx="60" cy="60" r="28" fill={GOLD} stroke={INK} strokeWidth={3} />
          <path
            d="M 120 90 q 90 -50 180 -10"
            stroke="#e07a5f"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 130 110 q 90 -46 170 -8"
            stroke="#4d96ff"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
          <rect x="0" y="210" width="400" height="90" fill={GRASS} />
          <Snail x={150} y={245} />
          <Toad x={280} y={240} flip />
          <GrassTuft x={350} y={270} />
        </g>
      );
    case 'reunion':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill={SKY} />
          <rect x="0" y="210" width="400" height="90" fill={GRASS} />
          <Cricket x={140} y={200} />
          <g transform="translate(280 215) scale(0.6)">
            <Cricket x={0} y={0} flip />
          </g>
          <GrassTuft x={60} y={265} />
          <GrassTuft x={350} y={255} />
        </g>
      );
    case 'lesson':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill={SKY} />
          <rect x="0" y="220" width="400" height="80" fill={GRASS} />
          <Cricket x={200} y={190} />
          <Toad x={80} y={250} s={0.85} />
          <Snail x={310} y={255} s={0.85} />
          <Dragonfly x={320} y={90} s={0.8} flip />
          <WaterStrider x={110} y={110} s={0.8} />
        </g>
      );
    case 'home':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill={SKY} />
          <rect x="0" y="210" width="400" height="90" fill={GRASS} />
          <path
            d="M 120 260 q 30 -90 110 -80 q 70 10 70 80 Z"
            fill="#c9a06a"
            stroke={INK}
            strokeWidth={3}
          />
          <ellipse cx="185" cy="245" rx="30" ry="26" fill="#3a2c1c" stroke={INK} strokeWidth={3} />
          <path d="M 230 175 l 0 -30 M 230 145 l 20 12" {...LINE} strokeWidth={3} />
          <Toad x={60} y={250} s={0.8} />
          <Snail x={330} y={250} s={0.8} flip />
          <Cricket x={250} y={190} s={0.85} />
        </g>
      );
  }
}

export default function PanelArt({ scene }: { scene: SceneId }) {
  return (
    <svg
      viewBox="0 0 400 300"
      width="100%"
      height="100%"
      role="img"
      aria-label={`comic scene: ${scene}`}
      data-pw={`comic-art-${scene}`}
    >
      <SceneContent scene={scene} />
    </svg>
  );
}
