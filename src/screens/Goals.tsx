// Savings goal page, Add money (3 steps), Edit goal and Create a goal (details → sharing → review → result).
import { useMemo, useState } from 'react';
import { Icon } from '../components/icons';
import { Avatar, Avatars, Chip, DateField, Money, MoneyField, Radio, Screen, SuccessMark, TextField, TopBar } from '../components/ui';
import { Gauge, GoalCard, SplitBar } from '../components/finance';
import { useStore } from '../state/store';
import { useEntry, useNav } from '../state/nav';
import { useUI } from '../state/ui';
import { longDate, money, moneyWhole, round2 } from '../state/format';
import { goalAccount, goalChip, goalStats } from '../state/derive';
import { seed, type Goal } from '../state/seed';

/* ---------- Goal page ---------- */

export function GoalPage() {
  const { state } = useStore();
  const nav = useNav();
  const { params } = useEntry();
  const goal = state.goals.find((g) => g.id === params.id);
  if (!goal) {
    return (
      <Screen topBar={<TopBar title="Savings Goal" onBack={nav.pop} />} scrollClass="pad">
        <p className="sub">This goal is no longer here.</p>
      </Screen>
    );
  }
  const p = state.people.partner;
  const you = state.people.you;
  const acc = goalAccount(state, goal);
  const st = goalStats(state, goal);
  const pending = goal.status === 'pending';
  const heldIn = pending ? 'New joint HISA' : acc ? `${acc.name} ••${acc.last4}` : '—';

  let empty: [string, string] | null = null;
  if (!goal.activity.length) {
    if (pending) empty = [`Waiting for ${p.short}`, `He'll get a request to approve ${goal.name} in his TD app.`];
    else if (goal.ownership === 'joint') empty = ['No money added yet', `${p.short} approved this goal today.`];
    else empty = ['No activity yet', `Money you or ${p.short} add will show up here.`];
  }

  return (
    <Screen topBar={<TopBar title="Savings Goal" onBack={nav.pop} />} tabBar onTabHome={() => nav.popTo('tdHome')} scrollClass="pad-12">
      <div style={{ padding: '6px 4px 0' }}>
        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{acc ? `Account ••${acc.last4}` : 'Account opens once approved'}</div>
        <div style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>{goal.name.toUpperCase()}</div>
      </div>
      <div style={{ position: 'relative', width: 300, height: 208, margin: '18px auto 0' }}>
        <Gauge percent={st.percent} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 92, textAlign: 'center' }}>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.4 }}>
            <Money value={st.saved} />
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>
            of {moneyWhole(goal.target)} · {st.percent}% saved
          </div>
          <div style={{ marginTop: 8 }}>
            <Chip>{goalChip(goal)}</Chip>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', margin: '10px 0 0', alignItems: 'stretch' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Left to save</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
            <Money value={st.left} />
          </div>
        </div>
        <span style={{ width: 1, background: 'var(--divider)' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Target date</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{goal.targetDate ? longDate(goal.targetDate) : 'None'}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
        <button className="btn-pill" disabled={pending || !acc} onClick={() => nav.modal('addMoney', { goalId: goal.id })}>
          <Icon name="plus" size={20} color={pending ? '#b0b0b0' : '#217e1a'} />
          Add money
        </button>
        <button className="btn-pill" onClick={() => nav.modal('editGoal', { id: goal.id })}>
          <Icon name="pencil" size={18} color="#217e1a" />
          Edit goal
        </button>
      </div>

      <h3 className="section-title" style={{ margin: '26px 2px 10px' }}>
        Contributions
      </h3>
      <div className="card" style={{ padding: '18px 16px 4px' }}>
        <SplitBar
          parts={[
            { value: goal.contributions.you, color: you.color },
            { value: goal.contributions.partner, color: p.color },
          ]}
        />
        <div style={{ marginTop: 8 }}>
          {[
            { person: you, name: 'You', pct: st.youPct, v: goal.contributions.you },
            { person: p, name: p.short, pct: st.partnerPct, v: goal.contributions.partner },
          ].map((r) => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 34 }}>
              <Avatar person={r.person} size={24} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{r.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-2)', marginRight: 6 }}>{r.pct}%</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                <Money value={r.v} />
              </span>
            </div>
          ))}
        </div>
        <div className="row kv" style={{ borderTop: '1px solid var(--divider)', marginTop: 4 }}>
          <span className="k">Interest earned</span>
          <span className="v" style={{ color: 'var(--green)' }}>
            {goal.interest ? '+' : ''}
            {money(goal.interest)}
          </span>
        </div>
      </div>

      <h3 className="section-title" style={{ margin: '24px 2px 10px' }}>
        Recent Activity
      </h3>
      <div className="card" style={{ padding: empty ? '20px 16px' : '0 16px' }}>
        {empty ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{empty[0]}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{empty[1]}</div>
          </div>
        ) : (
          goal.activity.map((a) => (
            <div className="row" key={a.id} style={{ minHeight: 52 }}>
              {a.who === 'bank' ? (
                <span style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--green-tint)', display: 'grid', placeItems: 'center' }}>
                  <Icon name="percent" size={13} color="#217e1a" />
                </span>
              ) : (
                <Avatar person={state.people[a.who]} size={24} />
              )}
              <div className="grow">
                <div className="title">{a.title}</div>
                <div className="detail" style={{ fontSize: 12, marginTop: 2 }}>
                  {a.detail}
                </div>
              </div>
              <span className="value" style={{ fontSize: 15, color: a.amount >= 0 ? 'var(--green)' : '#000' }}>
                {a.amount >= 0 ? '+' : ''}
                {money(a.amount)}
              </span>
            </div>
          ))
        )}
      </div>

      <h3 className="section-title" style={{ margin: '24px 2px 10px' }}>
        Goal Details
      </h3>
      <div className="card" style={{ padding: '0 16px' }}>
        <div className="row kv">
          <span className="k">Held in</span>
          <span className="v">{heldIn}</span>
        </div>
        <div className="row kv">
          <span className="k">Ownership</span>
          <span className="v">
            <Avatars people={[p, you]} size={24} />
            {goal.ownership === 'joint' ? 'Joint account' : 'Separate accounts'}
          </span>
        </div>
        <div className="row kv">
          <span className="k">Auto-deposit</span>
          <span className="v" style={{ fontWeight: 400, color: 'var(--text-2)' }}>
            Off
          </span>
        </div>
      </div>
    </Screen>
  );
}

