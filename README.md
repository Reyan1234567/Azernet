# Zaha – Mobile ERP for Small Businesses

Zaha (internally "Azernet") is an Expo-powered React Native application that helps small businesses track inventory, partners, orders, sales, purchases, withdrawals, and cash movements from a single mobile dashboard. It ships with opinionated UI components, rich forms, Supabase-backed data, and Expo Router navigation tailored for production deployments.

![Zaha preview](https://github.com/user-attachments/assets/placeholder-zaha.png)

## Table of Contents

1. [Key Features](#key-features)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Project Structure](#project-structure)
4. [App Workflows](#app-workflows)
5. [Supabase Requirements](#supabase-requirements)
6. [Environment Variables](#environment-variables)
7. [Getting Started](#getting-started)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

## Key Features

- **Multi-business management** – Switch between businesses via `BusinessProvider`, persist business IDs in secure storage, and scope all queries by the active business.
- **Dashboard analytics** – Date-filtered revenue, orders, profitability, and inventory widgets rendered with custom cards and charts on the home tab.
- **Inventory & catalog** – Full CRUD for items, including measurement filtering, soft deletes, and Supabase RPC-backed stock tracking (`get_invetory_info`).
- **Partners & contacts** – Manage suppliers/customers, navigate to dedicated partner detail pages, and reuse partner data across orders and transactions.
- **Sales, purchases, and orders** – Unified flow to create orders, mark them as purchased or delivered, reverse transactions, and track unpaid amounts with RPC helpers (`markaspurchased`, `reverseordertopending`, etc.).
- **Cash management** – Fund/withdraw business cash, track ledger entries, and surface outstanding balances.
- **Auth & profile** – Supabase Auth (OTP + Google OAuth) with Expo Secure Store persistence plus profile fetching/editing via `authContext`.
- **Polished UI system** – Custom design system (buttons, cards, tabs, date pickers, pickers, toasts, overlays) with light/dark themes, haptics, and motion via Reanimated.
- **Offline-friendly data layer** – TanStack Query cache wrapping Supabase RPC calls, optimistic UX, and invalidation helpers for orders, purchases, sales, and inventory.

## Architecture & Tech Stack

| Layer | Details |
| --- | --- |
| **Framework** | Expo SDK 54 with Expo Router v2 for nested layouts and typed routes (@`app/(app)/(root)/`). |
| **UI / UX** | Custom UI kit under `components/` + `theme/`, Lucide icons, Expo Haptics, Expo Image, Blur, Symbols, and Reanimated animations. |
| **State** | React Context for auth (`context/authContext.tsx`) and business selection (`context/businessContext.tsx`), React Hook Form + Zod for input validation. |
| **Networking & Data** | Supabase JS client (secure store adapter) + RPC endpoints, TanStack Query for fetching/mutations, usehooks utilities. |
| **Auth** | Supabase email/OTP + Google Sign-In (`@react-native-google-signin/google-signin`) configured in `AuthProvider`. |
| **Tooling** | TypeScript, ESLint (Expo config), Reactotron for debugging, Expo Go/EAS for builds. |

## Project Structure

```
.
├── app/
│   ├── login.tsx                # Google/Supabase auth entry
│   └── (app)/(root)/
│       ├── _layout.tsx          # Authenticated stack + QueryClient + providers
│       ├── (tabs)/              # Bottom tabs: dashboard, business, orders, sales, purchases
│       ├── create* screens      # Item, partner, order, transaction flows
│       ├── purchaseOrder/, saleOrder/  # Detail views
│       └── profile.tsx          # User profile & settings
├── components/                  # UI system, dialogs, forms, cards, loaders
├── context/                     # authContext + businessContext providers
├── service/                     # Supabase data layer (items, partners, orders, sales, etc.)
├── theme/                       # Colors, typography, theme provider
├── hooks/                       # Color hooks, form utilities, custom logic
├── lib/supabase.ts              # Supabase client configured with SecureStore
├── utils/                       # Helpers (dates, currency formatters, etc.)
├── app.json / expo-env.d.ts     # Expo app config
├── package.json                 # Scripts & dependencies
└── README.md                    # You are here
```

## App Workflows

1. **Authentication** – `AuthProvider` initializes Supabase session, listens to auth state changes, fetches profile data, and exposes `signInWithGoogle`, `phoneSignIn`, OTP verification, and `signOut` hooks. Google Sign-In is configured with the Expo Public web client ID. (@`context/authContext.tsx`)
2. **Business selection** – `BusinessProvider` loads available businesses via `getBusinessIds`, restores persisted ID from secure storage, and provides `setBusiness` to scope all downstream queries. (@`context/businessContext.tsx`)
3. **Dashboard tab (`(tabs)/index.tsx`)** – Combines dashboard stats (`service/dashboard.ts`) and inventory snapshots (`service/item.ts#getInvetoryInfo`) with TanStack Query, date pickers, and custom cards.
4. **Transactions (purchases/sales/orders)** – Screen components call into the corresponding `service/*.ts` modules which in turn wrap Supabase tables and RPC routines for state transitions, reversals, and validations.
5. **Profile** – Fetches/updates Supabase profile data and allows sign-out with confirmation dialogs and a shared loading overlay pattern.

## Supabase Requirements

The API layer assumes the following:

- Tables: `businesses`, `items`, `partners`, `orders`, `purchases`, `sales`, `business_cash`, `transactions`, and related lookup tables with `is_deleted` soft-delete flags.
- RPC functions used by the app (must exist in your Supabase project):
  - `get_invetory_info`
  - `getallorders`
  - `markaspurchased`
  - `markasdelivered`
  - `reverseordertopending`
  - `reverseordertopurchased`
- RLS policies should allow the authenticated Supabase user to access only their business data.
- Storage buckets (optional) for profile pictures if you extend profile uploads.

> ℹ️ Check the implementations under `service/` to ensure your Supabase schema and RPC payloads match expectations before running the app.

## Environment Variables

Create an `.env` file at the project root (Expo automatically exposes `EXPO_PUBLIC_*` vars):

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-oauth-client-id
```

- **Supabase URL/key** – Found in Supabase project settings → API.
- **Google client ID** – Use the web client ID configured for Expo (OAuth consent screen + Android/iOS credentials).

## Getting Started

### Prerequisites

- Node.js ≥ 18 and npm (or pnpm/yarn if you prefer).
- Expo CLI (`npm install -g expo-cli`) or the new `npx expo` workflow.
- Supabase project with the schema described above.

### Installation

```bash
git clone <repo-url>
cd zaha
npm install

# Set environment variables (.env) before running the app
```

### Run the app

```bash
# Start Metro + Expo devtools
npm run start

# Platform-specific helpers
npm run android   # Build & install on Android emulator/device
npm run ios       # Build & install on iOS simulator (macOS only)
npm run web       # Run Expo Router in the browser
```

### Linting & cleanup

```bash
npm run lint
```

## Common Tasks

| Task | How |
| --- | --- |
| **Select another business** | Use UI controls backed by `BusinessProvider.setBusiness` (persists via Expo Secure Store). |
| **Create an order** | Navigate to “Create Order”, fill partner/item/quantity, submit → `service/orders.ts#createOrder`. |
| **Mark order as purchased/delivered** | Actions trigger RPC calls (`markaspurchased`, `markasdelivered`) and invalidate `orders`, `purchases`, `sales` queries. |
| **Reverse a sale/purchase** | AlertDialog + LoadingOverlay confirms reversal, hitting `reverseordertopending`/`reverseordertopurchased`. |
| **Fund/withdraw cash** | `FundBusiness` and withdraw screens call `service/business_cash.ts` helpers to record ledger entries. |
| **Update profile** | Use profile screen; data flows through `AuthProvider.refetchProfile`. |

## Troubleshooting

1. **Google sign-in stuck at "In progress"** – Ensure you called `GoogleSignin.configure` with the correct `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (already wired inside `AuthProvider`). Clear Expo Go cache if switching accounts.
2. **Supabase errors about missing RPC** – Confirm the stored procedures listed above exist and accept the same arguments defined in `service/*.ts` files. Names are case-sensitive.
3. **Business data not loading** – Check that `business_id` is persisted in Secure Store and that the active user owns at least one business (see `getBusinessIds`). Delete the `businessId` key from Secure Store to reset selection.
4. **Metro bundler issues** – Run `npx expo start -c` to clear caches, or use `npm run reset-project` (see `scripts/reset-project.js`).
5. **React Query cache not updating** – Make sure query keys include `businessId` and `selectedDate`. Invalidate affected keys after mutations (`orders`, `purchases`, `sales`, `dashboard`).

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feature/<name>`
2. Follow the established UI patterns (LoadingOverlay + AlertDialog for destructive actions, TanStack Query for data fetching).
3. Run `npm run lint` before opening a PR.
4. Submit a pull request describing the change, screenshots for UI updates, and Supabase migration notes if applicable.

## License

Specify your license of choice (MIT, Apache-2.0, etc.) or keep the repository private until you are ready to publish.

---

Built with ❤️ using Expo, React Native, and Supabase.
