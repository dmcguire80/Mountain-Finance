# Mountain Finance

Investment portfolio tracker with multi-account support, real-time sync, and interactive charts.

**Live:** https://mountain.thorshome.xyz

## Features

- Multi-account portfolio tracking (401k, IRA, brokerage, etc.)
- Interactive charts with time-range filters (1M, 3M, 6M, YTD, 1Y, 3Y, 5Y, Max, Latest)
- CSV import with flexible date/currency parsing and auto-account creation
- JSON backup and restore
- Password reset via email
- Dark mode (default) with light mode option
- Email/password authentication
- Real-time data sync via Firestore

## Tech Stack

React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Firebase (Auth + Firestore), Recharts

## Getting Started

```bash
git clone https://github.com/dmcguire80/Mountain-Finance.git
cd Mountain-Finance
npm install
cp .env.example .env   # Fill in Firebase credentials (see FIREBASE_SETUP.md)
npm run dev
```

## Deployment

Push to `main` triggers CI (lint, type-check, format-check, build) and auto-deploys to Firebase Hosting.

Manual deploy: `npm run build && firebase deploy`

## License

Private
