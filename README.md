# TD Together — a TD app concept prototype

A working, in-browser prototype of **TD Together**: couples see their money
together, save toward goals and keep track of shared bills, without opening a
joint account or taking on legal liability for each other's money.

**Live:** https://ev-a-n.github.io/TD-Together----Concept-/

> Student UX concept. Not affiliated with TD Bank. All names, accounts and
> balances are made up. The real TD logo is left out on purpose.

## What you can try

The demo is Sydney's view of the app. Her partner, Evan, is simulated: he
joins and approves joint goals on short timers. The "Try this" list beside the
phone ticks off each flow as you play it.

1. Set up TD Together and invite Evan (or tap "Maybe later" and use the card)
2. Open TD Together once he joins
3. Tap the combined balance for the chart and breakdown
4. Add money to a savings goal and watch the balances move
5. Create a savings goal (a new account, or one you already have)
6. Make a joint goal and wait for Evan's approval
7. Add, edit or delete a bill reminder
8. Change which accounts you share
9. Leave TD Together in Settings

**Restart prototype** (under the phone) puts everything back to the start.
`F` toggles full screen. On a phone, the prototype fills the screen.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

## Where things live

| To change… | Edit |
| --- | --- |
| Starting accounts, goals, bills, names | `src/state/seed.ts` |
| Rules (combined balance, splits, countdowns) | `src/state/derive.ts` |
| What each action does to the data | `src/state/store.tsx` |
| Colours, sizes, timings | `src/styles/tokens.css` |
| Screens | `src/screens/` |
| Evan's simulated join and approval timers | `src/components/overlays.tsx` (PartnerEngine) |
| The page around the phone | `src/viewer/` |

Design source: the TD Together Figma file. Build spec: "TD Together — Build
Spec for the coded demo".

## Publish

Pushing to `main` builds and publishes the site with the workflow in
`.github/workflows/deploy.yml`. In the repository, set **Settings → Pages →
Source** to **GitHub Actions** once.
