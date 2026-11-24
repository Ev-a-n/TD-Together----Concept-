import { TODAY } from './seed';

const moneyFmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const wholeFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** $1,234.56 — negatives use a true minus sign, as in the designs. */
export const money = (n: number) => (n < 0 ? '−' : '') + '$' + moneyFmt.format(Math.abs(round2(n)));
/** +$250.00 / −$150.00 */
export const signedMoney = (n: number) => (n < 0 ? '−' : '+') + '$' + moneyFmt.format(Math.abs(round2(n)));
/** $20,000 (no cents, for targets) */
export const moneyWhole = (n: number) => (Number.isInteger(round2(n)) ? '$' + wholeFmt.format(n) : money(n));

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Parses "$1,250.00", "1250", "1,250.5" → 1250.5 (NaN if not a number). */
export const parseMoney = (s: string) => {
  const clean = s.replace(/[^0-9.]/g, '');
  if (!clean) return NaN;
  return round2(parseFloat(clean));
};

export const parseDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** "Sat, Nov 14" */
export const shortDay = (iso: string) =>
  parseDate(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
/** "Nov 14, 2026" */
export const longDate = (iso: string) =>
  parseDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
/** "Nov 14" */
export const monthDay = (iso: string) => parseDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const daysFromToday = (iso: string) => Math.round((parseDate(iso).getTime() - parseDate(TODAY).getTime()) / 86400000);

export const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
