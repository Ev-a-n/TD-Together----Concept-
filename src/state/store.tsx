// One store for the whole demo (React context + useReducer). Every screen reads from it.
import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { seed, TODAY, type Account, type Bill, type Goal, type Person, type TogetherStatus, type Who } from './seed';
import { monthDay, round2 } from './format';

export type GuideKey = 'setup' | 'joined' | 'balance' | 'addMoney' | 'newGoal' | 'jointGoal' | 'bill' | 'sharing' | 'leave';

export interface State {
  people: { you: Person; partner: Person };
  accounts: Account[];
  goals: Goal[];
  bills: Bill[];
  together: {
    status: TogetherStatus;
    introShown: boolean;
    cardDismissed: boolean;
    inviteMethod: 'text' | 'email';
    inviteContact: string;
    joinedOn: string | null;
    sharingSince: string | null;
  };
  notify: { bills: boolean; goals: boolean; sharing: boolean };
  guide: Partial<Record<GuideKey, boolean>>;
  updatedAt: number;
  seq: number;
}

export const initialState = (): State => ({
  people: structuredClone(seed.people),
  accounts: structuredClone(seed.accounts),
  goals: structuredClone(seed.goals),
  bills: structuredClone(seed.bills),
  together: {
    status: 'none',
    introShown: false,
    cardDismissed: false,
    inviteMethod: 'text',
    inviteContact: seed.demo.invite.phone,
    joinedOn: null,
    sharingSince: null,
  },
  notify: { bills: true, goals: true, sharing: true },
  guide: {},
  updatedAt: Date.now(),
  seq: 1,
});

export type NewGoalInput = {
  name: string;
  target: number;
  targetDate: string | null;
  ownership: 'joint' | 'separate';
  holding: 'new' | 'existing';
  existingAccountId?: string;
};

export type Action =
  | { type: 'reset' }
  | { type: 'introShown' }
  | { type: 'maybeLater' }
  | { type: 'dismissCard' }
  | { type: 'setShared'; id: string; shared: boolean }
  | { type: 'sendInvite'; name: string; method: 'text' | 'email'; contact: string }
  | { type: 'partnerJoined' }
  | { type: 'addMoney'; goalId: string; fromId: string; amount: number }
  | { type: 'createGoal'; input: NewGoalInput; id: string }
  | { type: 'approveGoal'; id: string }
  | { type: 'editGoal'; id: string; name: string; target: number; targetDate: string | null }
  | { type: 'saveBill'; bill: Omit<Bill, 'id' | 'addedBy'> & { id?: string } }
  | { type: 'deleteBill'; id: string }
  | { type: 'setNotify'; key: keyof State['notify']; on: boolean }
  | { type: 'leave' }
  | { type: 'guide'; key: GuideKey };

