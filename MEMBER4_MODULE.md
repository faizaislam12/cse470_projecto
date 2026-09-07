# GreenLoop — Member 4: Admin & Business Module

**Owner:** AlMuqit369
**Scope:** Features 16–20 — Business Accounts, Collector Performance Dashboard, Community Recycling Campaigns, Notification Center, Admin Analytics Dashboard

---

## 1. What this module does

This module gives the platform's **Admin** role a full back-office: it lets admins manage recycling businesses, track collector fleet performance with a leaderboard, run community recycling campaigns that households/businesses can join, push notifications, and view a single analytics dashboard summarizing the whole platform (users, waste collected, revenue, campaigns).

| # | Feature | Who uses it | Page |
|---|---------|-------------|------|
| 16 | Business Accounts | Admin manages, Business role self-serves profile | [BusinessAccounts.jsx](src/pages/business/BusinessAccounts.jsx), [AddBusiness.jsx](src/pages/business/AddBusiness.jsx), [BusinessDashboard.jsx](src/pages/business/BusinessDashboard.jsx) |
| 17 | Collector Performance Dashboard | Admin (fleet-wide), Collector (self view) | [CollectorPerformance.jsx](src/pages/Collector/CollectorPerformance.jsx), [MyPerformance.jsx](src/pages/Collector/MyPerformance.jsx) |
| 18 | Community Recycling Campaigns | Admin creates/manages, all roles can join | [Campaigns.jsx](src/pages/Campaign/Campaigns.jsx) (admin), [CampaignsPublic.jsx](src/pages/Campaign/CampaignsPublic.jsx) (public) |
| 19 | Notification Center | Admin sends, all roles receive | [NotificationCenter.jsx](src/pages/Notification/NotificationCenter.jsx) (admin), [MyNotifications.jsx](src/pages/Notification/MyNotifications.jsx) (user) |
| 20 | Admin Analytics Dashboard | Admin only | [AdminAnalytics.jsx](src/pages/Analytics/AdminAnalytics.jsx) |

---

## 2. Tech stack

**Frontend**
- React 19 + Vite 8 (build tool)
- React Router v8 (routing, nested layouts + role-guarded routes)
- Tailwind CSS v4 + daisyUI 5 (styling / component classes)
- **Recharts 3** — all charts (line, bar, pie/donut)
- **Framer Motion** — entrance animations, floating-leaf ambient effect
- **SweetAlert2** — success/error popups instead of browser alerts
- **react-icons** (Fa icon set)
- **react-hook-form** — form handling on other modules (shared)
- **Axios** — HTTP client (`axiosPublic` wrapper)
- Firebase Authentication (client-side login/register/session)

**Backend**
- Node.js + Express 5
- **MongoDB** (official `mongodb` driver, no Mongoose — raw collections + native aggregation pipelines)
- `cors`, `dotenv`
- Single-file REST API: [zap-shift-server/index.js](zap-shift-server/index.js)

**Database:** MongoDB Atlas, DNS resolved via Google DNS (`8.8.8.8`/`8.8.4.4`) to work around a broken local resolver.

---

## 3. Design system ("eco-dark")

A shared dark-green glassmorphism theme, defined once in [src/index.css](src/index.css) and reused across the whole app (not just this module):

- `.eco-dark` — page background: layered radial + linear dark-green gradient
- `.eco-glass` / `.eco-glass-strong` — frosted-glass translucent panels
- `.eco-gradient-text` / `.eco-gradient-btn` — green gradient text/buttons
- `.eco-input`, `.eco-table`, `.eco-muted`, `.eco-scrollbar` — form/table/utility overrides, including Tailwind-scoped daisyUI overrides (`.eco-dark .modal-box`, `.eco-dark .tabs-boxed`, etc.)
- `FloatingLeaves` component — ambient Framer Motion leaf particles used as page decoration
- Shared UI primitives in `src/components/ui/`: `StatCard` (animated stat tile), `GlassPanel` (glass card wrapper), `PageHeader` (title + icon + subtitle bar)

---

## 4. Backend — API endpoints owned by this module

All routes live in [zap-shift-server/index.js](zap-shift-server/index.js). No Mongoose models — plain MongoDB collections accessed via the native driver, with helper `createNotification()` for pushing in-app notifications.

**Businesses** (`businessesCollection`, `transactionsCollection`)
```
POST   /businesses                    create a business account
GET    /businesses                    list all (admin)
GET    /businesses/user/:userId       a business owner's own record
PATCH  /businesses/profile/:id        business self-edits its profile
PATCH  /businesses/:id                admin edits a business
DELETE /businesses/:id                admin removes a business
GET    /businesses/:id/transactions   a business's transaction history
POST   /transactions                  log a new transaction
```

