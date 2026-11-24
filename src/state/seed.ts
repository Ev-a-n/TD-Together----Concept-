// The demo's starting data (Build Spec §4). Everything on screen is derived from this.

export type Owner = 'you' | 'partner' | 'joint';
export type AccountType = 'chequing' | 'savings' | 'investing' | 'credit';
export type Who = 'you' | 'partner';

export interface Account {
  id: string;
  owner: Owner;
  type: AccountType;
  name: string;
  tdHomeName?: string;
  number?: string;
  last4: string;
  balance: number;
  shared: boolean;
  /** Set when the whole account is a goal (a new goal account, or an existing account labelled as a goal). */
  goalId?: string;
}

export interface Activity {
  id: string;
  who: Who | 'bank';
  kind: 'deposit' | 'withdrawal' | 'interest';
  title: string;
  detail: string;
  amount: number;
}

export interface Goal {
  id: string;
  name: string;
  accountId: string | null;
  ownership: 'joint' | 'separate';
  /** For separate goals: a brand-new account, or an account Sydney already had. */
  holding?: 'new' | 'existing';
  target: number;
  targetDate: string | null;
  status: 'live' | 'pending';
  contributions: Record<Who, number>;
  interest: number;
  activity: Activity[];
  createdToday?: boolean;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  estimate?: boolean;
  repeats: 'once' | 'week' | '2weeks' | 'month' | 'year';
  nextDue: string;
  payers: Who[];
  addedBy: Who;
}

export interface Person {
  name: string;
  short: string;
  initial: string;
  color: string;
}

export type TogetherStatus = 'none' | 'setupCard' | 'pending' | 'joined';

export const TODAY = '2026-11-11';

export const seed = {
  people: {
    you: { name: 'Sydney Lynn', short: 'Sydney', initial: 'S', color: '#30b1d8' } as Person,
    partner: { name: 'Evan', short: 'Evan', initial: 'E', color: '#534ab7' } as Person,
  },
  accounts: [
    { id: 'syd-chq', owner: 'you', type: 'chequing', name: 'Student Chequing', tdHomeName: 'TD STUDENT CHEQUING', number: '6643721', last4: '3721', balance: 4102.31, shared: true },
    { id: 'syd-biz', owner: 'you', type: 'chequing', name: 'TD Business Account', tdHomeName: 'TD BUSINESS ACCOUNT', number: '6648902', last4: '8902', balance: 2001.87, shared: false },
    { id: 'syd-tfsa', owner: 'you', type: 'investing', name: 'TFSA', tdHomeName: 'TD TFSA', number: '6643219', last4: '3219', balance: 9247.82, shared: true },
    { id: 'syd-visa', owner: 'you', type: 'credit', name: 'Cash Back Visa', tdHomeName: 'TD CASH BACK VISA', number: '4520 •••• 0912', last4: '0912', balance: 642.18, shared: true },
    { id: 'syd-eprem', owner: 'you', type: 'savings', name: 'TD ePremium Savings', tdHomeName: 'TD EPREMIUM SAVINGS', number: '6646618', last4: '6618', balance: 9000.0, shared: false },
    { id: 'syd-every', owner: 'you', type: 'savings', name: 'TD Every Day Savings', tdHomeName: 'TD EVERY DAY SAVINGS', number: '6642041', last4: '2041', balance: 1240.55, shared: false },
    { id: 'ev-chq', owner: 'partner', type: 'chequing', name: 'Unlimited Chequing', last4: '4821', balance: 3214.5, shared: true },
    { id: 'ev-sav', owner: 'partner', type: 'savings', name: 'High Interest Savings', last4: '7730', balance: 4360.23, shared: true },
    { id: 'ev-inv', owner: 'partner', type: 'investing', name: 'TFSA', last4: '5168', balance: 4500.0, shared: true },
    { id: 'ev-card', owner: 'partner', type: 'credit', name: 'Credit card', last4: '2290', balance: 318.4, shared: true },
    { id: 'joint-ef', owner: 'joint', type: 'savings', name: 'Joint HISA', tdHomeName: 'TD JOINT HISA', number: '6645512', last4: '5512', balance: 12000.45, shared: true },
  ] as Account[],
  goals: [
    {
      id: 'ef',
      name: 'Emergency Fund',
      accountId: 'joint-ef',
      ownership: 'joint',
      target: 20000,
      targetDate: '2027-06-30',
      status: 'live',
      contributions: { you: 5494.33, partner: 6420.0 },
      interest: 86.12,
      activity: [
        { id: 'a1', who: 'you', kind: 'deposit', title: 'Deposit', detail: 'From chequing ••3721 · Nov 6', amount: 250.0 },
        { id: 'a2', who: 'partner', kind: 'deposit', title: 'Deposit', detail: 'From chequing ••4821 · Nov 6', amount: 250.0 },
        { id: 'a3', who: 'bank', kind: 'interest', title: 'Interest paid', detail: 'Monthly interest · Oct 31', amount: 21.37 },
        { id: 'a4', who: 'partner', kind: 'withdrawal', title: 'Withdrawal', detail: 'To chequing ••4821 · Oct 20', amount: -150.0 },
      ],
    },
  ] as Goal[],
  bills: [
    { id: 'hydro', name: 'Hydro', amount: 142.6, repeats: 'month', nextDue: '2026-11-14', payers: ['partner', 'you'], addedBy: 'partner' },
    { id: 'internet', name: 'Internet', amount: 85.0, repeats: 'month', nextDue: '2026-11-18', payers: ['partner'], addedBy: 'partner' },
    { id: 'mortgage', name: 'Mortgage', amount: 1850.0, repeats: 'month', nextDue: '2026-11-28', payers: ['partner', 'you'], addedBy: 'partner' },
  ] as Bill[],
  demo: {
    newGoal: { name: 'New Car', target: 15000, targetDate: '2027-12-31', newAccountLast4: '8841', jointAccountLast4: '7304' },
    newBill: { name: 'Phone', amount: 65.0, repeats: 'month' as Bill['repeats'], nextDue: '2026-11-16', payers: ['you'] as Who[] },
    addMoney: { amount: 250.0, chips: [50, 100, 250], fromAccountId: 'syd-chq' },
    invite: { name: 'Evan', method: 'text' as 'text' | 'email', phone: '(519) 555-0148', email: 'evan.m@email.com' },
  },
};
