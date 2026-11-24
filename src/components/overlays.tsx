// Sheets, the delete dialog, the notification banner and toasts, plus the simulated partner (Build Spec §6).
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon, LogoTile } from './icons';
import { useStore } from '../state/store';
import { useNav } from '../state/nav';
import { useUI } from '../state/ui';
import { money } from '../state/format';
import { combinedBalance, goalAccount } from '../state/derive';

const EASE = [0.32, 0.72, 0, 1] as const;

export function Overlays() {
  const ui = useUI();
  return (
    <>
      <AnimatePresence>
        {ui.sheet && (
          <motion.div key="dim" className="dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={() => (ui.sheet?.type === 'intro' ? null : ui.closeSheet())} />
        )}
        {ui.sheet && (
          <motion.div key={`sheet-${ui.sheet.type}`} className="sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.3, ease: EASE }} role="dialog" aria-modal="true">
            <div className="grabber" />
            {ui.sheet.type === 'intro' && <IntroSheet />}
            {ui.sheet.type === 'billOptions' && <BillOptions />}
            {ui.sheet.type === 'pickAccount' && <PickAccount />}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ui.dialog && <motion.div key="ddim" className="dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={ui.closeDialog} />}
        {ui.dialog && (
          <motion.div key="dialog" className="dialog" role="alertdialog" initial={{ opacity: 0, scale: 0.96, y: '-50%' }} animate={{ opacity: 1, scale: 1, y: '-50%' }} exit={{ opacity: 0, scale: 0.98, y: '-50%' }} transition={{ duration: 0.25 }}>
            <h3>Delete {ui.dialog.name} reminder?</h3>
            <p>This removes all future reminders for this bill.</p>
            <div className="btns">
              <button style={{ background: '#f0f0f0', color: '#000' }} onClick={ui.closeDialog}>
                Cancel
              </button>
              <button
                style={{ background: 'var(--danger)', color: '#fff' }}
                onClick={() => {
                  const d = ui.dialog;
                  ui.closeDialog();
                  d?.onConfirm();
                }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ui.banner && (
          <motion.button key={ui.banner.id} className="banner" onClick={ui.tapBanner} initial={{ y: -140 }} animate={{ y: 0 }} exit={{ y: -140 }} transition={{ duration: 0.35, ease: EASE }}>
            <LogoTile size={38} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="bt">
                <strong>{ui.banner.title}</strong>
                <span>now</span>
              </span>
              <span className="bm" style={{ display: 'block' }}>
                {ui.banner.message}
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ui.toast && (
          <motion.div key={ui.toast.id} className="toast" initial={{ opacity: 0, y: 8, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, x: '-50%' }} transition={{ duration: 0.25 }} role="status">
            {ui.toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IntroSheet() {
  const { dispatch } = useStore();
  const nav = useNav();
  const ui = useUI();
  const items = ['See your combined balance in one place', 'Save toward goals together', 'Keep track of shared bills'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10px 12px 0' }}>
      <LogoTile size={88} />
      <h2 style={{ fontSize: 30, fontWeight: 700, margin: '22px 0 0', letterSpacing: -0.3 }}>TD Together</h2>
      <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '10px 0 0', lineHeight: 1.4, maxWidth: 330 }}>Manage money with your partner, without opening a joint account.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '24px 0 0', alignSelf: 'stretch', paddingLeft: 10 }}>
        {items.map((t) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 15, textAlign: 'left' }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, background: 'var(--green-tint)', display: 'grid', placeItems: 'center' }}>
              <Icon name="check" size={14} color="#217e1a" />
            </span>
            {t}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: '26px 0 0', lineHeight: 1.4 }}>You choose which accounts to share. Your partner only sees balances.</p>
      <button
        className="btn-primary"
        style={{ marginTop: 18 }}
        onClick={() => {
          ui.closeSheet();
          nav.modal('setupShare');
        }}
      >
        Get started
      </button>
      <button
        onClick={() => {
          dispatch({ type: 'maybeLater' });
          ui.closeSheet();
        }}
        style={{ background: 'none', border: 0, fontSize: 15, fontWeight: 500, color: 'var(--text-2)', padding: '18px 10px 4px', cursor: 'pointer' }}
      >
        Maybe later
      </button>
    </div>
  );
}

function BillOptions() {
  const nav = useNav();
  const ui = useUI();
  const go = (screen: 'billForm' | 'bills') => {
    ui.closeSheet();
    nav.modal(screen);
  };
  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 600, margin: '0 0 6px' }}>Upcoming Bills</div>
      <button className="row tight" onClick={() => go('billForm')} style={{ minHeight: 52, fontSize: 16 }}>
        <Icon name="plus" size={22} color="#217e1a" />
        Create a bill reminder
      </button>
      <button className="row tight" onClick={() => go('bills')} style={{ minHeight: 52, fontSize: 16 }}>
        <Icon name="pencil" size={20} color="#217e1a" />
        Edit bill reminders
      </button>
    </div>
  );
}

