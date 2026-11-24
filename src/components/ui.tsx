// Shared building blocks, matching the Figma components (Build Spec §9).
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon, OpenAll, PlusCircle, StatusIcons, TabAccounts, TabHome, TabMore, TabMoveMoney, TabRewards } from './icons';
import { longDate, parseMoney, money } from '../state/format';
import type { Person } from '../state/seed';

/* ---------- Screen shell ---------- */

interface ShellProps {
  tone?: 'light' | 'dark';
  strip?: 'green' | 'grey';
  topBar?: ReactNode;
  tabBar?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  scrollClass?: string;
  bgStyle?: CSSProperties;
  onTabHome?: () => void;
}

export function Screen({ tone = 'dark', strip = 'grey', topBar, tabBar, footer, children, className = '', scrollClass = '', bgStyle, onTabHome }: ShellProps) {
  const [scrolled, setScrolled] = useState(false);
  return (
    <div className={`screen ${className}`} style={bgStyle}>
      <div className={`statusbar ${scrolled && strip === 'grey' ? 'dark' : tone}`}>
        <span className="time">9:41</span>
        <span className="icons">
          <StatusIcons color={(scrolled && strip === 'grey' ? 'dark' : tone) === 'light' ? '#fff' : '#000'} />
        </span>
      </div>
      <div className={`status-strip ${strip} ${topBar ? 'tall' : ''} ${scrolled ? 'on' : ''}`} />
      {topBar}
      <div
        className={`scroll ${topBar ? 'has-topbar' : ''} ${tabBar ? 'has-tabbar' : ''} ${scrollClass}`}
        onScroll={(e) => {
          const on = e.currentTarget.scrollTop > 4;
          if (on !== scrolled) setScrolled(on);
        }}
      >
        {children}
      </div>
      {footer && <div className="footer">{footer}</div>}
      {tabBar && <TabBar onHome={onTabHome} />}
    </div>
  );
}

export function TopBar({ title, onBack, onClose }: { title?: string; onBack?: () => void; onClose?: () => void }) {
  return (
    <div className="topbar">
      {onBack && (
        <button className="round-btn left" onClick={onBack} aria-label="Back">
          <Icon name="back" size={24} />
        </button>
      )}
      {title && <h1>{title}</h1>}
      {onClose && (
        <button className="round-btn right" onClick={onClose} aria-label="Close">
          <Icon name="x" size={22} />
        </button>
      )}
    </div>
  );
}

export function TabBar({ onHome }: { onHome?: () => void }) {
  const tabs = [
    { label: 'Accounts', Icon: TabAccounts },
    { label: 'Move Money', Icon: TabMoveMoney },
    { label: 'Rewards', Icon: TabRewards },
    { label: 'More', Icon: TabMore },
  ];
  return (
    <nav className="tabbar" aria-label="Tab bar">
      <button className="tab on" onClick={onHome} aria-current="page">
        <TabHome color="#217e1a" />
        Home
      </button>
      {tabs.map(({ label, Icon: I }) => (
        <button key={label} className="tab" tabIndex={-1}>
          <I />
          {label}
        </button>
      ))}
    </nav>
  );
}

/* ---------- Small pieces ---------- */

export function Avatar({ person, size = 24, border = 1.5, style }: { person: Person; size?: number; border?: number; style?: CSSProperties }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: person.color, borderWidth: border, fontSize: size >= 40 ? 18 : size >= 30 ? 13 : 11, ...style }}
      aria-label={person.name}
    >
      {person.initial}
    </span>
  );
}

export function Avatars({ people, size = 24, border = 1.5 }: { people: Person[]; size?: number; border?: number }) {
  return (
    <span className="avatars">
      {people.map((p, i) => (
        <Avatar key={i} person={p} size={size} border={border} style={i ? { marginLeft: -Math.round(size * 0.22) } : undefined} />
      ))}
    </span>
  );
}

