// Money visuals: goal ring, goal gauge, goal card, bill tile, shared account card, contribution bar.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from './icons';
import { Avatar, Avatars, Chip, Collapse, Money } from './ui';
import { daysFromToday, money, moneyWhole, shortDay } from '../state/format';
import { goalChip, goalStats, sumOf } from '../state/derive';
import type { Account, Bill, Goal, Person } from '../state/seed';
import type { State } from '../state/store';

/** Point on a circle; angle in degrees clockwise from `zero` (deg, clockwise from 3 o'clock). */
const pt = (cx: number, cy: number, r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
};
const arc = (cx: number, cy: number, r: number, from: number, to: number) => {
  const [x1, y1] = pt(cx, cy, r, from);
  const [x2, y2] = pt(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

/** 80px ring: 330° track with a 30° gap at the bottom; progress from the gap's left end, clockwise. */
export function GoalRing({ percent, size = 80 }: { percent: number; size?: number }) {
  const c = size / 2;
  const r = c - 4;
  // Angles clockwise from 3 o'clock: the gap is centred at 90° (bottom), so the track runs 105° → 435°.
  const start = 105;
  const track = arc(c, c, r, start, start + 330);
  const len = (r * 330 * Math.PI) / 180;
  const p = Math.min(1, percent / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ring" aria-label={`${percent}% saved`}>
      <path d={track} stroke="var(--ring-track)" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path
        d={track}
        stroke="var(--green-bright)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        style={{ strokeDasharray: `${(len * p).toFixed(2)} ${len + 20}`, opacity: p > 0 ? 1 : 0, transition: 'stroke-dasharray 600ms cubic-bezier(.25,.1,.25,1), opacity 200ms' }}
      />
      <text x={c} y={c + 4} textAnchor="middle" fontSize="12" fill="#6f6f6f" fontFamily="Inter, sans-serif">
        {percent}%
      </text>
    </svg>
  );
}

/** Goal page gauge: 300 × 208, r 142 at (150,150), stroke 16; track 160° → 380°. */
export function Gauge({ percent }: { percent: number }) {
  const start = 160;
  const track = arc(150, 150, 142, start, start + 220);
  const len = (142 * 220 * Math.PI) / 180;
  const p = Math.min(1, percent / 100);
  return (
    <svg width="300" height="208" viewBox="0 0 300 208" aria-hidden="true" style={{ display: 'block' }}>
      <path d={track} stroke="var(--ring-track)" strokeWidth="16" strokeLinecap="round" fill="none" />
      <path
        d={track}
        stroke="var(--green-bright)"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
        style={{ strokeDasharray: `${(len * p).toFixed(2)} ${len + 40}`, opacity: p > 0 ? 1 : 0, transition: 'stroke-dasharray 700ms cubic-bezier(.25,.1,.25,1), opacity 200ms' }}
      />
    </svg>
  );
}

export function GoalCard({ state, goal, onClick }: { state: State; goal: Goal; onClick?: () => void }) {
  const st = goalStats(state, goal);
  return (
    <button className="goal-card card" onClick={onClick} aria-label={`${goal.name}, ${money(st.saved)} of ${moneyWhole(goal.target)}`}>
      <span className="name-row">
        <span className="name">{goal.name}</span>
        <Chip>{goalChip(goal)}</Chip>
      </span>
      <span className="saved">
        <Money value={st.saved} />
      </span>
      <span className="of">of {moneyWhole(goal.target)}</span>
      <GoalRing percent={st.percent} />
      <span className="chev">
        <Icon name="chevronRight" size={22} color="#6f6f6f" />
      </span>
    </button>
  );
}

export function BillTile({ bill, people }: { bill: Bill; people: State['people'] }) {
  const days = daysFromToday(bill.nextDue);
  const label = days <= 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`;
  const payers = bill.payers.includes('partner') && bill.payers.includes('you') ? [people.partner, people.you] : bill.payers.map((p) => people[p]);
  return (
    <div className="bill-tile">
      <div className="top">
        <Avatars people={payers} size={26} border={2} />
        <span className={`pill ${days <= 3 ? 'soon' : ''}`}>{label}</span>
      </div>
      <div>
        <div className="bname">{bill.name}</div>
        <div className="bdate">{shortDay(bill.nextDue)}</div>
        <div className="bamt">
          {bill.estimate ? '~' : ''}
          {money(bill.amount)}
        </div>
      </div>
    </div>
  );
}

export const payersOf = (bill: Bill, people: State['people']): Person[] =>
  bill.payers.includes('partner') && bill.payers.includes('you') ? [people.partner, people.you] : bill.payers.map((p) => people[p]);

export function AccountCard({
  title,
  accounts,
  state,
  defaultOpen = false,
  label,
}: {
  title: string;
  accounts: Account[];
  state: State;
  defaultOpen?: boolean;
  label: (a: Account) => string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const total = sumOf(accounts);
  return (
    <div className="acct-card card-soft">
      <button className="acct-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="t" style={{ display: 'block' }}>
            {title}
          </span>
          <span className="total" style={{ display: 'block' }}>
            <Money value={total} />
          </span>
        </span>
        <span className={`acct-toggle ${open ? 'open' : ''}`}>
          <Icon name="chevronDown" size={16} color="#3d3d3d" />
        </span>
      </button>
      <Collapse open={open}>
        <div>
          {accounts.length === 0 && (
            <div className="acct-row" style={{ color: 'var(--text-2)', fontSize: 13 }}>
              Nothing shared here yet
            </div>
          )}
          {accounts.map((a) => (
            <div className="acct-row" key={a.id}>
              <span className="slot">
                {a.owner === 'joint' ? (
                  <Avatars people={[state.people.partner, state.people.you]} size={24} />
                ) : (
                  <Avatar person={state.people[a.owner]} size={24} />
                )}
              </span>
              <span style={{ display: 'flex', alignItems: 'baseline', minWidth: 0 }}>
                <span className="nm">{label(a)}</span>
                <span className="num">••{a.last4}</span>
              </span>
              <span className="amt">
                <Money value={a.balance} />
              </span>
            </div>
          ))}
        </div>
      </Collapse>
    </div>
  );
}

/** Two-person split bar (contributions, owners). */
export function SplitBar({ parts }: { parts: { value: number; color: string }[] }) {
  const total = parts.reduce((t, p) => t + p.value, 0);
  return (
    <div style={{ display: 'flex', gap: 3, height: 8 }}>
      {parts.map((p, i) => (
        <motion.span
          key={i}
          initial={false}
          animate={{ flexGrow: total > 0 ? Math.max(p.value, 0.0001) : 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ flexBasis: 0, borderRadius: 4, background: total > 0 ? p.color : '#e2e2e2' }}
        />
      ))}
    </div>
  );
}
