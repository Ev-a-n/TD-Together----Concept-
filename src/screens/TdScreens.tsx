// TD's own screens: Login and the TD home (with the TD Together entry in its four states).
import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon, LogoTile, StatusIcons } from '../components/icons';
import { Collapse, Money, Screen, Toggle } from '../components/ui';
import { useStore } from '../state/store';
import { useNav } from '../state/nav';
import { useUI } from '../state/ui';
import { combinedBalance, sumOf } from '../state/derive';
import type { Account } from '../state/seed';

const HEADER_BG = 'linear-gradient(100deg, var(--header-a) 0%, var(--header-b) 52%, var(--header-c) 100%)';

/* ---------- Login ---------- */

export function Login() {
  const nav = useNav();
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const enter = () => nav.root('tdHome');
  return (
    <div className="screen" style={{ background: HEADER_BG }}>
      <div className="statusbar light">
        <span className="time">9:41</span>
        <span className="icons">
          <StatusIcons color="#fff" />
        </span>
      </div>
      <div style={{ height: 285, flex: 'none', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 157, top: 132, width: 88, height: 88, borderRadius: 14, border: '1.5px dashed rgba(255,255,255,0.75)' }} aria-label="TD logo placeholder" />
      </div>
      <div style={{ flex: 1, background: 'var(--bg)', borderRadius: '24px 24px 0 0', padding: '33px 16px 0', display: 'flex', flexDirection: 'column' }}>
        <span className="label">Username or Access Card</span>
        <div className="field">
          <input defaultValue="sydney.lynn" aria-label="Username or Access Card" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0 18px' }}>
          <span style={{ fontSize: 15 }}>Remember me</span>
          <Toggle on={remember} onChange={setRemember} label="Remember me" />
        </div>
        <span className="label">Password</span>
        <div className="field">
          <input type={show ? 'text' : 'password'} defaultValue="together26" aria-label="Password" style={{ letterSpacing: show ? 0 : 2 }} />
          <button onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} style={{ background: 'none', border: 0, padding: 4, cursor: 'pointer', display: 'grid' }}>
            <Icon name="eye" size={16} color="#1e1e1e" />
          </button>
        </div>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={enter}>
          Login
        </button>
        <button className="link small" style={{ alignSelf: 'center', marginTop: 20, cursor: 'default' }} tabIndex={-1}>
          Forgot your username or password?
        </button>
        <button className="btn-secondary" style={{ marginTop: 22, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }} onClick={enter}>
          <Icon name="faceId" size={20} color="#217e1a" />
          Use Face ID
        </button>
        <div style={{ flex: 1 }} />
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-2)', margin: '0 0 40px' }}>
          New to TD? <span style={{ color: 'var(--green)', fontWeight: 600 }}>Register</span>
        </p>
      </div>
    </div>
  );
}

/* ---------- Shared pieces of TD's home ---------- */

export function QuickActions() {
  const items = ['Interac e-Transfer', 'Transfer', 'Pay Bill', 'Deposit', 'Add Payee'];
  return (
    <div className="hscroll" style={{ gap: 16, padding: '0 16px 10px', position: 'relative', zIndex: 2 }}>
      {items.map((t) => (
        <span
          key={t}
          style={{ flex: 'none', height: 42, borderRadius: 24, background: '#fff', boxShadow: 'var(--td-shadow)', display: 'flex', alignItems: 'center', gap: 7, padding: '0 17px 0 15px', fontSize: 14.7, color: '#000', whiteSpace: 'nowrap' }}
        >
          <Icon name="star" size={19} color="#217e1a" />
          {t}
        </span>
      ))}
    </div>
  );
}

export function TdHeading({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 34, padding: '0 17px' }}>
      <span style={{ fontSize: 18, fontWeight: 900, color: '#000' }}>{title}</span>
      <svg width="39" height="34" viewBox="0 0 39 34" aria-hidden="true">
        <path d="M15 9l8 8-8 8" stroke="#217e1a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span style={{ marginLeft: 'auto', color: '#8c8c8c', display: 'grid', marginRight: -4 }}>
        <Icon name="more" size={22} color="#8c8c8c" />
      </span>
    </div>
  );
}

