// TD Together home, Combined Balance, Settings, Manage Sharing and Leave.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/icons';
import { Avatar, Avatars, CreateButton, Money, Screen, SectionHeader, Segmented, Toggle, TopBar } from '../components/ui';
import { AccountCard, BillTile, GoalCard, SplitBar } from '../components/finance';
import { BalanceChart, buildSeries, CHART_PATH, RANGE_WORDS, seriesChange, YTD_CHANGE, type Range } from '../components/chart';
import { QuickActions } from './TdScreens';
import { useStore, type State } from '../state/store';
import { useNav } from '../state/nav';
import { useUI } from '../state/ui';
import { longDate, money, monthDay, pct, signedMoney } from '../state/format';
import { accountLabel, alwaysShared, byOwner, byType, combinedBalance, myToggleable, sumOf, upcomingBills } from '../state/derive';
import { TODAY } from '../state/seed';

const HEADER_BG = 'linear-gradient(100deg, var(--header-a) 0%, var(--header-b) 52%, var(--header-c) 100%)';

/** "just now" / "1 min ago" / "N min ago", refreshed every 20 seconds. */
export function useUpdatedLabel(at: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 20000);
    return () => window.clearInterval(t);
  }, []);
  const min = Math.floor((now - at) / 60000);
  return min < 1 ? 'just now' : min === 1 ? '1 min ago' : `${min} min ago`;
}