/* ---------- Add money ---------- */


export function AddMoney() {
  const { state } = useStore();
  const nav = useNav();
  const ui = useUI();
  const { params } = useEntry();
  const [goalId, setGoalId] = useState<string>(params.goalId);
  const [fromId, setFromId] = useState<string>(params.fromId ?? seed.demo.addMoney.fromAccountId);
  const [amount, setAmount] = useState<number>(params.amount ?? seed.demo.addMoney.amount);
  const goal = state.goals.find((g) => g.id === goalId);
  const from = state.accounts.find((a) => a.id === fromId);
  const acc = goal ? goalAccount(state, goal) : undefined;
  const tooMuch = !!from && amount > from.balance;
  const ok = !!goal && !!acc && !!from && amount > 0 && !tooMuch;

  return (
    <Screen
      topBar={<TopBar title="Add Money" onClose={nav.close} onBack={params.inGroup ? nav.pop : undefined} />}
      scrollClass="pad"
      footer={
        <button className="btn-primary" disabled={!ok} onClick={() => nav.step('addReview', { goalId, fromId, amount, inGroup: params.inGroup })}>
          Continue
        </button>
      }
    >
      <div style={{ marginTop: 4 }}>
        <span className="label">From</span>
        <button
          className="field select-card"
          onClick={() =>
            ui.openSheet({
              type: 'pickAccount',
              field: 'from',
              current: fromId,
              onPick: setFromId,
            })
          }
        >
          <span style={{ flex: 1 }}>
            <span className="title" style={{ display: 'block' }}>
              {from?.name}
            </span>
            <span className="detail" style={{ display: 'block' }}>
              ••{from?.last4} · Available {money(from?.balance ?? 0)}
            </span>
          </span>
          <Icon name="chevronDown" size={20} color="#1e1e1e" />
        </button>
      </div>
      <div className="group">
        <span className="label">To</span>
        <button className="field select-card" onClick={() => ui.openSheet({ type: 'pickAccount', field: 'to', current: goalId, onPick: setGoalId })}>
          <span style={{ flex: 1 }}>
            <span className="title" style={{ display: 'block' }}>
              {goal?.name}
            </span>
            <span className="detail" style={{ display: 'block' }}>
              {acc ? `${acc.name} ••${acc.last4} · ${money(acc.balance)}` : ''}
            </span>
          </span>
          <Icon name="chevronDown" size={20} color="#1e1e1e" />
        </button>
      </div>
      <MoneyField label="Amount" value={amount} onChange={setAmount} big />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {seed.demo.addMoney.chips.map((c) => (
          <button
            key={c}
            onClick={() => setAmount(c)}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 18,
              background: '#fff',
              border: amount === c ? '2px solid var(--green)' : '2px solid transparent',
              color: amount === c ? 'var(--green)' : '#000',
              fontSize: 14,
              fontWeight: amount === c ? 600 : 500,
              cursor: 'pointer',
            }}
          >
            ${c}
          </button>
        ))}
      </div>
      {tooMuch && <p className="note" style={{ color: 'var(--danger)' }}>That's more than is available in this account.</p>}
    </Screen>
  );
}

