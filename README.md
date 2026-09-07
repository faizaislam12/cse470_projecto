# GreenLoop — Team Merged Project (CSE 470)

A complete MERN-stack recycling-management platform for GreenLoop, merging the
work of all four team members into one codebase.

## Repository layout

| Folder | Stack | What it is |
|---|---|---|
| `backend/` | Node + Express 4 + Mongoose + JWT | REST API (port 5000) for core features |
| `frontend/` | Create React App (React 18) | Web UI for the REST API (port 3000) |
| `src/` | Vite + React 19 + Tailwind + daisyUI | Admin & Business dashboard UI (port 5173) |
| `public/` | — | Static assets for the Vite app |
| `zap-shift-server/` | Node + Express 5 + MongoDB driver | REST API (port 3000) for the Admin & Business module |
| `MEMBER3_MODULE.md` | — | Member 3 module documentation |
| `MEMBER4_MODULE.md` | — | Member 4 module documentation |

## Module ownership

| Feature | Routes | Implemented by |
|---|---|---|
| Auth, RBAC (5 roles), password reset | `/api/auth` | Base |
| Waste listings / marketplace | `/api/listings` | Member 1 (`nida`/`muqit`) |
| Material categories | `/api/categories` | Member 1 |
| Market prices | `/api/prices` | Member 1 |
| Transactions | `/api/transactions` | Member 1 |
| Feedback & ratings | `/api/feedback` | Member 1 |
| Offers & counter-offers | `/api/offers` | Member 2 (`fi`) |
| EcoPoints | `/api/ecopoints` | Member 3 |
| Rewards & redemptions | `/api/rewards`, `/api/redemptions` | Member 3 |
| Environmental impact dashboard | `/api/impact` | Member 3 (`adrita`) |
| Personal recycling goals | `/api/goals` | Member 3 |
| Digital recycling certificates | `/api/certificates` | Member 3 |
| Business accounts | `/businesses` (zap-shift-server) | Member 4 |
| Collector performance | `/collectors` (zap-shift-server) | Member 4 |
| Community campaigns | `/campaigns` (zap-shift-server) | Member 4 |
| Notification center | `/notifications` (zap-shift-server) | Member 4 |
| Admin analytics | `/admin-analytics` (zap-shift-server) | Member 4 |

## Running the REST API (`backend/` + `frontend/`)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT secrets
npm run dev            # http://localhost:5000
```

`MONGO_URI` must point to a MongoDB database (e.g. MongoDB Atlas). See the
`.env.example` comments for a working connection-string pattern.

### Frontend (CRA)

```bash
cd frontend
npm install
npm start              # http://localhost:3000
```

### Seeding

```bash
cd backend
npm run seed           # categories + market prices
node scripts/createAdmin.js      # admin@greenloop.com / password123
node scripts/seedRewards.js      # sample rewards
node scripts/seedTestData.js     # sample users/transactions for impact/goals/certificates
```

## Running the Admin & Business module (`src/` + `zap-shift-server/`)

```bash
cd zap-shift-server
npm install
# fill MONGO_URI in .env
npm start               # http://localhost:3000

cd ..
npm install
npm run dev             # http://localhost:5173
```

This module uses **Firebase Authentication** for login and the raw MongoDB
driver for its API. The shared "eco-dark" design system (Tailwind 4 + daisyUI)
is defined in `src/index.css`.

## API endpoint summary (REST API)

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Log in |
| POST | `/api/auth/logout` | Private | Clear refresh token cookie |
| POST | `/api/auth/refresh` | Public* | Get a new access token |
| GET | `/api/auth/me` | Private | Current user profile |
| GET | `/api/listings` | Public | Browse listings |
| GET | `/api/listings/my` | Private | My listings |
| POST | `/api/listings` | Private | Create listing |
| GET | `/api/categories` | Public | Material categories |
| GET | `/api/prices` | Public | Market prices |
| GET/POST | `/api/transactions` | Private | Transactions |
| POST | `/api/feedback` | Private | Leave feedback |
| POST | `/api/offers` | Private | Create an offer (collector) |
| PUT | `/api/offers/:id/accept` | Private | Accept an offer |
| POST | `/api/offers/:id/counter` | Private | Counter an offer |
| GET | `/api/ecopoints/me` | Private | EcoPoints balance |
| GET | `/api/rewards` | Public | Reward catalog |
| POST | `/api/redemptions` | Private | Redeem a reward |
| GET | `/api/impact/me` | Private | Impact dashboard data |
| GET/POST | `/api/goals` | Private | Personal goals |
| GET | `/api/certificates/mine` | Private | My certificates |
| GET | `/api/certificates/:id` | Private | Certificate detail |

\* requires a valid `refreshToken` cookie.