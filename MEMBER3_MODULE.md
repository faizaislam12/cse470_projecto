# GreenLoop — Member 3: Rewards & User Engagement Module

**Scope:** Features 11–15 — EcoPoints Reward System, Reward Redemption, Environmental Impact Dashboard, Personal Recycling Goals, Digital Recycling Certificate

**Stack:** `backend/` (Express + Mongoose + JWT auth) + `frontend/` (Create React App + `react-router-dom`) — the original SRS scaffold, kept separate from the parallel Vite/Firebase/`zap-shift-server` stack used by Member 4's Admin & Business module.

---

## 1. What this module does

This module is the platform's motivation layer: it turns recycling activity that happens elsewhere in the app (marketplace transactions) into points, rewards, visible environmental impact, personal goals, and shareable proof of achievement.

| # | Feature | Status | Page |
|---|---------|--------|------|
| 11 | EcoPoints Reward System | Pre-existing, already working | [EcoPoints.jsx](frontend/src/pages/EcoPoints.jsx) |
| 12 | Reward Redemption | Pre-existing, already working | [RewardRedemption.jsx](frontend/src/pages/RewardRedemption.jsx), [AdminRewards.jsx](frontend/src/pages/AdminRewards.jsx) (admin) |
| 13 | Environmental Impact Dashboard | Built this session | [ImpactDashboard.jsx](frontend/src/pages/ImpactDashboard.jsx) |
| 14 | Personal Recycling Goals | Built this session | [Goals.jsx](frontend/src/pages/Goals.jsx) |
| 15 | Digital Recycling Certificate | Built this session | [Certificates.jsx](frontend/src/pages/Certificates.jsx), [CertificateView.jsx](frontend/src/pages/CertificateView.jsx) |

Features 11 and 12 were found already fully implemented (models, controllers, routes, and wired-up pages) when this module's work began — so the actual build effort was 13–15, designed to plug into that existing data rather than duplicate it.

---

## 2. How the features work and connect

Every feature in this module is a different **lens on the same underlying event**: a completed marketplace `Transaction` (owned by the Marketplace/Transactions member, not this module).

```
Transaction (status: Completed)
  { weight, category, pointsEarned, seller, buyer }
         │
         │  read by every feature below — nothing here writes back to Transaction
         ▼
┌────────────────────────────────────────────┐
│ backend/utils/impactCalculator.js           │  single shared aggregation:
│ getUserImpactStats(userId, {from,to,cat})   │  totalWeight, totalPoints,
└───────────────────┬──────────────────────────┘  categoryBreakdown, monthlyTrend
                     │
   ┌─────────────────┼──────────────────────┬───────────────────────┐
   ▼                 ▼                      ▼                       ▼
EcoPoints (11)   Impact Dashboard (13)  Recycling Goals (14)   Certificates (15)
balance + history CO2/water/trees from  progress = stats       auto-issued when
+ leaderboard     totalWeight + a       scoped to the goal's   totalWeight crosses
                   category/month view  date range (+ category) a milestone (10/50/
                                                                 100/250/500/1000 kg)
         │
         ▼
Reward Redemption (12)
spends the EcoPoints balance on catalog items an admin manages
```

**Design choice — compute on read, not on write.** `ecoPointsController.getMyEcoPoints` already computes a user's balance/history by aggregating `Transaction` documents live, rather than maintaining a running counter that something has to update. Features 13–15 follow the same pattern: `impactCalculator.js` extracts that aggregation into one reusable helper, and Goals/Certificates recompute their progress/eligibility every time they're read. The one exception is EcoPoints' running `User.ecoPoints` balance itself, which is incremented once when a transaction completes (in `transactionController.updateTransactionStatus`) and then spent by Redemption — that part was already built.

This choice means **feature 13, 14, and 15 required zero changes to any file owned by another member** (`transactionController.js`, `marketplaceController.js`, `Listing.js`, etc.). A certificate is issued the next time the user opens `/certificates` after crossing a milestone, not via a hook fired at transaction-completion time.

---

## 3. Backend — API endpoints owned by this module

All routes use the shared `protect` / `authorize` middleware from `backend/middleware/authMiddleware.js` (built by the Auth module) and are mounted in `backend/server.js`.

**EcoPoints** (pre-existing — `backend/routes/ecoPointsRoutes.js`)
```
GET  /api/ecopoints/me            balance, history, category breakdown, averages
GET  /api/ecopoints/leaderboard   top 10 earners + current user's rank
GET  /api/ecopoints/rates         points-per-kg by category
```