function AccountGroup({ title, accounts, defaultOpen, first }: { title: string; accounts: Account[]; defaultOpen?: boolean; first?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  if (!accounts.length) return null;
  return (
    <div style={{ borderTop: first ? 0 : '1px solid #d9d9d9' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', background: 'none', border: 0, padding: first ? '0 0 20px' : '21px 0 22px', cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit' }}
      >
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 16, fontWeight: 600, paddingLeft: first ? 0 : 5 }}>{title}</span>
          {open && <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9b9b9b', marginTop: 2 }}>{accounts.length === 1 ? '1 account' : `${accounts.length} accounts`}</span>}
        </span>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-bright)' }}>
          <Money value={sumOf(accounts)} />
        </span>
        <span style={{ marginLeft: 8, marginTop: 0, display: 'grid', transition: 'transform 300ms var(--ease)', transform: open ? 'rotate(180deg)' : 'none' }}>
          <Icon name="chevronDown" size={20} color="#000" />
        </span>
      </button>
      <Collapse open={open}>
        <div>
          {accounts.map((a) => (
            <div key={a.id} style={{ borderTop: '1px solid #d9d9d9', padding: '20px 4px 19px 0', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 16, fontWeight: 700 }}>{a.tdHomeName ?? a.name.toUpperCase()}</span>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9b9b9b', marginTop: 4 }}>{a.number ?? `••${a.last4}`}</span>
              </span>
              <span style={{ fontSize: 16 }}>
                <Money value={a.balance} />
              </span>
            </div>
          ))}
        </div>
      </Collapse>
    </div>
  );
}

/* ---------- TD home ---------- */

export function TdHome() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const ui = useUI();
  const { status, introShown, cardDismissed } = state.together;
  const isTop = nav.top.screen === 'tdHome';

  // The intro sheet opens by itself 0.8s after the first visit.
  useEffect(() => {
    if (!isTop || status !== 'none' || introShown) return;
    const t = window.setTimeout(() => {
      dispatch({ type: 'introShown' });
      ui.openSheet({ type: 'intro' });
    }, 800);
    return () => window.clearTimeout(t);
  }, [isTop, status, introShown, dispatch, ui]);

  const mine = state.accounts.filter((a) => a.owner === 'you' || a.owner === 'joint');
  const banking = mine.filter((a) => a.type === 'chequing');
  const savings = mine.filter((a) => a.type === 'savings');
  const investing = mine.filter((a) => a.type === 'investing');
  const credit = mine.filter((a) => a.type === 'credit');

  let entry: ReactNode = null;
  if (status === 'setupCard' && !cardDismissed) entry = <SetupCard key="setup" onStart={() => nav.modal('setupShare')} onDismiss={() => {
        dispatch({ type: 'dismissCard' });
        ui.showToast('Find TD Together any time in the menu');
      }} />;
  else if (status === 'pending') entry = <EntryCard key="pending" right={<span style={{ fontSize: 15, color: 'var(--text-2)' }}>Waiting for {state.people.partner.short}</span>} onClick={() => nav.push('together')} />;
  else if (status === 'joined')
    entry = (
      <EntryCard
        key="joined"
        right={
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)' }}>
            <Money value={combinedBalance(state)} />
          </span>
        }
        onClick={() => nav.push('together')}
      />
    );

  return (
    <Screen tone="light" strip="green" tabBar>
      <div style={{ height: 237, background: HEADER_BG, position: 'relative' }}>
        <button
          aria-label="Menu"
          onClick={() => (status === 'none' || status === 'setupCard' ? ui.openSheet({ type: 'intro' }) : undefined)}
          style={{ position: 'absolute', left: 6, top: 51, width: 44, height: 44, border: 0, background: 'none', display: 'grid', placeItems: 'center', cursor: status === 'none' || status === 'setupCard' ? 'pointer' : 'default' }}
        >
          <Icon name="menu" size={24} color="#fff" />
        </button>
        <div style={{ position: 'absolute', left: 16, top: 118, color: '#fff' }}>
          <div style={{ fontSize: 12, fontWeight: 300 }}>Welcome back</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{state.people.you.name}</div>
        </div>
      </div>
      <div style={{ background: 'var(--bg)', borderRadius: '24px 24px 0 0', marginTop: -30, position: 'relative', minHeight: 700 }}>
        <div style={{ position: 'relative', top: -22, marginBottom: -22 }}>
          <QuickActions />
        </div>
        <AnimatePresence initial={false} mode="popLayout">
          {entry && (
            <motion.div key={(entry as { key?: string }).key ?? 'e'} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ padding: '20px 16px 0' }}>
              {entry}
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ marginTop: entry ? 19 : 16 }}>
          <TdHeading title="My Accounts" />
        </div>
        <div style={{ margin: '8px 16px 0', background: '#fff', borderRadius: 16, boxShadow: 'var(--td-shadow)', padding: '17px 21px 0 21px' }}>
          <AccountGroup title="Banking" accounts={banking} defaultOpen first />
          <AccountGroup title="Savings" accounts={savings} />
          <AccountGroup title="Investing" accounts={investing} />
          <AccountGroup title="Credit Cards" accounts={credit} />
        </div>
        <div style={{ margin: '12px 16px 0', height: 62, background: '#fff', borderRadius: 16, boxShadow: 'var(--td-shadow)', display: 'grid', placeItems: 'center' }}>
          <Icon name="plus" size={32} color="#6f6f6f" />
        </div>
        <div style={{ marginTop: 20 }}>
          <TdHeading title="TD MySpend" />
        </div>
        <MySpend />
      </div>
    </Screen>
  );
}

