// Set up TD Together: choose what to share → invite your partner → invite sent.
import { useState } from 'react';
import { Icon } from '../components/icons';
import { Avatar, Screen, Segmented, SuccessMark, TextField, Toggle, TopBar } from '../components/ui';
import { useStore } from '../state/store';
import { useNav } from '../state/nav';
import { useUI } from '../state/ui';
import { money } from '../state/format';
import { myToggleable } from '../state/derive';
import type { Account } from '../state/seed';
import { seed } from '../state/seed';

export function ShareRow({ a, onChange }: { a: Account; onChange: (on: boolean) => void }) {
  return (
    <div className="row">
      <div className="grow">
        <div className="title" style={{ fontSize: 16 }}>
          {a.name}
        </div>
        <div className="detail">
          ••{a.last4} · {money(a.balance)}
        </div>
      </div>
      <Toggle on={a.shared} onChange={onChange} label={`Share ${a.name}`} />
    </div>
  );
}

export function ShareGroups({ accounts }: { accounts: Account[] }) {
  const { dispatch } = useStore();
  const groups: [string, Account[]][] = [
    ['Banking', accounts.filter((a) => a.type === 'chequing')],
    ['Investing', accounts.filter((a) => a.type === 'investing')],
    ['Credit Cards', accounts.filter((a) => a.type === 'credit')],
  ];
  return (
    <>
      {groups
        .filter(([, list]) => list.length)
        .map(([title, list]) => (
          <div key={title} style={{ marginTop: 16 }}>
            <span className="label">{title}</span>
            <div className="list-card">
              {list.map((a) => (
                <ShareRow key={a.id} a={a} onChange={(on) => dispatch({ type: 'setShared', id: a.id, shared: on })} />
              ))}
            </div>
          </div>
        ))}
    </>
  );
}

export function SetupShare() {
  const { state } = useStore();
  const nav = useNav();
  return (
    <Screen topBar={<TopBar title="Set Up TD Together" onClose={nav.close} />} scrollClass="pad" footer={<button className="btn-primary" onClick={() => nav.step('setupInvite')}>Continue</button>}>
      <p className="step-label">Step 1 of 2</p>
      <h2 className="h-page">Choose what to share</h2>
      <p className="sub">Your partner will see the balance of each account you turn on. They can't see your transactions or move your money.</p>
      <ShareGroups accounts={myToggleable(state)} />
    </Screen>
  );
}

export function SetupInvite() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const [name, setName] = useState(state.people.partner.name || seed.demo.invite.name);
  const [method, setMethod] = useState<'text' | 'email'>('text');
  const [phone, setPhone] = useState(seed.demo.invite.phone);
  const [email, setEmail] = useState(seed.demo.invite.email);
  const contact = method === 'text' ? phone : email;
  const send = () => {
    dispatch({ type: 'sendInvite', name, method, contact });
    nav.step('setupSent');
  };
  return (
    <Screen
      topBar={<TopBar title="Set Up TD Together" onBack={nav.pop} onClose={nav.close} />}
      scrollClass="pad"
      footer={
        <button className="btn-primary" onClick={send} disabled={!name.trim() || !contact.trim()}>
          Send invite
        </button>
      }
    >
      <p className="step-label">Step 2 of 2</p>
      <h2 className="h-page">Invite your partner</h2>
      <p className="sub">We'll send them a link to join. If they're new to TD, they can open an account first.</p>
      <TextField label="Partner's name" value={name} onChange={setName} />
      <div className="group">
        <span className="label">Send invite by</span>
        <Segmented
          value={method}
          onChange={setMethod}
          options={[
            { value: 'text', label: 'Text message' },
            { value: 'email', label: 'Email' },
          ]}
        />
      </div>
      {method === 'text' ? (
        <TextField label="Mobile number" value={phone} onChange={setPhone} inputMode="tel" />
      ) : (
        <TextField label="Email address" value={email} onChange={setEmail} inputMode="email" />
      )}
      <div className="group">
        <span className="label">Message preview</span>
        <div className="list-card" style={{ padding: '14px 16px 12px' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{state.people.you.short} invited you to TD Together</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.3 }}>Manage money together, with no joint account needed.</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)', marginTop: 6 }}>Join {state.people.you.short}</div>
        </div>
      </div>
    </Screen>
  );
}

export function SetupSent() {
  const { state } = useStore();
  const nav = useNav();
  const ui = useUI();
  const p = state.people.partner;
  const how = state.together.inviteMethod === 'text' ? 'texted' : 'emailed';
  return (
    <Screen
      footer={
        <>
          <button className="link" onClick={() => ui.showToast(`Invite sent again to ${p.short}`)}>
            Resend invite
          </button>
          <button className="btn-primary" onClick={nav.close}>
            Done
          </button>
        </>
      }
    >
      <div className="success" style={{ paddingTop: 200 }}>
        <SuccessMark />
        <h2>Invite sent</h2>
        <p>
          We {how} a link to {state.together.inviteContact}. Shared accounts show up once it's accepted.
        </p>
        <div className="list-card" style={{ width: '100%', marginTop: 24, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
          <Avatar person={p} size={24} />
          <span style={{ flex: 1, textAlign: 'left', fontSize: 15, fontWeight: 600 }}>{p.short}</span>
          <Icon name="clock" size={14} color="#6f6f6f" />
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Waiting to join</span>
        </div>
      </div>
    </Screen>
  );
}