export function AddReview() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const { params } = useEntry();
  const goal = state.goals.find((g) => g.id === params.goalId) as Goal;
  const from = state.accounts.find((a) => a.id === params.fromId);
  const acc = goalAccount(state, goal);
  const saved = goalStats(state, goal).saved;
  const confirm = () => {
    dispatch({ type: 'addMoney', goalId: goal.id, fromId: params.fromId, amount: params.amount });
    nav.step('addDone', { goalId: goal.id, amount: params.amount, conf: `4821 ${String(739 + Math.floor(Math.random() * 9000)).padStart(4, '0')}` });
  };
  return (
    <Screen topBar={<TopBar title="Add Money" onBack={nav.pop} onClose={nav.close} />} scrollClass="pad" footer={<button className="btn-primary" onClick={confirm}>Add money</button>}>
      <h2 className="h-page" style={{ marginTop: -6 }}>
        Review and confirm
      </h2>
      <div className="list-card" style={{ marginTop: 16 }}>
        <div className="row kv">
          <span className="k">From</span>
          <span className="v">
            {from?.name} ••{from?.last4}
          </span>
        </div>
        <div className="row kv">
          <span className="k">To</span>
          <span className="v">
            {goal.name} ••{acc?.last4}
          </span>
        </div>
        <div className="row kv">
          <span className="k">Amount</span>
          <span className="v">{money(params.amount)}</span>
        </div>
        <div className="row kv">
          <span className="k">Date</span>
          <span className="v">Today</span>
        </div>
      </div>
      <p className="note" style={{ marginTop: 16 }}>
        Your {goal.name} will be at {money(round2(saved + params.amount))} of {moneyWhole(goal.target)}.
      </p>
    </Screen>
  );
}

export function AddDone() {
  const { state } = useStore();
  const nav = useNav();
  const { params } = useEntry();
  const goal = state.goals.find((g) => g.id === params.goalId) as Goal;
  const firstInGroup = nav.stack.findIndex((e) => e.group === nav.top.group);
  const below = nav.stack[firstInGroup - 1];
  const openGoal = () => (below?.screen === 'goal' && below.params.id === goal.id ? nav.close() : nav.closeThen('goal', { id: goal.id }));
  return (
    <Screen footer={<button className="btn-primary" onClick={nav.close}>Done</button>}>
      <div className="success" style={{ paddingTop: 140 }}>
        <SuccessMark />
        <h2>Money added</h2>
        <p>
          {money(params.amount)} is now in your {goal.name}. {state.people.partner.short} can see it in Recent Activity.
        </p>
        <div style={{ width: 378, marginTop: 24 }}>
          <GoalCard state={state} goal={goal} onClick={openGoal} />
        </div>
        <p style={{ fontSize: 13, color: '#8a8a8a', marginTop: 22 }}>Confirmation no. {params.conf}</p>
      </div>
    </Screen>
  );
}

/* ---------- Edit goal ---------- */

export function EditGoal() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const { params } = useEntry();
  const goal = state.goals.find((g) => g.id === params.id) as Goal;
  const [name, setName] = useState(goal.name);
  const [target, setTarget] = useState(goal.target);
  const [date, setDate] = useState<string | null>(goal.targetDate);
  const save = () => {
    dispatch({ type: 'editGoal', id: goal.id, name, target, targetDate: date });
    nav.close();
  };
  return (
    <Screen topBar={<TopBar title="Edit Goal" onClose={nav.close} />} scrollClass="pad" footer={<button className="btn-primary" onClick={save} disabled={!name.trim() || !(target > 0)}>Save changes</button>}>
      <h2 className="h-page" style={{ marginTop: 18 }}>
        Edit your goal
      </h2>
      <TextField label="Goal name" value={name} onChange={setName} />
      <MoneyField label="Target amount" value={target} onChange={setTarget} />
      <DateField label="Target date (optional)" value={date} onChange={setDate} optional />
      <p className="note">{state.people.partner.short} will see your changes right away.</p>
    </Screen>
  );
}