**Collectors & Pickups** (`collectorsCollection`, `pickupsCollection`)
```
GET    /collectors                    list all collectors
POST   /collectors                    admin adds a collector
GET    /collectors/email/:email       self-service lookup (Collector role login link)
GET    /collectors/:id/stats          one collector's full stats (completed/pending/cancelled,
                                       successRate, totalWeight, totalEarnings, monthly earnings,
                                       waste-by-material breakdown, this-month totals)
GET    /collector-stats-overview      fleet-wide overview + leaderboard (sorted by completed pickups),
                                       each row carries its own successRate
POST   /pickups                       log a pickup (material, weight, earnings, status, date)
```
`successRate = completedPickups / totalAssignedPickups × 100`, per the project spec formula.

**Campaigns** (`campaignsCollection`, `campaignParticipantsCollection`)
```
GET    /campaigns                          list campaigns
POST   /campaigns                          admin creates a campaign
PATCH  /campaigns/:id                      admin edits a campaign
PATCH  /campaigns/:id/status               activate/close a campaign
DELETE /campaigns/:id                      remove a campaign
POST   /campaigns/:id/join                 a user joins a campaign
POST   /campaigns/:id/leave                a user leaves a campaign
GET    /campaigns/:id/participants         list participants
PATCH  /campaigns/:id/contribute           log a participant's weight contribution toward the target
```

**Notifications** (`notificationsCollection`)
```
GET    /notifications                      all notifications (admin)
POST   /notifications                      admin sends a notification
GET    /notifications/user/:userId         a user's own notifications
PATCH  /notifications/:id/read             mark one as read
PATCH  /notifications/read-all/:userId     mark all as read for a user
DELETE /notifications/:id                  delete a notification
```

**Admin Analytics** (aggregation only — no dedicated collection)
```
GET /admin-analytics
```
Runs MongoDB aggregation pipelines across `usersCollection`, `pickupsCollection`, `transactionsCollection`, `campaignsCollection`, `collectorsCollection`, `businessesCollection` to return:
- `totals` — users, collectors, businesses, totalWaste, completedPickups, cancelledPickups, transactions, ecoPointsIssued, activeCampaigns, revenue
- `topPerformers` — most active collector, most active business, most recycled material (via `$group` + `$sort` + `$limit 1` + `$lookup`)
- `userGrowth` — signups per month (line chart)
- `wasteByMaterial` — kg collected per material type (bar chart)
- `userDistribution` — role breakdown (pie chart)
- `transactionsByMonth` — transaction count per month (bar chart)
- `campaignPerformance` — target vs. collected weight per campaign (bar chart)

---

## 5. Database collections owned by this module

| Collection | Purpose |
|---|---|
| `businesses` | Business account profiles |
| `transactions` | Business ↔ platform financial transactions |
| `collectors` | Collector fleet roster (name, email, rating, status) |
| `pickups` | Individual pickup jobs (material, weight, earnings, status, date, `collectorId`) |
| `campaigns` | Community campaign definitions (title, target weight, current weight, dates, status) |
| `campaignParticipants` | Join table: who joined which campaign, their contribution |
| `notifications` | In-app notifications per user |

`Analytics` has no collection of its own — it's computed on demand by aggregating the collections above (plus `users`, owned by another member).

---

## 6. How a Collector's stats get linked to their login

Collectors are added by an admin with just a `name` + `email` (no Firebase `uid` at creation time). When a logged-in Collector opens **My Performance**, the frontend looks them up by `GET /collectors/email/:email` (matching their Firebase auth email) rather than by uid, then fetches `/collectors/:id/stats` for that record. This was a deliberate fix for the ownership gap between admin-created records and self-service login.

---

## 7. Frontend routing (role-gated)

Defined in [src/routes/router.jsx](src/routes/router.jsx), nested under a shared `DashboardLayout`:

```
/dashboard/businesses        -> AdminRoute -> BusinessAccounts
/dashboard/analytics         -> AdminRoute -> AdminAnalytics
/dashboard/campaigns         -> AdminRoute -> Campaigns (admin CRUD)
/dashboard/my-performance    -> RoleRoute(["Collector"]) -> MyPerformance
/dashboard/collector-performance -> AdminRoute -> CollectorPerformance
```
`AdminRoute` / `RoleRoute` in `src/routes/` check the logged-in user's role (fetched via `/users/:email`) before rendering — unauthorized roles get redirected.

---

## 8. Notable implementation details

- **Charts**: every chart uses Recharts `ResponsiveContainer` so it reflows with the glass panel; colors are theme-matched (`#34d399` emerald for "good" values, `#f87171` rose for "cancelled/bad" values).
- **Animations**: `StatCard` and `GlassPanel` fade+slide in on mount via Framer Motion, staggered with incremental `delay` props so dashboards animate in sequence rather than popping in all at once.
- **Currency**: Bangladeshi Taka (৳) formatting throughout revenue/earnings displays.
- **Notification bell**: a fixed top-right circular button (`NotificationBell.jsx`) shared across both the marketing `NavBar` and the dashboard `DashboardLayout`, polling unread count from `/notifications/user/:userId`.

---

*Generated for the project's Member 4 (Admin & Business Module) submission — reflects the codebase as of the current session.*