**Rewards & Redemption** (pre-existing — `rewardRoutes.js`, `redemptionRoutes.js`)
```
GET    /api/rewards               browse active rewards
POST   /api/rewards               admin: create reward
PUT    /api/rewards/:id           admin: edit reward
DELETE /api/rewards/:id           admin: delete reward
POST   /api/redemptions           redeem a reward (deducts EcoPoints, generates a code)
GET    /api/redemptions/mine      a user's own redemption history
GET    /api/redemptions           admin: all redemptions
PUT    /api/redemptions/:id       admin: mark Fulfilled / Cancelled (refunds points on cancel)
```

**Environmental Impact** (new — `impactRoutes.js`)
```
GET /api/impact/me   totalWeight, co2SavedKg, waterSavedLiters, treesEquivalent,
                      categoryBreakdown (kg by material), monthlyTrend (last 6 months)
```

**Recycling Goals** (new — `goalRoutes.js`)
```
GET    /api/goals/mine   a user's goals, each with live current/percent/status
POST   /api/goals        create a goal { type, category?, targetValue, endDate }
DELETE /api/goals/:id    remove a goal (owner only)
```

**Digital Certificates** (new — `certificateRoutes.js`)
```
GET /api/certificates/mine   issues any newly-earned milestone certificates, then lists all
GET /api/certificates/:id    single certificate (ownership-checked; feeds the printable view)
```

---

## 4. Database models owned by this module

| Model | Purpose | Notable fields |
|---|---|---|
| `Reward` | Catalog of redeemable items (pre-existing) | `pointsCost`, `category`, `stock`, `isActive` |
| `Redemption` | A user's redemption of a reward (pre-existing) | `redemptionCode` (`GL-` + random hex), `status` |
| `Goal` (new) | A user's personal recycling target | `type` (`totalWeight`/`categoryWeight`/`ecoPoints`), `category?`, `targetValue`, `startDate`/`endDate`, `status` |
| `Certificate` (new) | An issued milestone certificate | `milestoneKg`, `title`, `tier`, `certificateCode` (`GL-CERT-` + random hex), `impactSnapshot` |

`User.ecoPoints` (Auth module's model) is the running balance both EcoPoints and Redemption read/write — this module doesn't add fields to `User` or `Category`, to avoid touching models owned by other members. Environmental conversion factors (CO2/water/trees per kg) live instead in `backend/utils/impactFactors.js` as a standalone config, since `Category` doesn't carry per-material factors.

`Certificate` has a unique compound index on `(user, milestoneKg)` so the same milestone can never be issued twice, even if two requests race.

---

## 5. Frontend routing

Added to `frontend/src/App.jsx`, inside the existing `<ProtectedRoute />` block, alongside the pre-existing `/ecopoints` and `/rewards` routes:
```
/impact              -> ImpactDashboard
/goals                -> Goals
/certificates         -> Certificates
/certificates/:id     -> CertificateView (printable)
```
Nav links for Impact, Goals, and Certificates were added to `frontend/src/components/Navbar.jsx` next to the existing EcoPoints/Rewards links.

---

## 6. Notable implementation details

- **No new dependencies.** This CRA frontend has no chart library installed (unlike Member 4's Vite app, which uses Recharts) — the Impact Dashboard's monthly trend and category breakdown reuse the existing `.eco-progress-bar` CSS pattern from `EcoPoints.jsx` instead of pulling in a charting package for a handful of bars.
- **Certificates need no PDF library.** `CertificateView.jsx` renders a styled full-page layout and calls `window.print()`; `@media print` rules in `index.css` hide the navbar/chrome so "Print → Save as PDF" produces a clean certificate.
- **Goal progress is time-scoped.** `impactCalculator.getUserImpactStats` accepts `{from, to, category}`, so a goal's progress is computed only from transactions within its own date range (and material, for category-specific goals) — a goal created today doesn't retroactively count last year's recycling.
- **Milestone issuance is idempotent.** `certificateController.checkAndIssueMilestones` diffs the milestones the user qualifies for against `Certificate` docs that already exist, inserts only the missing ones with `insertMany({ordered:false})`, and silently ignores duplicate-key errors (code `11000`) from the unique index — safe under concurrent requests.

---

*Documents the module as implemented this session — Features 11–12 were already in place; 13–15 were designed and built to read the same data without modifying any file owned by another member.*
