// Derived values (Build Spec §5). Computed, never hard-coded.
import type { Account, AccountType, Goal } from './seed';
import type { State } from './store';
import { daysFromToday, pct, round2 } from './format';

export const isShared = (a: Account) => a.owner === 'joint' || !!a.goalId || a.shared;

/** Accounts TD Together shows: everything shared once the partner has joined; only Sydney's and joint ones while waiting. */
export const togetherAccounts = (s: State) =>
  s.accounts.filter((a) => isShared(a) && (s.together.status === 'joined' || a.owner !== 'partner'));

export const combinedBalance = (s: State) =>
  round2(togetherAccounts(s).filter((a) => a.type !== 'credit').reduce((t, a) => t + a.balance, 0));

export const sumOf = (list: Account[]) => round2(list.reduce((t, a) => t + a.balance, 0));

const OWNER_ORDER = { partner: 0, you: 1, joint: 2 } as const;
export const byType = (s: State, type: AccountType) =>
  togetherAccounts(s)
    .filter((a) => a.type === type)
    .sort((a, b) => OWNER_ORDER[a.owner] - OWNER_ORDER[b.owner]);

export const byOwner = (s: State) => {
  const list = togetherAccounts(s).filter((a) => a.type !== 'credit');
  const you = sumOf(list.filter((a) => a.owner === 'you'));
  const partner = sumOf(list.filter((a) => a.owner === 'partner'));
  const joint = sumOf(list.filter((a) => a.owner === 'joint'));
  const total = round2(you + partner + joint);
  return { you, partner, joint, total, count: list.length };
};

export const goalAccount = (s: State, g: Goal) => (g.accountId ? s.accounts.find((a) => a.id === g.accountId) : undefined);
export const goalSaved = (s: State, g: Goal) => goalAccount(s, g)?.balance ?? 0;

export const goalStats = (s: State, g: Goal) => {
  const saved = goalSaved(s, g);
  const percent = Math.min(100, pct(saved, g.target));
  const left = round2(Math.max(0, g.target - saved));
  const totalC = g.contributions.you + g.contributions.partner;
  const youPct = totalC > 0 ? pct(g.contributions.you, totalC) : 0;
  const partnerPct = totalC > 0 ? 100 - youPct : 0;
  return { saved, percent, left, youPct, partnerPct, totalC };
};

export const goalChip = (g: Goal) => (g.status === 'pending' ? 'PENDING' : g.ownership === 'joint' ? 'JOINT HISA' : 'SEPARATE');

/** Upcoming bills in date order. While waiting for the partner, only Sydney's own reminders show. */
export const upcomingBills = (s: State) =>
  s.bills
    .filter((b) => s.together.status === 'joined' || b.addedBy === 'you')
    .filter((b) => b.repeats !== 'once' || daysFromToday(b.nextDue) >= 0)
    .slice()
    .sort((a, b) => a.nextDue.localeCompare(b.nextDue));

export const repeatsLabel = (r: string) =>
  ({ once: 'One time', week: 'Weekly', '2weeks': 'Every 2 weeks', month: 'Monthly', year: 'Yearly' })[r] ?? 'Monthly';

/** Sydney's accounts she can turn sharing on or off for (Manage sharing / setup). */
export const myToggleable = (s: State) =>
  s.accounts.filter((a) => a.owner === 'you' && !a.goalId && a.type !== 'savings');
/** Accounts that are always shared: joint accounts and goal accounts. */
export const alwaysShared = (s: State) => s.accounts.filter((a) => a.owner === 'joint' || (a.owner === 'you' && a.goalId));

export const accountLabel = (s: State, a: Account) => {
  const goal = a.goalId ? s.goals.find((g) => g.id === a.goalId) : undefined;
  if (goal && a.owner === 'joint') return goal.name;
  if (goal) return goal.name;
  if (a.owner === 'joint') {
    const g = s.goals.find((x) => x.accountId === a.id);
    if (g) return g.name;
  }
  return a.name;
};