export const Chip = ({ children }: { children: ReactNode }) => <span className="chip">{children}</span>;

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button className={`toggle ${on ? 'on' : ''}`} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}>
      <span className="knob" />
    </button>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const i = Math.max(0, options.findIndex((o) => o.value === value));
  const w = 100 / options.length;
  return (
    <div className="segmented" role="tablist">
      <motion.span
        className="segment-thumb"
        initial={false}
        animate={{ left: `calc(${i * w}% + ${i === 0 ? 3 : i === options.length - 1 ? -3 : 0}px)` }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        style={{ width: `calc(${w}% - 3px)` }}
      />
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} className={`segment ${o.value === value ? 'on' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SectionHeader({ title, onOpen, onMore }: { title: string; onOpen?: () => void; onMore?: () => void }) {
  return (
    <div className="sec-head">
      <button className="title-btn" onClick={onOpen} disabled={!onOpen}>
        <span className="section-title">{title}</span>
        {onOpen && <OpenAll />}
      </button>
      {onMore && (
        <button className="more" onClick={onMore} aria-label={`${title} options`}>
          <Icon name="more" size={22} />
        </button>
      )}
    </div>
  );
}

export function CreateButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="create-btn" onClick={onClick}>
      <PlusCircle />
      {label}
    </button>
  );
}

export function SuccessMark() {
  return (
    <motion.div className="success-mark" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.1 }}>
      <Icon name="check" size={30} color="#fff" />
    </motion.div>
  );
}

export function Radio({ on }: { on: boolean }) {
  return <span className={`radio ${on ? 'on' : ''}`} aria-hidden="true" />;
}

export function Checkbox({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button className="check-row" role="checkbox" aria-checked={on} onClick={() => onChange(!on)}>
      <span className={`checkbox ${on ? 'on' : ''}`}>{on && <Icon name="check" size={14} color="#fff" />}</span>
      {label}
    </button>
  );
}

/* ---------- Form fields ---------- */

export function TextField({ label, value, onChange, inputMode, placeholder }: { label: string; value: string; onChange: (v: string) => void; inputMode?: 'text' | 'tel' | 'email'; placeholder?: string }) {
  return (
    <label className="group" style={{ display: 'block' }}>
      <span className="label">{label}</span>
      <span className="field">
        <input value={value} onChange={(e) => onChange(e.target.value)} inputMode={inputMode} placeholder={placeholder} aria-label={label} />
      </span>
    </label>
  );
}

/** Money input: shows "$15,000.00"; while typing it keeps what you type. */
export function MoneyField({ label, value, onChange, big }: { label: string; value: number; onChange: (n: number) => void; big?: boolean }) {
  const [text, setText] = useState(Number.isFinite(value) && value > 0 ? money(value) : '');
  const [focused, setFocused] = useState(false);
  const shown = focused ? text : Number.isFinite(value) && value > 0 ? money(value) : text;
  return (
    <label className="group" style={{ display: 'block' }}>
      <span className="label">{label}</span>
      <span className={`field ${big ? 'big' : ''}`}>
        <input
          inputMode="decimal"
          value={shown}
          aria-label={label}
          placeholder="$0.00"
          onFocus={() => {
            setFocused(true);
            setText(Number.isFinite(value) && value > 0 ? money(value) : '');
          }}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.,$]/g, '');
            setText(raw.startsWith('$') || raw === '' ? raw : '$' + raw);
            const n = parseMoney(raw);
            onChange(Number.isFinite(n) ? n : 0);
          }}
        />
      </span>
    </label>
  );
}

export function DateField({ label, value, onChange, optional }: { label: string; value: string | null; onChange: (v: string | null) => void; optional?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label className="group" style={{ display: 'block' }}>
      <span className="label">{label}</span>
      <span className="field">
        <span className={`date-text ${value ? '' : 'empty'}`}>{value ? longDate(value) : optional ? 'No date' : 'Choose a date'}</span>
        <span className="icon">
          <Icon name="calendar" size={16} color="#1e1e1e" />
        </span>
        <input
          ref={ref}
          className="date-native"
          type="date"
          aria-label={label}
          value={value ?? ''}
          onClick={() => {
            try {
              ref.current?.showPicker?.();
            } catch {
              /* not supported */
            }
          }}
          onChange={(e) => onChange(e.target.value || (optional ? null : value))}
        />
      </span>
    </label>
  );
}

export function SelectField<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <label className="group" style={{ display: 'block' }}>
      <span className="label">{label}</span>
      <span className="field">
        <select value={value} onChange={(e) => onChange(e.target.value as T)} aria-label={label}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="icon">
          <Icon name="chevronDown" size={20} color="#1e1e1e" />
        </span>
      </span>
    </label>
  );
}

/* ---------- Collapsible ---------- */

export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="c"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Animates a number when it changes (balances visibly moving). */
export function useAnimatedNumber(value: number, ms = 600) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useLayoutEffect(() => {
    const start = performance.now();
    const a = from.current;
    const b = value;
    if (a === b) return;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      setShown(a + (b - a) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = b;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = b;
    };
  }, [value, ms]);
  return shown;
}

export function Money({ value, signed }: { value: number; signed?: boolean }) {
  const v = useAnimatedNumber(value);
  return <>{signed ? (value < 0 ? '−' : '+') + money(Math.abs(v)).replace('−', '') : money(v)}</>;
}
