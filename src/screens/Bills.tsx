// Bill reminders: the list, and one form for new and edit (with delete).
import { useState } from 'react';
import { Icon } from '../components/icons';
import { Avatars, Checkbox, CreateButton, DateField, MoneyField, Screen, Segmented, SelectField, TextField, TopBar } from '../components/ui';
import { payersOf } from '../components/finance';
import { useStore } from '../state/store';
import { useEntry, useNav } from '../state/nav';
import { useUI } from '../state/ui';
import { money, shortDay } from '../state/format';
import { repeatsLabel, upcomingBills } from '../state/derive';
import { seed, type Bill, type Who } from '../state/seed';

export function BillsList() {
  const { state } = useStore();
  const nav = useNav();
  const bills = upcomingBills(state);
  return (
    <Screen topBar={<TopBar title="Bill Reminders" onClose={nav.close} />} scrollClass="pad">
      <p style={{ fontSize: 14, color: 'var(--text-2)', margin: '0 0 14px' }}>{bills.length ? 'Tap a reminder to edit or delete it.' : 'No bill reminders yet.'}</p>
      {bills.length > 0 && (
        <div className="list-card">
          {bills.map((b) => (
            <button className="row" key={b.id} onClick={() => nav.step('billForm', { id: b.id })}>
              <span style={{ width: 42, display: 'flex' }}>
                <Avatars people={payersOf(b, state.people)} size={24} />
              </span>
              <div className="grow">
                <div className="title">{b.name}</div>
                <div className="detail">
                  {repeatsLabel(b.repeats)} · {shortDay(b.nextDue)}
                </div>
              </div>
              <span className="value" style={{ fontSize: 15, fontWeight: 700 }}>
                {b.estimate ? '~' : ''}
                {money(b.amount)}
              </span>
              <Icon name="chevronRight" size={20} color="#8a8a8a" />
            </button>
          ))}
        </div>
      )}
      <div style={{ marginTop: 18 }}>
        <CreateButton label="Create a bill reminder" onClick={() => nav.step('billForm')} />
      </div>
    </Screen>
  );
}

type Payer = 'you' | 'partner' | 'both';
const toPayer = (p: Who[]): Payer => (p.length === 2 ? 'both' : p[0] === 'partner' ? 'partner' : 'you');
const fromPayer = (p: Payer): Who[] => (p === 'both' ? ['partner', 'you'] : [p]);

export function BillForm() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const ui = useUI();
  const { params, kind } = useEntry();
  const existing = params.id ? state.bills.find((b) => b.id === params.id) : undefined;
  const d = seed.demo.newBill;
  const hasPhone = state.bills.some((b) => b.name === d.name);
  const [name, setName] = useState(existing?.name ?? (hasPhone ? '' : d.name));
  const [amount, setAmount] = useState(existing?.amount ?? (hasPhone ? 0 : d.amount));
  const [estimate, setEstimate] = useState(!!existing?.estimate);
  const [due, setDue] = useState<string | null>(existing?.nextDue ?? d.nextDue);
  const [often, setOften] = useState<'once' | 'repeats'>(existing ? (existing.repeats === 'once' ? 'once' : 'repeats') : 'repeats');
  const [every, setEvery] = useState<Exclude<Bill['repeats'], 'once'>>(existing && existing.repeats !== 'once' ? existing.repeats : 'month');
  const [payer, setPayer] = useState<Payer>(existing ? toPayer(existing.payers) : 'you');
  const p = state.people.partner;
  const back = kind === 'step' ? nav.pop : nav.close;

  const save = () => {
    dispatch({
      type: 'saveBill',
      bill: { id: existing?.id, name: name.trim(), amount, estimate, nextDue: due ?? d.nextDue, repeats: often === 'once' ? 'once' : every, payers: fromPayer(payer) },
    });
    if (!existing) ui.showToast(`${name.trim()} reminder added`);
    back();
  };
  const remove = () => {
    if (!existing) return;
    ui.openDialog({
      type: 'deleteBill',
      billId: existing.id,
      name: existing.name,
      onConfirm: () => {
        dispatch({ type: 'deleteBill', id: existing.id });
        back();
      },
    });
  };

  return (
    <Screen
      topBar={<TopBar title={existing ? 'Edit Bill Reminder' : 'New Bill Reminder'} onBack={kind === 'step' ? nav.pop : undefined} onClose={nav.close} />}
      scrollClass="pad"
      footer={
        <>
          {existing && (
            <button className="link danger" onClick={remove}>
              Delete reminder
            </button>
          )}
          <button className="btn-primary" disabled={!name.trim() || !(amount > 0) || !due} onClick={save}>
            {existing ? 'Save changes' : 'Create reminder'}
          </button>
        </>
      }
    >
      <div style={{ marginTop: -18 }}>
        <TextField label="Bill name" value={name} onChange={setName} placeholder="e.g. Rent" />
      </div>
      <MoneyField label="Amount" value={amount} onChange={setAmount} />
      <Checkbox on={estimate} onChange={setEstimate} label="Amount is an estimate" />
      <DateField label="Due date" value={due} onChange={setDue} />
      <div className="group">
        <span className="label">How often</span>
        <Segmented
          value={often}
          onChange={setOften}
          options={[
            { value: 'once', label: 'One time' },
            { value: 'repeats', label: 'Repeats' },
          ]}
        />
      </div>
      {often === 'repeats' && (
        <SelectField
          label="Repeats every"
          value={every}
          onChange={setEvery}
          options={[
            { value: 'week', label: 'Week' },
            { value: '2weeks', label: '2 weeks' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
        />
      )}
      <div className="group">
        <span className="label">Who pays</span>
        <Segmented
          value={payer}
          onChange={setPayer}
          options={[
            { value: 'you', label: 'You' },
            { value: 'partner', label: p.short },
            { value: 'both', label: 'Both' },
          ]}
        />
      </div>
    </Screen>
  );
}
