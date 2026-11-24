// Combined balance history. YTD follows the line exported from Figma; the other ranges are made-up
// history that ends at the current combined balance.
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { parseDate, toIso, monthDay, round2 } from '../state/format';
import { TODAY } from '../state/seed';

// chart-line.svg from the Figma file (402 × 134), YTD.
export const CHART_PATH =
  'M0 133.358L6.16092 123.32H13.8621H20.023L30.2912 133.358H36.9655L43.1264 123.32L55.4483 106.256L68.2835 116.795L73.931 108.765L90.3602 116.795V123.32H101.655V116.795L110.897 108.765V99.7311V88.1877L120.138 81.6632L123.732 94.2104V106.256L132.973 94.2104L138.621 86.1802L140.161 76.1424V65.6028L152.483 76.1424V81.6632L159.671 88.1877L166.345 94.2104L184.828 99.7311V108.765H203.31V99.7311L208.958 90.6972V81.6632L219.739 65.6028H231.034V76.1424L239.249 65.6028V55.5651L245.923 65.6028L250.544 69.116L256.705 65.6028V55.5651L272.621 46.5311V69.116H286.483L290.077 60.0821L296.751 55.5651V46.5311L307.533 40.0066H324.475L332.69 31.9764L344.498 26.4557L359.387 20.433V31.9764V46.5311L370.682 31.9764L376.843 20.433L383.517 8.38773L389.165 6.88207H395.326L402 0.357544';

/** The path's vertices, in order. */
function parsePath(d: string) {
  const pts: [number, number][] = [];
  const re = /([MLHV])([^MLHV]+)/g;
  let x = 0;
  let y = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    const nums = m[2].trim().split(/[\s,]+/).map(Number);
    if (m[1] === 'M' || m[1] === 'L') {
      for (let i = 0; i < nums.length; i += 2) {
        x = nums[i];
        y = nums[i + 1];
        pts.push([x, y]);
      }
    } else if (m[1] === 'H') {
      for (const n of nums) {
        x = n;
        pts.push([x, y]);
      }
    } else {
      for (const n of nums) {
        y = n;
        pts.push([x, y]);
      }
    }
  }
  return pts;
}

const VERTS = parsePath(CHART_PATH);
const Y_MIN = 0.357544;
const Y_MAX = 133.358;
export const YTD_CHANGE = 1240.18;

const yAt = (x: number) => {
  // Last vertex at or before x, interpolated to the next one.
  for (let i = VERTS.length - 1; i > 0; i--) {
    const [x0, y0] = VERTS[i - 1];
    const [x1, y1] = VERTS[i];
    if (x >= x0 && x <= x1) return x1 === x0 ? y1 : y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return VERTS[0][1];
};

const addDays = (iso: string, n: number) => {
  const d = parseDate(iso);
  d.setDate(d.getDate() + n);
  return toIso(d);
};
const daysBetween = (a: string, b: string) => Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86400000);

/** Small seeded random, so the made-up history is the same on every visit. */
const rand = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

export type Range = '1M' | '3M' | 'YTD' | '1Y';
export const RANGE_WORDS: Record<Range, string> = { '1M': 'past month', '3M': 'past 3 months', YTD: 'this year', '1Y': 'past year' };

export interface Series {
  values: number[];
  dates: string[];
  startLabel: string;
}

export function buildSeries(range: Range, current: number): Series {
  const jan1 = '2026-01-01';
  const n = daysBetween(jan1, TODAY); // 314
  const start = current - YTD_CHANGE;
  const ytd = Array.from({ length: n + 1 }, (_, d) => start + ((Y_MAX - yAt((d / n) * 402)) / (Y_MAX - Y_MIN)) * YTD_CHANGE);
  const ytdDates = ytd.map((_, d) => addDays(jan1, d));
  if (range === 'YTD') return { values: ytd, dates: ytdDates, startLabel: 'Jan 1' };
  if (range === '1Y') {
    const extra = daysBetween('2025-11-11', jan1);
    const r = rand(7);
    const before: number[] = [];
    let v = start;
    for (let i = 0; i < extra; i++) {
      before.unshift(v);
      v -= (r() - 0.42) * 70;
    }
    return {
      values: [...before, ...ytd],
      dates: [...Array.from({ length: extra }, (_, i) => addDays('2025-11-11', i)), ...ytdDates],
      startLabel: 'Nov 11, 2025',
    };
  }
  const len = range === '1M' ? 30 : 92;
  const amp = range === '1M' ? 55 : 90;
  const r = rand(range === '1M' ? 11 : 23);
  const base = ytd.slice(-len - 1);
  // Gentle wobble that fades out at today, so the end value stays exact.
  let w = 0;
  const values = base.map((v, i) => {
    w = w * 0.7 + (r() - 0.5) * amp;
    const fade = 1 - i / (base.length - 1);
    return v + w * fade;
  });
  return { values, dates: ytdDates.slice(-len - 1), startLabel: monthDay(ytdDates[ytdDates.length - len - 1]) };
}

export const seriesChange = (s: Series) => {
  const first = s.values[0];
  const last = s.values[s.values.length - 1];
  const change = round2(last - first);
  return { change, percent: first ? (change / first) * 100 : 0 };
};

export interface Marker {
  n: number;
  date: string;
}

export function BalanceChart({ series, markers, width, height = 150 }: { series: Series; markers: Marker[]; width: number; height?: number }) {
  const { path, dots } = useMemo(() => {
    const vals = series.values;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const padT = 14;
    const padB = 12;
    const span = max - min || 1;
    const X = (i: number) => (i / (vals.length - 1)) * (width - 14) + 2;
    const Y = (v: number) => padT + (1 - (v - min) / span) * (height - padT - padB);
    const d = vals.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
    const ds = markers
      .map((m) => {
        const i = series.dates.indexOf(m.date);
        return i < 0 ? null : { n: m.n, x: X(i), y: Y(vals[i]) };
      })
      .filter(Boolean) as { n: number; x: number; y: number }[];
    return { path: d, dots: ds };
  }, [series, markers, width, height]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
      <motion.path key={series.startLabel} d={path} fill="none" stroke="var(--green-bright)" strokeWidth="1.2" strokeLinejoin="round" initial={{ pathLength: 0, opacity: 0.4 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }} />
      {dots.map((d) => (
        <g key={d.n}>
          <circle cx={d.x} cy={d.y} r="7.5" fill="#fff" stroke="var(--green)" strokeWidth="1.5" />
          <text x={d.x} y={d.y + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--green)" fontFamily="Inter, sans-serif">
            {d.n}
          </text>
        </g>
      ))}
    </svg>
  );
}