function PickAccount() {
  const { state } = useStore();
  const ui = useUI();
  const sheet = ui.sheet;
  if (!sheet || sheet.type !== 'pickAccount') return null;
  const rows =
    sheet.field === 'from'
      ? state.accounts
          .filter((a) => a.owner === 'you' && !a.goalId && (a.type === 'chequing' || a.type === 'savings'))
          .map((a) => ({ id: a.id, title: a.name, detail: `••${a.last4} · Available ${money(a.balance)}` }))
      : state.goals
          .filter((g) => g.status === 'live' && g.accountId)
          .map((g) => {
            const a = goalAccount(state, g);
            return { id: g.id, title: g.name, detail: `${a?.name} ••${a?.last4} · ${money(a?.balance ?? 0)}` };
          });
  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 600, margin: '0 0 6px' }}>{sheet.field === 'from' ? 'Move money from' : 'Add money to'}</div>
      {rows.map((r) => (
        <button
          key={r.id}
          className="row"
          onClick={() => {
            sheet.onPick(r.id);
            ui.closeSheet();
          }}
        >
          <div className="grow">
            <div className="title">{r.title}</div>
            <div className="detail">{r.detail}</div>
          </div>
          {r.id === sheet.current && <Icon name="check" size={20} color="#217e1a" />}
        </button>
      ))}
    </div>
  );
}

/** The simulated partner: Evan joins, and Evan approves joint goals, on timers. */
export function PartnerEngine() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const ui = useUI();
  const navRef = useRef(nav);
  navRef.current = nav;
  const status = state.together.status;
  const screen = nav.top.screen;
  const bannerOn = !!ui.banner;
  const p = state.people.partner;
  const showBanner = ui.showBanner;

  // Evan joins 1.5s after landing on the waiting TD home (or the "just you" TD Together home).
  useEffect(() => {
    if (status !== 'pending' || bannerOn || (screen !== 'tdHome' && screen !== 'together')) return;
    const total = combinedBalance({ ...state, together: { ...state.together, status: 'joined' } });
    const t = window.setTimeout(() => {
      showBanner({
        title: `${p.short} joined TD Together`,
        message: `See your combined balance of ${money(total)}.`,
        onDone: () => dispatch({ type: 'partnerJoined' }),
        onTap: () => {
          if (navRef.current.top.screen !== 'together') navRef.current.fade('together');
        },
      });
    }, 1500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, screen, bannerOn, p.short, showBanner, dispatch]);

  // A joint goal is approved 1.5s after landing on the TD Together home.
  const pending = state.goals.find((g) => g.status === 'pending');
  const pendingId = pending?.id;
  const pendingName = pending?.name;
  useEffect(() => {
    if (!pendingId || status !== 'joined' || bannerOn || screen !== 'together') return;
    const id = pendingId;
    const t = window.setTimeout(() => {
      showBanner({
        title: `${p.short} approved ${pendingName}`,
        message: 'Your joint savings account is open. You can add money now.',
        onDone: () => dispatch({ type: 'approveGoal', id }),
        onTap: () => navRef.current.push('goal', { id }),
      });
    }, 1500);
    return () => window.clearTimeout(t);
  }, [pendingId, pendingName, status, bannerOn, screen, p.short, showBanner, dispatch]);

  // Checklist: opening TD Together once Evan has joined.
  useEffect(() => {
    if (status === 'joined' && screen === 'together') dispatch({ type: 'guide', key: 'joined' });
  }, [status, screen, dispatch]);

  return null;
}