const sinceMonth = (iso: string | null) => (iso ? new Date(iso + 'T12:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Nov 2026');

/* ---------- TD Together home ---------- */

export function TogetherHome() {
  const { state } = useStore();
  const nav = useNav();
  const ui = useUI();
  const joined = state.together.status === 'joined';
  const p = state.people.partner;
  const you = state.people.you;
  const total = combinedBalance(state);
  const bills = upcomingBills(state);
  const updated = useUpdatedLabel(state.updatedAt);
  const ytdPct = ((YTD_CHANGE / (total - YTD_CHANGE)) * 100).toFixed(1);

  return (
    <Screen tone="light" strip="green" tabBar onTabHome={() => nav.popTo('tdHome')}>
      <div style={{ height: 194, background: HEADER_BG, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 16, top: 49, display: 'grid' }}>
          <Icon name="menu" size={24} color="#fff" />
        </span>
        {joined && (
          <button onClick={() => nav.push('settings')} aria-label="TD Together settings" style={{ position: 'absolute', right: 8, top: 41, width: 44, height: 44, border: 0, background: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Icon name="gear" size={24} color="#fff" />
          </button>
        )}
        <button onClick={nav.pop} aria-label="Back to TD home" style={{ position: 'absolute', left: 8, top: 113, height: 44, padding: '0 10px 0 4px', border: 0, background: 'none', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#f6f6f6' }}>
          <Icon name="back" size={26} color="#f6f6f6" />
          <span style={{ fontSize: 20, fontWeight: 500 }}>TD Together</span>
        </button>
      </div>
      <div style={{ background: 'var(--bg)', borderRadius: '24px 24px 0 0', marginTop: -30, position: 'relative' }}>
        {/* Combined balance (tap for details) */}
        <button onClick={() => nav.push('balance')} aria-label="Combined balance details" style={{ display: 'block', position: 'relative', width: '100%', height: 267, border: 0, padding: 0, background: 'none', textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
          <svg width="402" height="133" viewBox="0 0 402 134" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 96 }} aria-hidden="true">
            <path d={CHART_PATH} stroke="#18A033" fill="none" />
          </svg>
          <span style={{ position: 'absolute', left: 31, top: 20, fontSize: 14, fontWeight: 500, color: 'var(--label)' }}>
            {joined ? `${p.short.toUpperCase()} & ${you.short.toUpperCase()}’S` : 'JUST YOU FOR NOW'}
          </span>
          <span style={{ position: 'absolute', left: 28, top: 38, fontSize: 20, fontWeight: 500, color: 'var(--text-1)' }}>COMBINED BALANCE</span>
          <span style={{ position: 'absolute', left: 25, top: 64, fontSize: 34, fontWeight: 700, letterSpacing: -0.3 }}>
            <Money value={total} />
          </span>
          {joined ? (
            <span style={{ position: 'absolute', left: 27, top: 109, fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>
              {signedMoney(YTD_CHANGE)} ({ytdPct}%) this year
            </span>
          ) : (
            <span style={{ position: 'absolute', left: 27, top: 109, fontSize: 13, color: 'var(--text-2)' }}>{p.short}'s balances show up once he joins</span>
          )}
          <span style={{ position: 'absolute', right: 25, top: 34, height: 32, padding: '0 3px 0 10px', borderRadius: 10, background: '#fff', border: '1px solid rgba(207,207,207,0.51)', boxShadow: '0 2px 1px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 500 }}>
            YTD
            <Icon name="chevronRight" size={16} color="#000" />
          </span>
        </button>

        <QuickActions />

        <div style={{ padding: '2px 12px 0' }}>
          <SectionHeader title="Savings Goals" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 7 }}>
            {state.goals.map((g) => (
              <GoalCard key={g.id} state={state} goal={g} onClick={() => nav.push('goal', { id: g.id })} />
            ))}
            <div style={{ marginTop: -2 }}>
              <CreateButton label="Create a savings goal" onClick={() => nav.modal('goalDetails')} />
            </div>
          </div>

          <div style={{ marginTop: 35 }}>
            <SectionHeader title="Upcoming Bills" onOpen={() => nav.modal('bills')} onMore={() => ui.openSheet({ type: 'billOptions' })} />
          </div>
        </div>
        {bills.length ? (
          <div className="hscroll" style={{ gap: 10, padding: '10px 16px 6px', marginTop: 0 }}>
            {bills.map((b) => (
              <BillTile key={b.id} bill={b} people={state.people} />
            ))}
            <span style={{ flex: 'none', width: 6 }} />
          </div>
        ) : (
          <div style={{ padding: '10px 12px 6px' }}>
            <div className="card-soft" style={{ padding: '22px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>No bill reminders yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.35 }}>Add bills you share, like rent or hydro, and we'll remind you before they're due.</div>
            </div>
          </div>
        )}
        <div style={{ padding: '6px 12px 0' }}>
          <CreateButton label="Create a bill reminder" onClick={() => nav.modal('billForm')} />

          <div style={{ marginTop: 35 }}>
            <SectionHeader title="Shared Accounts" onOpen={() => nav.modal('sharing')} onMore={() => nav.modal('sharing')} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
            {!joined && (
              <div className="card-soft" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar person={p} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{p.short} hasn't joined yet</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.3 }}>Invite sent {monthDay(TODAY)}. His accounts will show here.</div>
                </div>
                <button className="link small" onClick={() => ui.showToast(`Invite sent again to ${p.short}`)}>
                  Resend
                </button>
              </div>
            )}
            <SharedCards state={state} />
          </div>
          <div style={{ padding: '18px 0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <button className="link small" onClick={() => nav.modal('sharing')}>
              Manage sharing
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-2)', textAlign: 'center' }}>
              {joined ? `Sharing with ${p.short} since ${sinceMonth(state.together.sharingSince)}` : `Waiting for ${p.short} to join`} · Updated {updated}
            </span>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function SharedCards({ state }: { state: State }) {
  const label = (a: Parameters<typeof accountLabel>[1]) => accountLabel(state, a);
  return (
    <>
      <AccountCard title="Chequing" accounts={byType(state, 'chequing')} state={state} defaultOpen label={label} />
      <AccountCard title="Savings" accounts={byType(state, 'savings')} state={state} label={label} />
      <AccountCard title="Investing" accounts={byType(state, 'investing')} state={state} label={label} />
      <AccountCard title="Credit Cards · not in combined balance" accounts={byType(state, 'credit')} state={state} label={label} />
    </>
  );
}

/* ---------- Combined Balance ---------- */

export function CombinedBalance() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const [range, setRange] = useState<Range>('YTD');
  const joined = state.together.status === 'joined';
  const p = state.people.partner;
  const you = state.people.you;
  const total = combinedBalance(state);
  const owners = byOwner(state);
  const series = useMemo(() => buildSeries(range, total), [range, total]);
  const ch = seriesChange(series);
  const updated = useUpdatedLabel(state.updatedAt);
  const boxRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(338);
  useEffect(() => {
    dispatch({ type: 'guide', key: 'balance' });
    if (boxRef.current) setW(boxRef.current.clientWidth);
  }, [dispatch]);
  const markers = [{ n: 1, date: '2026-05-25' }, ...(joined && state.together.joinedOn ? [{ n: 2, date: state.together.joinedOn }] : [])];
  const typeRow = (title: string, type: 'chequing' | 'savings' | 'investing' | 'credit') => {
    const list = byType(state, type);
    return { title, n: list.length, value: sumOf(list) };
  };
  const types = [typeRow('Chequing', 'chequing'), typeRow('Savings', 'savings'), typeRow('Investing', 'investing')];
  const credit = typeRow('Credit Cards', 'credit');
  const ytdPct = ((YTD_CHANGE / (total - YTD_CHANGE)) * 100).toFixed(1);

  return (
    <Screen topBar={<TopBar title="Combined Balance" onBack={nav.pop} />} tabBar onTabHome={() => nav.popTo('tdHome')} scrollClass="pad-12">
      <div style={{ padding: '4px 4px 0' }}>
        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
          {joined ? `${p.short} & ${you.short}` : 'Just you for now'} · {owners.count} accounts
        </div>
        <div style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>COMBINED BALANCE</div>
      </div>
      <div className="card" style={{ marginTop: 14, padding: '18px 16px 16px' }} ref={boxRef}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.3 }}>
          <Money value={total} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: ch.change >= 0 ? 'var(--green)' : 'var(--danger)', marginTop: 4 }}>
          {signedMoney(ch.change)} ({Math.abs(ch.percent).toFixed(1)}%) {RANGE_WORDS[range]}
        </div>
        <div style={{ marginTop: 14 }}>
          <BalanceChart series={series} markers={markers} width={Math.max(200, w - 32)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-2)', marginTop: 6 }}>
          <span>{series.startLabel}</span>
          <span>Today</span>
        </div>
        <div style={{ marginTop: 12 }}>
          <Segmented
            value={range}
            onChange={setRange}
            options={[
              { value: '1M', label: '1M' },
              { value: '3M', label: '3M' },
              { value: 'YTD', label: 'YTD' },
              { value: '1Y', label: '1Y' },
            ]}
          />
        </div>
      </div>

      <h3 className="section-title" style={{ margin: '24px 2px 10px' }}>
        What's in the Total
      </h3>
      <div className="card" style={{ padding: '16px 16px 12px' }}>
        <SplitBar
          parts={[
            { value: owners.you, color: you.color },
            ...(joined ? [{ value: owners.partner, color: p.color }] : []),
            { value: owners.joint, color: 'var(--green)' },
          ]}
        />
        <div style={{ marginTop: 6 }}>
          {[
            { who: <Avatar person={you} size={24} />, name: 'You', v: owners.you },
            ...(joined ? [{ who: <Avatar person={p} size={24} />, name: p.short, v: owners.partner }] : []),
            { who: <Avatars people={[p, you]} size={24} />, name: 'Joint accounts', v: owners.joint },
          ].map((r) => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 36 }}>
              <span style={{ width: 42, display: 'flex' }}>{r.who}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{r.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-2)', marginRight: 8 }}>{pct(r.v, owners.total)}%</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                <Money value={r.v} />
              </span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--divider)', marginTop: 6, paddingTop: 10, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.35 }}>Joint accounts are owned by both of you, so they're counted once.</div>
      </div>

      <h3 className="section-title" style={{ margin: '24px 2px 10px' }}>
        By Account Type
      </h3>
      <div className="card" style={{ padding: '0 16px' }}>
        {types.map((t) => (
          <div className="row kv" key={t.title}>
            <span className="k">
              {t.title} · {t.n} {t.n === 1 ? 'account' : 'accounts'}
            </span>
            <span className="v">
              <Money value={t.value} />
            </span>
          </div>
        ))}
        <div className="row kv">
          <span className="k">Credit Cards · not included</span>
          <span className="v" style={{ fontWeight: 400, color: 'var(--text-2)' }}>
            {money(credit.value)}
          </span>
        </div>
      </div>

      <h3 className="section-title" style={{ margin: '24px 2px 10px' }}>
        This Year's Change
      </h3>
      <div className="card" style={{ padding: '0 16px' }}>
        {[
          ['Money in, minus money out', 479.68],
          ['Investment growth', 548.1],
          ['Interest earned', 212.4],
        ].map(([k, v]) => (
          <div className="row kv" key={k as string}>
            <span className="k">{k}</span>
            <span className="v" style={{ color: 'var(--green)' }}>
              {signedMoney(v as number)}
            </span>
          </div>
        ))}
        <div className="row kv">
          <span className="k" style={{ color: '#000', fontWeight: 600 }}>
            Total change
          </span>
          <span className="v" style={{ color: 'var(--green)' }}>
            {signedMoney(YTD_CHANGE)} ({ytdPct}%)
          </span>
        </div>
      </div>

      <h3 className="section-title" style={{ margin: '24px 2px 10px' }}>
        Chart Notes
      </h3>
      <div className="card" style={{ padding: '0 16px' }}>
        <div className="row" style={{ minHeight: 60 }}>
          <span className="num-dot">1</span>
          <div className="grow">
            <div className="title">Markets dropped</div>
            <div className="detail" style={{ fontSize: 12 }}>
              May 25 · Investing fell 2.8%
            </div>
          </div>
          <span className="value">−$386.20</span>
        </div>
        {joined && state.together.joinedOn && (
          <div className="row" style={{ minHeight: 60 }}>
            <span className="num-dot">2</span>
            <div className="grow">
              <div className="title">{p.short} joined TD Together</div>
              <div className="detail" style={{ fontSize: 12 }}>
                {monthDay(state.together.joinedOn)} · Earlier balances are filled in, so the chart covers the whole year
              </div>
            </div>
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-2)', textAlign: 'center', margin: '14px 0 0' }}>Balances only. Transactions are never shared. Updated {updated}.</p>
    </Screen>
  );
}

/* ---------- Settings ---------- */

export function Settings() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const p = state.people.partner;
  const you = state.people.you;
  const mine = myToggleable(state).filter((a) => a.shared).length;
  const his = state.accounts.filter((a) => a.owner === 'partner' && a.shared).length;
  const n = state.notify;
  return (
    <Screen topBar={<TopBar title="TD Together Settings" onBack={nav.pop} />} tabBar onTabHome={() => nav.popTo('tdHome')} scrollClass="pad-12">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0 0' }}>
        <span className="avatars">
          <Avatar person={p} size={44} border={2} />
          <Avatar person={you} size={44} border={2} style={{ marginLeft: -10 }} />
        </span>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {p.short} &amp; {you.short}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 2 }}>Sharing since {longDate(state.together.sharingSince ?? TODAY)}</div>
        </div>
      </div>

      <span className="label" style={{ marginTop: 24 }}>
        People
      </span>
      <div className="list-card">
        <div className="row">
          <Avatar person={you} size={32} />
          <div className="grow">
            <div className="title">{you.name}</div>
            <div className="detail">You</div>
          </div>
        </div>
        <div className="row">
          <Avatar person={p} size={32} />
          <div className="grow">
            <div className="title">{p.name}</div>
            <div className="detail">Partner · Joined {monthDay(state.together.joinedOn ?? TODAY)}</div>
          </div>
        </div>
      </div>

      <span className="label" style={{ marginTop: 18 }}>
        Sharing
      </span>
      <div className="list-card">
        <button className="row tight" onClick={() => nav.modal('sharing')}>
          <span className="grow" style={{ fontSize: 15 }}>
            What you share
          </span>
          <span className="value muted">{mine === 1 ? '1 account' : `${mine} accounts`}</span>
          <Icon name="chevronRight" size={20} color="#8a8a8a" />
        </button>
        <div className="row tight">
          <span className="grow" style={{ fontSize: 15 }}>
            What {p.short} shares
          </span>
          <span className="value muted">{his} accounts</span>
        </div>
      </div>

      <span className="label" style={{ marginTop: 18 }}>
        Notifications
      </span>
      <div className="list-card">
        {(
          [
            ['bills', 'Bill reminders', '3 days before a bill is due'],
            ['goals', 'Goal activity', 'When money is added or a goal changes'],
            ['sharing', 'Sharing changes', `When ${p.short} changes what he shares`],
          ] as const
        ).map(([key, t, d]) => (
          <div className="row" key={key}>
            <div className="grow">
              <div className="title">{t}</div>
              <div className="detail">{d}</div>
            </div>
            <Toggle on={n[key]} onChange={(on) => dispatch({ type: 'setNotify', key, on })} label={t} />
          </div>
        ))}
      </div>

      <div className="list-card" style={{ marginTop: 22 }}>
        <button className="row tight" onClick={() => nav.modal('leave')} style={{ color: 'var(--danger)', fontSize: 15, fontWeight: 600, minHeight: 50 }}>
          Leave TD Together
        </button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '10px 0 0' }}>You and {p.short} will stop seeing each other's balances.</p>
    </Screen>
  );
}

/* ---------- Manage Sharing ---------- */

export function Sharing() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const p = state.people.partner;
  // Group by what was shared when the screen opened, so rows don't jump while you toggle.
  const [initiallyShared] = useState(() => new Set(myToggleable(state).filter((a) => a.shared).map((a) => a.id)));
  const toggleable = myToggleable(state);
  const shared = toggleable.filter((a) => initiallyShared.has(a.id));
  const notShared = toggleable.filter((a) => !initiallyShared.has(a.id));
  const always = alwaysShared(state);
  const row = (a: (typeof toggleable)[number]) => (
    <div className="row" key={a.id}>
      <div className="grow">
        <div className="title" style={{ fontSize: 16 }}>
          {a.name}
        </div>
        <div className="detail">
          ••{a.last4} · {money(a.balance)}
        </div>
      </div>
      <Toggle on={a.shared} onChange={(on) => dispatch({ type: 'setShared', id: a.id, shared: on })} label={`Share ${a.name}`} />
    </div>
  );
  return (
    <Screen topBar={<TopBar title="Manage Sharing" onClose={nav.close} />} scrollClass="pad" footer={<button className="btn-primary" onClick={nav.close}>Done</button>}>
      <h2 className="h-page">Choose what {p.short} sees</h2>
      <p className="sub">He'll see balances only, not transactions. Changes apply right away.</p>
      {shared.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <span className="label">Shared</span>
          <div className="list-card">{shared.map(row)}</div>
        </div>
      )}
      {notShared.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <span className="label">Not shared</span>
          <div className="list-card">{notShared.map(row)}</div>
        </div>
      )}
      {always.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <span className="label">Always shared</span>
          <div className="list-card">
            {always.map((a) => (
              <div className="row" key={a.id}>
                <div className="grow">
                  <div className="title" style={{ fontSize: 16 }}>
                    {accountLabel(state, a)}
                  </div>
                  <div className="detail">
                    {a.name} ••{a.last4} · {money(a.balance)}
                  </div>
                </div>
                <Icon name="lock" size={14} color="#6f6f6f" />
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Always on</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="note">
        {state.accounts.some((a) => a.owner === 'you' && a.goalId) ? 'Joint and goal accounts are always shared.' : 'Joint accounts are always shared.'} {p.short} chooses what to share from his own accounts.
      </p>
    </Screen>
  );
}

/* ---------- Leave ---------- */

export function Leave() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const p = state.people.partner;
  const joint = state.goals.filter((g) => g.ownership === 'joint' && g.status === 'live');
  const jointText = joint.length
    ? `${joint
        .map((g) => {
          const a = state.accounts.find((x) => x.id === g.accountId);
          return `${g.name} (Joint HISA ••${a?.last4 ?? ''})`;
        })
        .join(' and ')} ${joint.length === 1 ? 'is' : 'are'} still owned by both of you. To close ${joint.length === 1 ? 'it' : 'them'}, contact TD.`
    : 'Any joint account you open together stays owned by both of you.';
  const items: [string, string][] = [
    ['Balances stop being shared', `You won't see ${p.short}'s balances, and he won't see yours.`],
    ['Joint accounts stay open', jointText],
    ['Goals in your own accounts stay with you', 'They become regular savings. Nothing is moved or closed.'],
    ['Bill reminders are deleted', `This includes reminders ${p.short} added.`],
    [`${p.short} gets a message`, "We'll let him know you left."],
  ];
  const leave = () => {
    dispatch({ type: 'leave' });
    nav.popTo('tdHome');
  };
  return (
    <Screen
      topBar={<TopBar title="Leave TD Together" onClose={nav.close} />}
      scrollClass="pad"
      footer={
        <>
          <button className="btn-primary danger" onClick={leave}>
            Leave TD Together
          </button>
          <button className="btn-secondary" onClick={nav.close}>
            Cancel
          </button>
        </>
      }
    >
      <h2 className="h-page">Leave TD Together?</h2>
      <p className="sub">Here's what changes for you and {p.short}.</p>
      <div className="list-card" style={{ marginTop: 16 }}>
        {items.map(([t, d]) => (
          <div className="row" key={t} style={{ alignItems: 'flex-start', minHeight: 0, padding: '12px 0' }}>
            <div className="grow">
              <div className="title">{t}</div>
              <div className="detail">{d}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="note">You can set up TD Together again any time.</p>
    </Screen>
  );
}
