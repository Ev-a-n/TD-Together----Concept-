// Screen navigation inside the phone: a stack of screens.
// - push: slides in from the right (goal page, settings, balance details)
// - modal: slides up from the bottom and starts a "group" (add money, create goal, bills, sharing…)
// - step: a push inside the current modal group (Review, Done…)
// - fade: a quick cross-fade (tapping a notification)
import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

export type ScreenName =
  | 'login'
  | 'tdHome'
  | 'setupShare'
  | 'setupInvite'
  | 'setupSent'
  | 'together'
  | 'balance'
  | 'goal'
  | 'addMoney'
  | 'addReview'
  | 'addDone'
  | 'editGoal'
  | 'goalDetails'
  | 'goalSharing'
  | 'goalReview'
  | 'goalResult'
  | 'bills'
  | 'billForm'
  | 'sharing'
  | 'settings'
  | 'leave';

export type Kind = 'root' | 'push' | 'modal' | 'step' | 'fade';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Params = Record<string, any>;

export interface Entry {
  id: number;
  screen: ScreenName;
  params: Params;
  kind: Kind;
  group: number;
}

export type ExitMode = 'pop' | 'close' | 'reset';

interface NavState {
  stack: Entry[];
  seq: number;
  exit: ExitMode;
}

type NavAction =
  | { type: 'go'; screen: ScreenName; params?: Params; kind: Exclude<Kind, 'root'> }
  | { type: 'pop' }
  | { type: 'close' }
  | { type: 'closeThen'; screen: ScreenName; params?: Params; kind: 'push' | 'modal' | 'fade' }
  | { type: 'root'; screen: ScreenName; params?: Params }
  | { type: 'popTo'; screen: ScreenName }
  | { type: 'setParams'; params: Params };

const start = (screen: ScreenName): NavState => ({ stack: [{ id: 1, screen, params: {}, kind: 'root', group: 1 }], seq: 2, exit: 'pop' });

function navReducer(s: NavState, a: NavAction): NavState {
  const top = s.stack[s.stack.length - 1];
  switch (a.type) {
    case 'go': {
      const group = a.kind === 'step' ? top.group : s.seq;
      return { ...s, stack: [...s.stack, { id: s.seq, screen: a.screen, params: a.params ?? {}, kind: a.kind, group }], seq: s.seq + 1, exit: 'pop' };
    }
    case 'pop':
      if (s.stack.length < 2) return s;
      return { ...s, stack: s.stack.slice(0, -1), exit: 'pop' };
    case 'close': {
      // Remove the whole modal group the top screen belongs to.
      const first = s.stack.findIndex((e) => e.group === top.group);
      if (first <= 0) return s;
      return { ...s, stack: s.stack.slice(0, first), exit: 'close' };
    }
    case 'closeThen': {
      const first = s.stack.findIndex((e) => e.group === top.group);
      const base = first <= 0 ? s.stack : s.stack.slice(0, first);
      return {
        ...s,
        stack: [...base, { id: s.seq, screen: a.screen, params: a.params ?? {}, kind: a.kind, group: s.seq }],
        seq: s.seq + 1,
        exit: 'close',
      };
    }
    case 'root':
      return { stack: [{ id: s.seq, screen: a.screen, params: a.params ?? {}, kind: 'root', group: s.seq }], seq: s.seq + 1, exit: 'reset' };
    case 'popTo': {
      const i = s.stack.map((e) => e.screen).lastIndexOf(a.screen);
      if (i < 0) return s;
      return { ...s, stack: s.stack.slice(0, i + 1), exit: 'close' };
    }
    case 'setParams':
      return { ...s, stack: [...s.stack.slice(0, -1), { ...top, params: { ...top.params, ...a.params } }] };
  }
}

export interface Nav {
  stack: Entry[];
  exit: ExitMode;
  top: Entry;
  push: (screen: ScreenName, params?: Params) => void;
  modal: (screen: ScreenName, params?: Params) => void;
  step: (screen: ScreenName, params?: Params) => void;
  fade: (screen: ScreenName, params?: Params) => void;
  pop: () => void;
  close: () => void;
  closeThen: (screen: ScreenName, params?: Params, kind?: 'push' | 'modal' | 'fade') => void;
  root: (screen: ScreenName, params?: Params) => void;
  popTo: (screen: ScreenName) => void;
  setParams: (params: Params) => void;
}

const NavCtx = createContext<Nav | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [s, dispatch] = useReducer(navReducer, 'login', start);
  const push = useCallback((screen: ScreenName, params?: Params) => dispatch({ type: 'go', screen, params, kind: 'push' }), []);
  const modal = useCallback((screen: ScreenName, params?: Params) => dispatch({ type: 'go', screen, params, kind: 'modal' }), []);
  const step = useCallback((screen: ScreenName, params?: Params) => dispatch({ type: 'go', screen, params, kind: 'step' }), []);
  const fade = useCallback((screen: ScreenName, params?: Params) => dispatch({ type: 'go', screen, params, kind: 'fade' }), []);
  const pop = useCallback(() => dispatch({ type: 'pop' }), []);
  const close = useCallback(() => dispatch({ type: 'close' }), []);
  const closeThen = useCallback(
    (screen: ScreenName, params?: Params, kind: 'push' | 'modal' | 'fade' = 'push') => dispatch({ type: 'closeThen', screen, params, kind }),
    [],
  );
  const root = useCallback((screen: ScreenName, params?: Params) => dispatch({ type: 'root', screen, params }), []);
  const popTo = useCallback((screen: ScreenName) => dispatch({ type: 'popTo', screen }), []);
  const setParams = useCallback((params: Params) => dispatch({ type: 'setParams', params }), []);
  const value = useMemo<Nav>(
    () => ({ stack: s.stack, exit: s.exit, top: s.stack[s.stack.length - 1], push, modal, step, fade, pop, close, closeThen, root, popTo, setParams }),
    [s, push, modal, step, fade, pop, close, closeThen, root, popTo, setParams],
  );
  return <NavCtx.Provider value={value}>{children}</NavCtx.Provider>;
}

export function useNav() {
  const ctx = useContext(NavCtx);
  if (!ctx) throw new Error('useNav outside NavProvider');
  return ctx;
}

/** The entry a screen was rendered for (so a screen deep in the stack reads its own params). */
export const EntryCtx = createContext<Entry | null>(null);
export function useEntry() {
  const e = useContext(EntryCtx);
  if (!e) throw new Error('useEntry outside a screen');
  return e;
}
