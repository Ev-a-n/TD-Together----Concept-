// Everything inside the phone: the screen stack with its transitions, overlays and the simulated partner.
import type { JSX } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EntryCtx, useNav, type Entry, type ExitMode, type ScreenName } from './state/nav';
import { Overlays, PartnerEngine } from './components/overlays';
import { Login, TdHome } from './screens/TdScreens';
import { SetupInvite, SetupSent, SetupShare } from './screens/Setup';
import { CombinedBalance, Leave, Settings, Sharing, TogetherHome } from './screens/Together';
import { AddDone, AddMoney, AddReview, EditGoal, GoalDetails, GoalPage, GoalResult, GoalReview, GoalSharing } from './screens/Goals';
import { BillForm, BillsList } from './screens/Bills';

const SCREENS: Record<ScreenName, () => JSX.Element | null> = {
  login: Login,
  tdHome: TdHome,
  setupShare: SetupShare,
  setupInvite: SetupInvite,
  setupSent: SetupSent,
  together: TogetherHome,
  balance: CombinedBalance,
  goal: GoalPage,
  addMoney: AddMoney,
  addReview: AddReview,
  addDone: AddDone,
  editGoal: EditGoal,
  goalDetails: GoalDetails,
  goalSharing: GoalSharing,
  goalReview: GoalReview,
  goalResult: GoalResult,
  bills: BillsList,
  billForm: BillForm,
  sharing: Sharing,
  settings: Settings,
  leave: Leave,
};

const EASE = [0.32, 0.72, 0, 1] as const;
const SLIDE = { duration: 0.35, ease: EASE };
const FADE = { duration: 0.25, ease: 'easeOut' as const };

const enterFrom = (e: Entry) =>
  e.kind === 'push' || e.kind === 'step' ? { x: '100%', y: 0, opacity: 1 } : e.kind === 'modal' ? { y: '100%', x: 0, opacity: 1 } : { opacity: 0, x: 0, y: 0 };

function Layer({ entry, coveredByPush, covered }: { entry: Entry; coveredByPush: boolean; covered: boolean }) {
  const Comp = SCREENS[entry.screen];
  const variants = {
    exit: (mode: ExitMode) => {
      if (mode === 'close') return { y: '100%', transition: SLIDE };
      if (mode === 'reset') return { opacity: 0, transition: FADE };
      if (entry.kind === 'push' || entry.kind === 'step') return { x: '100%', transition: SLIDE };
      if (entry.kind === 'modal') return { y: '100%', transition: SLIDE };
      return { opacity: 0, transition: FADE };
    },
  };
  return (
    <motion.div
      className="layer"
      initial={enterFrom(entry)}
      animate={
        covered
          ? { x: coveredByPush ? '-25%' : 0, y: 0, opacity: 1, transitionEnd: { visibility: 'hidden' }, transition: SLIDE }
          : { x: 0, y: 0, opacity: 1, visibility: 'visible', transition: entry.kind === 'fade' || entry.kind === 'root' ? FADE : SLIDE }
      }
      exit="exit"
      variants={variants}
      style={{ pointerEvents: covered ? 'none' : 'auto', boxShadow: entry.kind === 'push' || entry.kind === 'step' ? '-8px 0 24px rgba(0,0,0,0.06)' : undefined }}
      aria-hidden={covered || undefined}
    >
      <EntryCtx.Provider value={entry}>
        <Comp />
      </EntryCtx.Provider>
    </motion.div>
  );
}

export function PhoneApp() {
  const nav = useNav();
  return (
    <div className="app">
      <AnimatePresence initial={false} custom={nav.exit}>
        {nav.stack.map((e, i) => {
          const above = nav.stack[i + 1];
          // Only keep the screens that can still show through (the top one and the one under it) mounted for animation.
          return <Layer key={e.id} entry={e} covered={!!above} coveredByPush={!!above && (above.kind === 'push' || above.kind === 'step')} />;
        })}
      </AnimatePresence>
      <Overlays />
      <PartnerEngine />
    </div>
  );
}
