# ReconForge

**Enterprise Automated Reconciliation Engine** for financial operations and banking teams.

ReconForge demonstrates a production-quality reconciliation workflow: import two data sources (GL vs. Bank Statement), run an automated matching engine, review results, manage exceptions, and approve completed reconciliations.

---

## Features

- **Reconciliation Dashboard** — KPI overview, match rate, open exceptions, period summary table
- **New Reconciliation Run** — Step-by-step flow: configure sources → automated processing → review results
- **Matched Pairs Viewer** — Side-by-side GL vs. Bank transaction pairs with match type and confidence
- **Exception Management** — Investigate, assign, add notes, resolve, or waive exceptions with audit trail
- **Audit Log** — Complete, timestamped audit trail of all reconciliation actions
- **Role-appropriate UI** — Designed for Senior Financial Operations professionals, not engineers

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS (custom `forge` green palette)
- React Router v6
- Lucide React icons
- Sonner (toast notifications)
- date-fns, clsx, tailwind-merge

## Getting Started

```bash
npm install
npm run dev        # development server
npm run build      # production build
npm run preview    # preview production build
```

## Demo Routes

| Route | Description |
|-------|-------------|
| `/` | Operations Dashboard |
| `/reconciliations` | All reconciliation runs |
| `/reconciliations/new` | Create new run (3-step wizard) |
| `/reconciliations/:id` | Run detail (overview, matches, exceptions tabs) |
| `/exceptions` | Exception management |
| `/audit` | Audit log |

## Demo Credentials

No authentication required. The demo simulates a logged-in user (Henry M.).

## Seed Data

Three pre-loaded reconciliation runs:
- **November 2026** (in review): 20 matched, 4 open exceptions requiring resolution
- **October 2026** (approved): 9 matched, 1 resolved timing-difference exception
- **September 2026** (approved): 8 matched, 1 waived amount-mismatch exception

Data persists across page reloads via `localStorage`. Use **Reset Demo Data** in the sidebar footer to restore original seed data.

## Assumptions

- The job post describes import of two data sources (GL + bank statement) for reconciliation — this is implemented as the primary workflow
- "Production quality" is interpreted as a fully interactive, data-consistent frontend demo without a real backend
- Status transitions are simulated with realistic delays; no actual bank or GL connectivity is required

## Deployment

Configured for Vercel SPA deployment (`vercel.json` rewrites all paths to `/index.html`).

```bash
vercel --prod
```