/* ---------- Create a goal ---------- */

export function GoalDetails() {
  const { state } = useStore();
  const nav = useNav();
  const hasCar = state.goals.some((g) => g.name === seed.demo.newGoal.name);
  const [name, setName] = useState(hasCar ? 'Vacation' : seed.demo.newGoal.name);
  const [target, setTarget] = useState(hasCar ? 5000 : seed.demo.newGoal.target);
  const [date, setDate] = useState<string | null>(hasCar ? '2027-07-31' : seed.demo.newGoal.targetDate);
  return (
    <Screen
      topBar={<TopBar title="New Savings Goal" onClose={nav.close} />}
      scrollClass="pad"
      footer={
        <button className="btn-primary" disabled={!name.trim() || !(target > 0)} onClick={() => nav.step('goalSharing', { name, target, targetDate: date })}>
          Continue
        </button>
      }
    >
      <p className="step-label">Step 1 of 3</p>
      <h2 className="h-page">What are you saving for?</h2>
      <TextField label="Goal name" value={name} onChange={setName} />
      <MoneyField label="Target amount" value={target} onChange={setTarget} />
      <DateField label="Target date (optional)" value={date} onChange={setDate} optional />
    </Screen>
  );
}

export function GoalSharing() {
  const { state } = useStore();
  const nav = useNav();
  const { params } = useEntry();
  const p = state.people.partner;
  const existing = useMemo(() => state.accounts.filter((a) => a.owner === 'you' && a.type === 'savings' && !a.goalId), [state.accounts]);
  const [ownership, setOwnership] = useState<'separate' | 'joint'>(params.ownership ?? 'separate');
  const [holding, setHolding] = useState<'new' | 'existing'>(params.holding ?? 'new');
  const [pick, setPick] = useState<string | undefined>(params.existingAccountId ?? existing[0]?.id);
  const picked = existing.find((a) => a.id === pick);
  const next = () => nav.step('goalReview', { ...params, ownership, holding, existingAccountId: holding === 'existing' ? pick : undefined });

  return (
    <Screen topBar={<TopBar title="New Savings Goal" onBack={nav.pop} onClose={nav.close} />} scrollClass="pad" footer={<button className="btn-primary" disabled={ownership === 'separate' && holding === 'existing' && !picked} onClick={next}>Continue</button>}>
      <p className="step-label">Step 2 of 3</p>
      <h2 className="h-page">How will you save together?</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
        <button className={`option ${ownership === 'separate' ? 'on' : ''}`} onClick={() => setOwnership('separate')}>
          <span style={{ flex: 1 }}>
            <span className="ot" style={{ display: 'block' }}>
              Separate accounts
            </span>
            <span className="od" style={{ display: 'block' }}>
              You each save in your own account. You'll both see the goal and who added what.
            </span>
          </span>
          <Radio on={ownership === 'separate'} />
        </button>
        <button className={`option ${ownership === 'joint' ? 'on' : ''}`} onClick={() => setOwnership('joint')}>
          <span style={{ flex: 1 }}>
            <span className="ot" style={{ display: 'block' }}>
              Joint account
            </span>
            <span className="od" style={{ display: 'block' }}>
              Opens a joint savings account in both your names once {p.short} approves. You'll both own the money equally.
            </span>
          </span>
          <Radio on={ownership === 'joint'} />
        </button>
      </div>

      {ownership === 'separate' ? (
        <div style={{ marginTop: 24 }}>
          <span className="label">Where your money goes</span>
          <div className="list-card">
            <button className="row" onClick={() => setHolding('new')} style={{ alignItems: 'flex-start' }}>
              <div className="grow">
                <div className="title" style={{ fontSize: 16 }}>
                  Open a new savings account
                </div>
                <div className="detail">Starts at $0. Only money for this goal goes here.</div>
              </div>
              <Radio on={holding === 'new'} />
            </button>
            <button className="row" onClick={() => existing.length && setHolding('existing')} style={{ alignItems: 'flex-start', opacity: existing.length ? 1 : 0.5, borderBottom: holding === 'existing' ? 0 : undefined }}>
              <div className="grow">
                <div className="title" style={{ fontSize: 16 }}>
                  Use an account you already have
                </div>
                <div className="detail">{existing.length ? 'Its full balance counts toward the goal.' : 'Your savings accounts are already goals.'}</div>
              </div>
              <Radio on={holding === 'existing'} />
            </button>
            {holding === 'existing' && (
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '0 12px', margin: '0 0 16px' }}>
                {existing.map((a, i) => (
                  <button key={a.id} onClick={() => setPick(a.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, minHeight: 58, background: 'none', border: 0, borderTop: i ? '1px solid #e4e4e4' : 0, cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit', padding: 0 }}>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{a.name}</span>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>••{a.last4}</span>
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{money(a.balance)}</span>
                    <span style={{ width: 20, display: 'grid' }}>{pick === a.id && <Icon name="check" size={18} color="#217e1a" />}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="note">{holding === 'existing' && picked ? `Your goal will start at ${money(picked.balance)}, this account's full balance.` : `${p.short} will choose which of his accounts to use.`}</p>
        </div>
      ) : (
        <div style={{ marginTop: 24 }}>
          <span className="label">What happens next</span>
          <div className="list-card">
            {[`You send the goal to ${p.short}`, `${p.short} approves it in his TD app`, 'We open a joint savings account (HISA) for the goal'].map((t, i) => (
              <div className="row" key={t} style={{ minHeight: 50 }}>
                <span className="num-dot">{i + 1}</span>
                <span className="grow" style={{ fontSize: 15 }}>
                  {t}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Screen>
  );
}

export function GoalReview() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const { params } = useEntry();
  const p = state.people.partner;
  const joint = params.ownership === 'joint';
  const existing = state.accounts.find((a) => a.id === params.existingAccountId);
  const heldIn = joint ? 'New joint HISA' : params.holding === 'existing' && existing ? `${existing.name} ••${existing.last4}` : 'New TD Savings account';
  const create = () => {
    const id = `goal-${Date.now().toString(36)}`;
    dispatch({
      type: 'createGoal',
      id,
      input: { name: params.name, target: params.target, targetDate: params.targetDate, ownership: params.ownership, holding: params.holding, existingAccountId: params.existingAccountId },
    });
    nav.step('goalResult', { id });
  };
  const rows: [string, string][] = [
    ['Goal name', params.name],
    ['Target amount', money(params.target)],
    ['Target date', params.targetDate ? longDate(params.targetDate) : 'None'],
    ['Ownership', joint ? 'Joint account' : 'Separate accounts'],
    ['Held in', heldIn],
  ];
  return (
    <Screen topBar={<TopBar title="New Savings Goal" onBack={nav.pop} onClose={nav.close} />} scrollClass="pad" footer={<button className="btn-primary" onClick={create}>{joint ? `Send to ${p.short}` : 'Create goal'}</button>}>
      <p className="step-label">Step 3 of 3</p>
      <h2 className="h-page">Review and confirm</h2>
      <div className="list-card" style={{ marginTop: 16 }}>
        {rows.map(([k, v]) => (
          <div className="row kv" key={k}>
            <span className="k">{k}</span>
            <span className="v">{v}</span>
          </div>
        ))}
        <div className="row kv">
          <span className="k">{joint ? 'Needs approval from' : 'Shared with'}</span>
          <span className="v">
            <Avatar person={p} size={24} />
            {p.short}
          </span>
        </div>
      </div>
      <p className="note" style={{ marginTop: 16 }}>
        {joint ? `We'll send this to ${p.short}. The joint account opens once he approves.` : "He'll see it on his TD Together page right away."}
      </p>
    </Screen>
  );
}

export function GoalResult() {
  const { state } = useStore();
  const nav = useNav();
  const { params } = useEntry();
  const goal = state.goals.find((g) => g.id === params.id);
  if (!goal) return null;
  const p = state.people.partner;
  const joint = goal.ownership === 'joint';
  return (
    <Screen
      footer={
        <>
          {!joint && (
            <button className="link" onClick={() => nav.step('addMoney', { goalId: goal.id, inGroup: true })}>
              Add money now
            </button>
          )}
          <button className="btn-primary" onClick={nav.close}>
            Done
          </button>
        </>
      }
    >
      <div className="success" style={{ paddingTop: 140 }}>
        <SuccessMark />
        <h2>{joint ? `Sent to ${p.short}` : 'Goal created'}</h2>
        <p>{joint ? `${goal.name}'s joint account opens once ${p.short} approves. We'll let you know when he does.` : `${goal.name} is now on your TD Together page. ${p.short} can see it and add money from his own account.`}</p>
        <div style={{ width: 378, marginTop: 24 }}>
          <GoalCard state={state} goal={goal} onClick={() => nav.closeThen('goal', { id: goal.id })} />
        </div>
      </div>
    </Screen>
  );
}
