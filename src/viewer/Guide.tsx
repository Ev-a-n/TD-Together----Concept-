// "Try this": the flows laid out as a short trail of stops. Done stops fill in, the next one is ringed.
import type { GuideKey } from '../state/store';

export const GUIDE: { key: GuideKey; label: string }[] = [
  { key: 'setup', label: 'Set up TD Together and invite Evan' },
  { key: 'joined', label: 'Open TD Together once he joins' },
  { key: 'balance', label: 'Tap the combined balance' },
  { key: 'addMoney', label: 'Add money to a savings goal' },
  { key: 'newGoal', label: 'Create a savings goal' },
  { key: 'jointGoal', label: 'Make a joint goal for Evan to approve' },
  { key: 'bill', label: 'Add or edit a bill reminder' },
  { key: 'sharing', label: 'Change what you share' },
  { key: 'leave', label: 'Leave TD Together in Settings' },
];

export function Guide({ done, partner }: { done: Partial<Record<GuideKey, boolean>>; partner: string }) {
  const finished = GUIDE.filter((g) => done[g.key]).length;
  const next = GUIDE.findIndex((g) => !done[g.key]);
  return (
    <aside className="guide" aria-label="Try this">
      <h2>
        Try this
        <span>{finished === GUIDE.length ? 'All done' : `${finished} of ${GUIDE.length}`}</span>
      </h2>
      <ol className="trail">
        {GUIDE.map((g, i) => (
          <li key={g.key} className={done[g.key] ? 'done' : i === next ? 'next' : ''} aria-current={i === next ? 'step' : undefined}>
            <span className="stop" aria-hidden="true">
              {done[g.key] ? (
                <svg width="10" height="10" viewBox="0 0 24 24">
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span className="stop-label">{g.label.replace('Evan', partner)}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