function EntryCard({ right, onClick }: { right: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px 10px 12px', background: '#fff', borderRadius: 16, border: 0, boxShadow: '0 4px 4px rgba(0,0,0,0.12)', cursor: 'pointer', font: 'inherit', textAlign: 'left' }}
    >
      <LogoTile size={28} />
      <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#000' }}>TD Together</span>
      {right}
      <Icon name="chevronRight" size={18} color="#8a8a8a" />
    </button>
  );
}

function SetupCard({ onStart, onDismiss }: { onStart: () => void; onDismiss: () => void }) {
  return (
    <div style={{ position: 'relative', background: '#fff', borderRadius: 16, boxShadow: 'var(--td-shadow)', padding: '16px 40px 16px 16px', display: 'flex', gap: 14 }}>
      <LogoTile size={56} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>TD Together</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', background: 'var(--green-tint)', borderRadius: 8, padding: '2px 7px', letterSpacing: 0.3 }}>NEW</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3, lineHeight: 1.3 }}>See your combined balance with your partner.</div>
        <button className="link small" style={{ padding: '8px 0 0' }} onClick={onStart}>
          Get started
        </button>
      </div>
      <button onClick={onDismiss} aria-label="Dismiss" style={{ position: 'absolute', right: 8, top: 8, width: 32, height: 32, border: 0, background: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
        <Icon name="x" size={16} color="#8a8a8a" />
      </button>
    </div>
  );
}

function MySpend() {
  const tile = { background: '#f5f5f5', borderRadius: 12 };
  return (
    <div style={{ margin: '8px 16px 0', background: '#fff', borderRadius: 16, boxShadow: 'var(--td-shadow)', padding: '16px 18px 18px' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#737373' }}>This month, you've spent</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <div style={{ ...tile, flex: 1, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#9c9c9c' }}>Spent so far</span>
          <span>
            <span style={{ display: 'block', fontSize: 28, fontWeight: 700 }}>$1,248.30</span>
            <span style={{ display: 'block', fontSize: 12, color: '#9c9c9c', marginTop: 2 }}>Nov 1 – 11</span>
          </span>
        </div>
        <div style={{ width: 132, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ ...tile, padding: '11px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9c9c9c' }}>Typical spend</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>$1,412.50</div>
          </div>
          <div style={{ background: '#e7f4e9', borderRadius: 12, padding: '11px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#338040' }}>Under typical</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--green-bright)', marginTop: 2 }}>$164.20</div>
          </div>
        </div>
      </div>
    </div>
  );
}