const touch = (s: State): State => ({ ...s, updatedAt: Date.now() });

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case 'reset':
      return initialState();
    case 'introShown':
      return { ...state, together: { ...state.together, introShown: true } };
    case 'maybeLater':
      return { ...state, together: { ...state.together, status: 'setupCard', introShown: true, cardDismissed: false } };
    case 'dismissCard':
      return { ...state, together: { ...state.together, cardDismissed: true } };
    case 'setShared': {
      const accounts = state.accounts.map((acc) => (acc.id === a.id ? { ...acc, shared: a.shared } : acc));
      const guide = state.together.status === 'joined' ? { ...state.guide, sharing: true } : state.guide;
      return touch({ ...state, accounts, guide });
    }
    case 'sendInvite': {
      const name = a.name.trim() || seed.people.partner.name;
      const short = name.split(/\s+/)[0];
      return touch({
        ...state,
        people: { ...state.people, partner: { ...state.people.partner, name, short, initial: short[0].toUpperCase() } },
        together: { ...state.together, status: 'pending', inviteMethod: a.method, inviteContact: a.contact, introShown: true },
        guide: { ...state.guide, setup: true },
      });
    }
    case 'partnerJoined':
      if (state.together.status !== 'pending') return state;
      return touch({
        ...state,
        together: { ...state.together, status: 'joined', joinedOn: TODAY, sharingSince: state.together.sharingSince ?? TODAY },
      });
    case 'addMoney': {
      const goal = state.goals.find((g) => g.id === a.goalId);
      if (!goal || !goal.accountId || a.amount <= 0) return state;
      const from = state.accounts.find((x) => x.id === a.fromId);
      if (!from) return state;
      const accounts = state.accounts.map((acc) => {
        if (acc.id === a.fromId) return { ...acc, balance: round2(acc.balance - a.amount) };
        if (acc.id === goal.accountId) return { ...acc, balance: round2(acc.balance + a.amount) };
        return acc;
      });
      const activity = {
        id: `act-${state.seq}`,
        who: 'you' as const,
        kind: 'deposit' as const,
        title: 'Deposit',
        detail: `From ${from.type === 'chequing' ? 'chequing' : 'savings'} ••${from.last4} · Today`,
        amount: a.amount,
      };
      const goals = state.goals.map((g) =>
        g.id === a.goalId
          ? { ...g, contributions: { ...g.contributions, you: round2(g.contributions.you + a.amount) }, activity: [activity, ...g.activity] }
          : g,
      );
      return touch({ ...state, accounts, goals, seq: state.seq + 1, guide: { ...state.guide, addMoney: true } });
    }
    case 'createGoal': {
      const { input } = a;
      const id = a.id;
      let accounts = state.accounts;
      let accountId: string | null = null;
      let startBalance = 0;
      if (input.ownership === 'separate' && input.holding === 'new') {
        accountId = `acc-${id}`;
        accounts = [
          ...accounts,
          {
            id: accountId,
            owner: 'you',
            type: 'savings',
            name: 'TD Savings',
            tdHomeName: 'TD SAVINGS',
            number: `664${seed.demo.newGoal.newAccountLast4}`,
            last4: seed.demo.newGoal.newAccountLast4,
            balance: 0,
            shared: true,
            goalId: id,
          },
        ];
      } else if (input.ownership === 'separate' && input.existingAccountId) {
        accountId = input.existingAccountId;
        accounts = accounts.map((acc) => {
          if (acc.id !== accountId) return acc;
          startBalance = acc.balance;
          return { ...acc, shared: true, goalId: id };
        });
      }
      const goal: Goal = {
        id,
        name: input.name.trim() || 'New goal',
        accountId,
        ownership: input.ownership,
        holding: input.ownership === 'separate' ? input.holding : undefined,
        target: input.target,
        targetDate: input.targetDate,
        status: input.ownership === 'joint' ? 'pending' : 'live',
        contributions: { you: startBalance, partner: 0 },
        interest: 0,
        activity: [],
        createdToday: true,
      };
      return touch({
        ...state,
        accounts,
        goals: [...state.goals, goal],
        guide: { ...state.guide, newGoal: true },
      });
    }
    case 'approveGoal': {
      const goal = state.goals.find((g) => g.id === a.id);
      if (!goal || goal.status !== 'pending') return state;
      const accountId = `acc-${goal.id}`;
      const account: Account = {
        id: accountId,
        owner: 'joint',
        type: 'savings',
        name: 'Joint HISA',
        tdHomeName: 'TD JOINT HISA',
        number: `664${seed.demo.newGoal.jointAccountLast4}`,
        last4: seed.demo.newGoal.jointAccountLast4,
        balance: 0,
        shared: true,
        goalId: goal.id,
      };
      return touch({
        ...state,
        accounts: [...state.accounts, account],
        goals: state.goals.map((g) => (g.id === a.id ? { ...g, status: 'live', accountId } : g)),
        guide: { ...state.guide, jointGoal: true },
      });
    }
    case 'editGoal':
      return touch({
        ...state,
        goals: state.goals.map((g) =>
          g.id === a.id ? { ...g, name: a.name.trim() || g.name, target: a.target > 0 ? a.target : g.target, targetDate: a.targetDate } : g,
        ),
      });
    case 'saveBill': {
      const { id, ...rest } = a.bill;
      if (id) {
        return touch({ ...state, bills: state.bills.map((b) => (b.id === id ? { ...b, ...rest } : b)), guide: { ...state.guide, bill: true } });
      }
      const bill: Bill = { ...rest, id: `bill-${state.seq}`, addedBy: 'you' };
      return touch({ ...state, bills: [...state.bills, bill], seq: state.seq + 1, guide: { ...state.guide, bill: true } });
    }
    case 'deleteBill':
      return touch({ ...state, bills: state.bills.filter((b) => b.id !== a.id), guide: { ...state.guide, bill: true } });
    case 'setNotify':
      return { ...state, notify: { ...state.notify, [a.key]: a.on } };
    case 'leave': {
      // Goals that are only labels go; joint goals (real joint accounts) stay; pending joint goals go; reminders are deleted.
      const keep = state.goals.filter((g) => g.ownership === 'joint' && g.status === 'live');
      const keepIds = new Set(keep.map((g) => g.id));
      const accounts = state.accounts.map((acc) =>
        acc.goalId && !keepIds.has(acc.goalId) ? { ...acc, goalId: undefined, shared: false } : acc,
      );
      return touch({
        ...state,
        accounts,
        goals: keep,
        bills: [],
        together: { ...state.together, status: 'setupCard', cardDismissed: false, joinedOn: null, sharingSince: null },
        guide: { ...state.guide, leave: true },
      });
    }
    case 'guide':
      return state.guide[a.key] ? state : { ...state, guide: { ...state.guide, [a.key]: true } };
  }
}

const KEY = 'td-together-demo-v1';
const load = (): State => {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as State;
      if (s && s.accounts && s.together) return s;
    }
  } catch {
    /* storage unavailable */
  }
  return initialState();
};

const Ctx = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}

export const sinceLabel = (iso: string | null) => (iso ? monthDay(iso) : '');
export type { Who };
