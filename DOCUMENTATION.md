# GameWota Dashboard — Feature Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Setup & Configuration](#4-setup--configuration)
5. [Authentication & Session Management](#5-authentication--session-management)
   - [Login](#51-login)
   - [Forgot Password / Password Reset](#52-forgot-password--password-reset)
   - [Email Verification](#53-email-verification)
   - [Session Restoration](#54-session-restoration)
6. [Navigation & Sidebar](#6-navigation--sidebar)
7. [Management Features](#7-management-features)
   - [Users](#71-users)
   - [Roles](#72-roles)
   - [Permissions](#73-permissions)
8. [Content Features](#8-content-features)
   - [Songs](#81-songs)
   - [Beatmap Editor](#82-beatmap-editor)
   - [Cards](#83-cards)
   - [Card Variants](#84-card-variants)
   - [Gacha Packs](#85-gacha-packs)
   - [Rarities](#86-rarities)
   - [Quotes](#87-quotes)
   - [Elements](#88-elements)
   - [Members](#89-members)
   - [Assets](#810-assets)
   - [Events](#811-events)
9. [Shop Features](#9-shop-features)
   - [Shop Items](#91-shop-items)
   - [Game Item Types](#92-game-item-types)
   - [Game Items](#93-game-items)
   - [Currencies](#94-currencies)
   - [Shop History (Transactions)](#95-shop-history-transactions)
10. [System Features](#10-system-features)
    - [News](#101-news)
    - [News Types](#102-news-types)
    - [Banners](#103-banners)
    - [Banner Types](#104-banner-types)
    - [Transaction Log](#105-transaction-log)
11. [Shared Components](#11-shared-components)
12. [Custom Hooks](#12-custom-hooks)
13. [Helper Utilities](#13-helper-utilities)
14. [Redux State Management](#14-redux-state-management)
15. [Data Validation (Zod)](#15-data-validation-zod)
16. [API Integration](#16-api-integration)
17. [Role-Based Access Control (RBAC)](#17-role-based-access-control-rbac)
18. [Development Guide](#18-development-guide)

---

## 1. Project Overview

**GameWota Dashboard** is a React-based admin dashboard for the Rythm Game platform. It provides a comprehensive management interface for administrators and operators to manage:

- Users, roles, and permissions
- Game content (cards, songs, quotes, events)
- Shop catalog and purchase history
- News and banners
- System assets and configuration

**Live Deployment:** https://gamewota.github.io/dashboard  
**Base Path:** `/dashboard/` (GitHub Pages)

Access is restricted to users who hold at least one non-`user` role. Regular game players cannot log into the dashboard.

---

## 2. Tech Stack

| Category | Library / Tool | Version |
|---|---|---|
| Language | TypeScript | 5.8 |
| UI Framework | React | 19 |
| Build Tool | Vite | 6 |
| State Management | Redux Toolkit + React-Redux | 2.8 / 9.2 |
| Routing | React Router DOM | 7.6 |
| Styling | Tailwind CSS + @tailwindcss/vite | 4.1 |
| Component Library | DaisyUI | 5 |
| HTTP Client | Axios | 1.9 |
| Schema Validation | Zod | 4.1 |
| Auth Utilities | jwt-decode | 4.0 |
| XSS Sanitization | DOMPurify | 3.0 |
| Rich Text Editor | react-simple-wysiwyg | 3.4 |
| Beatmap Engine | @gamewota/beatmap-editor | internal |
| Linting | ESLint 9 + typescript-eslint | 9 / 8.30 |

**DaisyUI Theme:** `bumblebee` (applied globally via `data-theme` attribute in `App.tsx`).

---

## 3. Project Structure

```
dashboard/
├── src/
│   ├── app/                     # (none — store and routing live in store/ and App.tsx)
│   ├── components/              # Reusable UI components
│   ├── features/                # Redux slices and async thunks (one folder per domain)
│   │   ├── auth/
│   │   ├── assets/
│   │   ├── assetTypes/
│   │   ├── banners/
│   │   ├── bannerTypes/
│   │   ├── cards/               # cardSlice, cardVariantSlice, gachaPackSlice, raritySlice
│   │   ├── currencies/
│   │   ├── elements/
│   │   ├── events/
│   │   ├── gameItems/
│   │   ├── gameItemsType/
│   │   ├── members/
│   │   ├── news/
│   │   ├── newsType/
│   │   ├── permissions/
│   │   ├── quotes/
│   │   ├── roles/
│   │   ├── shopItems/
│   │   ├── shopTransactions/
│   │   ├── songs/
│   │   ├── transactionLog/
│   │   └── users/
│   ├── helpers/                 # Pure utility functions
│   │   ├── constants.ts         # VITE_API_BASE_URL export
│   │   ├── getAuthHeader.ts     # Bearer token helper
│   │   ├── handleThunkError.ts  # Thunk error normalizer
│   │   ├── sanitizeHtml.ts      # DOMPurify wrapper + stripHtml
│   │   ├── uploadAsset.ts       # Presigned URL upload flow
│   │   └── validateApi.ts       # Zod validation wrapper for thunks
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   └── useToast.tsx
│   ├── lib/
│   │   └── schemas/             # Zod schemas + inferred TypeScript types
│   ├── pages/                   # Route-level components
│   ├── store/
│   │   └── index.ts             # Redux configureStore with all reducers
│   ├── styles/
│   ├── App.tsx                  # Root component — routing + theme
│   ├── main.tsx                 # Entry point — Redux Provider + session restore
│   └── index.css                # Global CSS (@import "tailwindcss")
├── public/                      # Static assets (images, SFX)
├── index.html
├── vite.config.ts
└── package.json
```

---

## 4. Setup & Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://your-api-server.example.com
```

`VITE_API_BASE_URL` is the only required environment variable. It is referenced throughout all API calls via `src/helpers/constants.ts`.

### Installation & Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type-check without building
npx tsc --noEmit

# Lint
npm run lint

# Production build
npm run build

# Preview production build locally
npm run preview
```

### Build Output

The production build outputs to `dist/`. The Vite base is set to `/dashboard/` to match GitHub Pages deployment.

---

## 5. Authentication & Session Management

### 5.1 Login

**Route:** `/dashboard/`  
**File:** `src/pages/Home.tsx`, `src/features/auth/authSlice.ts`

The login form is shown at the root dashboard URL when no authenticated user is in the Redux store. After a successful login the same route shows a welcome message.

**Flow:**

1. User submits email + password.
2. The `login` async thunk (`createAsyncThunk`) POSTs credentials to `POST /users/signin`.
3. The API response is validated with `AuthResponseSchema` (Zod).
4. A **dashboard-only eligibility check** runs on the frontend: the decoded user must have at least one role other than `"user"`. If not, login is rejected with the message `"User is not eligible to login"`.
5. On success the JWT is stored in `localStorage` under the key `"token"` and the Redux auth state is populated.
6. The `Sidebar` is rendered once `auth.user` is truthy.

**Auth State Shape:**

```ts
interface AuthState {
  message: string | null;
  token: string | null;       // raw JWT
  user: AuthUser | null;      // decoded from JWT
  loading: boolean;
  error: string | null;
}
```

**Logout:** Clears `token` and `user` from `localStorage` and resets all auth state. Triggered via the Logout button in the Sidebar.

---

### 5.2 Forgot Password / Password Reset

**Route:** `/dashboard/forgot-password`  
**File:** `src/pages/ForgotPassword.tsx`

The page operates in two modes depending on whether a `?token=` query parameter is present.

**Mode 1 — Request reset link (no token):**
- User enters their registered email address.
- POSTs to `POST /users/reset-password` with `{ email }`.
- API sends a magic link to the user's email.

**Mode 2 — Confirm new password (token present):**
- On load, the token is verified via `GET /users/forgot-password?token=<value>`.
- If valid, the user fills in email, new password, and password confirmation.
- POSTs to `POST /users/forgot-password` with `{ token, password, email }`.
- On success, the user is shown a success toast and redirected to the login page after 3 seconds.

---

### 5.3 Email Verification

**Routes:**  
- `/dashboard/verify` — `src/pages/VerifyUser.tsx`  
- `/dashboard/resend-verify` — `src/pages/ResendVerification.tsx`

These pages handle the email verification flow initiated when a new account is created.

- **VerifyUser:** Consumes a `?token=` query parameter to activate the account.
- **ResendVerification:** Lets a user request a fresh verification email by entering their email address.

---

### 5.4 Session Restoration

**File:** `src/main.tsx`

On every page load, the application automatically restores the session without making an API call:

1. The JWT is read from `localStorage`.
2. `jwtDecode` extracts `id`, `username`, `email`, and `roles` from the token payload.
3. The `auth/login/fulfilled` action is dispatched directly with the decoded user object.
4. If decoding fails (invalid / expired token), `logout()` is dispatched and the token is removed.

This means the dashboard is immediately usable without a loading spinner for returning users.

---

## 6. Navigation & Sidebar

**File:** `src/components/Sidebar.tsx`, `src/components/sidebarConfig.tsx`

The sidebar is a DaisyUI drawer that slides in from the left. It is only rendered when `auth.user` is truthy.

### Menu Structure

The sidebar menu is defined in `sidebarConfig.tsx` as a tree of `MenuItem` objects:

| Section | Items |
|---|---|
| **Management** | Users, Roles, Permissions |
| **Content** | Songs, Quotes, Cards (→ Card Variants, Gacha Packs), Elements, Assets, Events |
| **Shop** | Shop Items, Game Item Types, Game Items, Shop History |
| **System** | News, News Types, Banner Types, Banners, Transaction Log |

### Permission-Filtered Menu

Each `MenuItem` can carry an optional `permission` string. The sidebar calculates which menu items to display at render time:

```ts
function isItemVisible(item: MenuItem, hasPerm: (p?: string) => boolean): boolean {
  if (item.permission && !hasPerm(item.permission)) return false
  if (!item.children) return true
  return item.children.some((c) => isItemVisible(c, hasPerm))
}
```

A group is only visible if at least one child inside it is visible. Items without a `permission` field are always shown.

### Responsive Behaviour

- A hamburger button is always visible to toggle the drawer.
- The drawer overlay closes the sidebar when clicked.
- Navigation to any route automatically closes the sidebar (via a `useEffect` watching `location.pathname`).

---

## 7. Management Features

### 7.1 Users

**Route:** `/dashboard/users`  
**Files:** `src/pages/User.tsx`, `src/pages/userColumns.tsx`, `src/features/users/userSlice.ts`  
**Required Permission:** `user.view`

Lists all registered game users in a scrollable `DataTable`. Each row shows user details and offers management actions.

**Available Actions:**

| Action | Permission Required | Description |
|---|---|---|
| View users | `user.view` | See the list (sidebar visibility gate) |
| Ban user | `user.ban` | Set a temporary ban for N days |
| Delete user | — | Permanently remove the user account |
| Assign role | — | Add a role to a user via a dropdown |
| Remove role | — | Remove a role from a user |

**Ban Flow:**
1. Click **Ban** on a user row → "Ban User" modal opens (enter number of days).
2. Clicking "Ban User" in the modal transitions to a confirmation modal.
3. Confirming dispatches `banUser({ userId, days })` → API call → list refreshed.

**Role Management:**  
Each user row has an inline role editor backed by the `roles` slice. Adding or removing a role dispatches `assignRoles` / `deleteUserRoles` and then updates the local Redux state with `updateUserRoles` to keep the UI in sync without a full refetch.

---

### 7.2 Roles

**Route:** `/dashboard/role`  
**Files:** `src/pages/Role.tsx`, `src/features/roles/roleSlice.ts`  
**Required Permission:** `role.view`

Displays all roles and their associated permissions in a `DataTable`. Each row includes an inline `MultiSelect` component for adding or removing permissions from the role without leaving the page.

**Actions:**
- **Add permission:** Select from the list of available permissions → dispatches `assignPermissionToRole`.
- **Remove permission:** Deselect a permission → dispatches `removePermissionFromRole`.

Both actions refresh the roles list from the API after completion.

---

### 7.3 Permissions

**Route:** `/dashboard/permissions`  
**Files:** `src/pages/Permissions.tsx`, `src/features/permissions/permissionsSlice.ts`  
**Required Permission:** `permission.view`

Full CRUD management of permission keys.

**Actions:**

| Action | Description |
|---|---|
| Create | Opens a modal; enter name and description → `POST /permissions` |
| Edit | Pre-populates the modal with existing data → `PUT /permissions/:id` |
| Delete | Inline delete button with immediate dispatch |

---

## 8. Content Features

### 8.1 Songs

**Route:** `/dashboard/songs`  
**Files:** `src/pages/Song.tsx`, `src/features/songs/songSlice.ts`

Lists all songs with cover art thumbnails and timestamps. Supports adding, viewing details, navigating to the beatmap editor, and deleting songs.

**Columns:** Row number, Song Title, Cover Art (thumbnail), Created At, Updated At, Actions.

**Actions per row:**

| Button | Behaviour |
|---|---|
| **Detail** | Opens `SongDetailModal` populated from `fetchSongById` |
| **Edit Beatmap** | Navigates to `/dashboard/:song_id/beatmap-editor` |
| **Delete** | Opens confirmation modal → dispatches `deleteSong` |

**Add Song:**  
The **"+ Add New Song"** button opens `AddSongModal`, which handles file upload and song creation. On success a toast with the song title is shown.

---

### 8.2 Beatmap Editor

**Routes:**  
- `/dashboard/beatmap-editor` — standalone editor with a default song  
- `/dashboard/:song_id/beatmap-editor` — editor for a specific song loaded from the API  
**File:** `src/pages/BeatmapEditor.tsx`, `src/components/BeatmapEditor/`  
**Library:** `@gamewota/beatmap-editor`

A full-featured in-browser rhythm game chart editor. When reached via a song-specific URL, the song metadata (title, audio URL, duration) and its existing beatmaps are fetched from the API.

**Key Capabilities:**

| Feature | Details |
|---|---|
| **Audio Playback** | Play / Pause / Stop using the browser's `<audio>` element |
| **Waveform Visualizer** | Visual representation of the decoded `AudioBuffer` with a scrubber |
| **BPM Detection** | Auto-detects BPM from the audio buffer on load (via `detectBPM`) |
| **Note Placement** | Click on the `EditorCanvas` to place tap or hold notes across 5 lanes |
| **Snap Grid** | Configurable snap divisions (1, 2, 4, 8, 16 per beat) with toggleable snap |
| **SFX Feedback** | Optional sound effect played on note placement |
| **Zoom** | Horizontal zoom from 25% to 100% via a viewport controller |
| **Offset Correction** | Adjustable audio offset in milliseconds |
| **Difficulty Selector** | Switch between existing beatmap difficulties for the loaded song |
| **Export** | Downloads a JSON file (`<SongName>_<difficulty>_beatmaps.json`) |
| **Import** | Reads a previously exported JSON; validates with `ImportedBeatmapSchema` (Zod) |
| **Keyboard Shortcut** | `Space` toggles play / pause |

**Export Format:**

```json
{
  "song_id": 1,
  "difficulty": "easy",
  "bpm": 180,
  "offset": 0,
  "charts": [
    {
      "uuid": "<uuid>",
      "laneCount": 5,
      "notes": [{ "uuid": "...", "songPos": 1234, "beat": 3.7, "label": "", "lane": 2 }],
      "links": [{ "uuid": "...", "startNote": {...}, "endNote": {...} }]
    }
  ]
}
```

Hold notes are represented as two regular notes connected by a `link` object sharing the same lane.

---

### 8.3 Cards

**Route:** `/dashboard/cards`  
**Files:** `src/pages/Card.tsx`, `src/features/cards/cardSlice.ts`

Lists all collectible cards with thumbnails and attribute summaries.

**Columns:** Row number, Card Name, Card Art (thumbnail), Element, Variant, Rarity.

**Add Card:** The **"Add Card"** button opens `AddCardModal`, which collects card details and uploads the artwork.

---

### 8.4 Card Variants

**Route:** `/dashboard/cards/variant`  
**Files:** `src/pages/CardVariant.tsx`, `src/features/cards/cardVariantSlice.ts`

Read-only table showing all card variant definitions (e.g., Normal, Foil, Special Edition).

**Columns:** ID, Variant Name, Variant Value.

---

### 8.5 Gacha Packs

**Routes:**  
- `/dashboard/cards/gacha-pack` — list all packs  
- `/dashboard/cards/gacha-pack/:id` — pack details  
**Files:** `src/pages/GachaPack.tsx`, `src/pages/GachaPackDetails.tsx`, `src/features/cards/gachaPackSlice.ts`

Manages gacha (loot box) packs that players can purchase.

**List Columns:** Row detail button, ID, Name, Price, Currency, Item.

**Create Pack:**  
The "Add Gacha" button opens a modal with:
- **Name** (required)
- **Price** (required)
- **Currency OR Game Item** — mutually exclusive selection dropdowns. Selecting one disables the other; a "Clear" button allows switching.

**Pack Details Page:**  
Navigated to via the "Detail" button. Shows pack-specific information and associated cards.

---

### 8.6 Rarities

**Route:** `/dashboard/rarity`  
**Files:** `src/pages/Rarity.tsx`, `src/features/cards/raritySlice.ts`

Read-only display of card rarity tiers and their gacha probability configuration.

**Columns:** Rarity Name, Probability, Base Multiplier, Incremental Multiplier.

---

### 8.7 Quotes

**Route:** `/dashboard/quotes`  
**Files:** `src/pages/Quote.tsx`, `src/features/quotes/quoteSlice.ts`

Lists game dialogue quotes displayed in-game. Supports adding new quotes.

**Columns:** Row number, Quote Text.

**Add Quote:** Clicking "Add Quotes" opens a DaisyUI `<dialog>` with a text input. On confirmation, dispatches `addQuote` and refreshes the list.

---

### 8.8 Elements

**Route:** `/dashboard/element`  
**Files:** `src/pages/Element.tsx`, `src/features/elements/elementSlice.ts`

Read-only table of in-game elemental types (e.g., Fire, Water, Wind) used to categorise cards and game items.

---

### 8.9 Members

**Route:** `/dashboard/member`  
**Files:** `src/pages/Member.tsx`, `src/features/members/membersSlice.ts`

Read-only display of idol group member profiles. Uses `moment.js` for date formatting.

**Columns:** Member Name, Stage Name, Profile URL, Birth Date, Blood Type, Zodiac, Height, Current Photo, Is Active, Created At, Updated At, Deleted At.

---

### 8.10 Assets

**Route:** `/dashboard/assets`  
**Files:** `src/pages/Assets.tsx`, `src/features/assets/assetsSlice.ts`

Browse all uploaded media assets. Asset type is auto-detected from the file extension:

| Extension | Type |
|---|---|
| png, jpg, jpeg, gif, webp, svg | `image` |
| mp3, wav, ogg, m4a | `audio` |
| mp4, webm, ogg | `video` |
| json | `json` |
| Other | `other` |

**Columns:** Row number, Preview (thumbnail for images; type label otherwise), Type, URL (opens in new tab), Created At, Updated At, Actions.

**Preview:** Clicking **"Preview"** opens the `AssetPreview` component, which renders the asset in-place (image, audio player, video player, or JSON viewer).

---

### 8.11 Events

**Routes:**  
- `/dashboard/events` — events list  
- `/dashboard/events/:id` — event detail  
**Files:** `src/pages/Events.tsx`, `src/pages/EventDetail.tsx`, `src/features/events/eventSlice.ts`

Manages time-limited in-game events.

**List Columns:** Row number, Name, Created At, Updated At, Actions (Detail / Edit / Delete).

**Permission-gated Actions:**

| Action | Permission |
|---|---|
| Create event | `events.create` |
| Edit event | `events.edit` |
| Delete event | `events.delete` |

**Event Detail Page:**  
Shows full event metadata (ID, name, timestamps). Provides Edit and Delete actions (same permission gates). After deletion, navigates back to the events list.

---

## 9. Shop Features

### 9.1 Shop Items

**Route:** `/dashboard/items`  
**Files:** `src/pages/Item.tsx`, `src/features/shopItems/shopItemsSlice.ts`

Manages purchasable items in the game shop.

**Columns:** Row number, Item Name, Type, Price, Currency, Description, Stock, Visible (toggle), Created At, Updated At, Deleted At.

**Visibility Toggle:** Each row has a checkbox (`toggle toggle-success`) that immediately dispatches `updateShopVisibility` to enable or disable the item in the storefront.

**Add Item:** Opens a DaisyUI `<dialog>` modal with fields:
- **Name** (text)
- **Type** — dropdown: `gacha_pack`, `diamond`, `stamina`
- **Price** (number)
- **Currency** — dropdown: `diamonds`, `real_money`
- **Description** (text)
- **Stock** (number)

---

### 9.2 Game Item Types

**Route:** `/dashboard/game-items-type`  
**Files:** `src/pages/GameItemsType.tsx`, `src/features/gameItemsType/gameItemsTypeSlice.ts`

Manages the category taxonomy for game items (e.g., Consumable, Equipment, Material). These types are referenced by individual game items.

---

### 9.3 Game Items

**Route:** `/dashboard/game-items`  
**Files:** `src/pages/GameItems.tsx`, `src/features/gameItems/gameItemsSlice.ts`

Full CRUD management for in-game items.

**Columns:** Row number, Name, Description, Tier, Asset ID, Element, Game Items Type, Created At, Updated At, Actions.

**Tier:** Integer 1–3, clamped on save.

**Permission-gated Actions:**

| Action | Permission |
|---|---|
| Create | `game_items.create` |
| Edit | `game_items.edit` |
| Delete | `game_items.delete` |

**Create / Edit Form (`GameItemForm` component):**
- Name, Description, Tier
- Element (dropdown from elements slice)
- Game Item Type (dropdown from gameItemsTypes slice)
- Asset file upload (uses the presigned upload flow; existing asset shown as preview in edit mode)

When editing, the current asset is loaded from the `assets` Redux slice by `asset_id` and displayed as a preview image.

---

### 9.4 Currencies

**Route:** `/dashboard/currency`  
**Files:** `src/pages/Currency.tsx`, `src/features/currencies/currencySlice.ts`

Read-only table of in-game currency definitions.

**Columns:** ID, Name, Code.

---

### 9.5 Shop History (Transactions)

**Route:** `/dashboard/shop-history`  
**Files:** `src/pages/ShopTransactions.tsx`, `src/features/shopTransactions/shopTransactionsSlice.ts`  
**Required Permission:** `logs.view`

Read-only table showing all completed shop purchase transactions.

**Columns:** Row number, Username, Item Name, Quantity, Total Price, Currency, Status, Remarks, Created At, Updated At, Deleted At.

---

## 10. System Features

### 10.1 News

**Routes:**  
- `/dashboard/news` — news list (optional `?category=` filter)  
- `/dashboard/news/:id` — news article detail  
**Files:** `src/pages/News.tsx`, `src/pages/NewsDetail.tsx`, `src/features/news/newsSlice.ts`  
**Required Permission (create):** `news.create`

Displays news articles as cards with header images, type badges, and content previews. Clicking an article navigates to the detail page.

**Create Article (modal):**
- **Title** (required)
- **Header Image URL** — manual input or file upload via the presigned asset flow
- **Type** — dropdown from the `newsTypes` slice (defaults to the first available type)
- **Content** — WYSIWYG rich text editor (`Wysiwyg` component)

Category filtering is server-side; passing `?category=<name>` in the URL filters the list before render.

**NewsDetail Page:** Renders the full HTML article body (sanitized with DOMPurify) along with edit and delete controls.

---

### 10.2 News Types

**Route:** `/dashboard/news-type`  
**Files:** `src/pages/NewsType.tsx`, `src/features/newsType/newsTypeSlice.ts`

Manages the category tags applied to news articles. Supports create, edit, and delete operations.

---

### 10.3 Banners

**Route:** `/dashboard/banners`  
**Files:** `src/pages/Banner.tsx`, `src/features/banners/bannerSlice.ts`  
**Required Permission:** `banners.view`

Manages promotional banners displayed in the game client (e.g., event announcements, gacha pack promotions). Supports full CRUD with a rich form that includes image upload.

---

### 10.4 Banner Types

**Route:** `/dashboard/banner-types`  
**Files:** `src/pages/BannerType.tsx`, `src/features/bannerTypes/bannerTypeSlice.ts`

Manages the category taxonomy for banners (e.g., Event, Gacha, Announcement).

**Permission-gated Actions:**

| Action | Permission |
|---|---|
| Create | `banner_type.create` |
| Edit | `banner_type.edit` |
| Delete | `banner_type.delete` |

All actions are confirmed through modal dialogs before dispatching.

---

### 10.5 Transaction Log

**Route:** `/dashboard/transaction-log`  
**Files:** `src/pages/TransactionLog.tsx`, `src/features/transactionLog/transactionLogSlice.ts`  
**Required Permission:** `logs.view`

Read-only audit log of all financial transaction state changes (status transitions with metadata).

**Columns:** Row number, Log ID, Transaction ID, Total Amount, MDR Rate, From Status, To Status, Remarks, Created At.

---

## 11. Shared Components

All shared components live in `src/components/`.

### `DataTable<T>`

A fully generic, type-safe table component used by almost every page.

```ts
type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey?: keyof T | ((row: T, index: number) => string | number);
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
};
```

- Shows a DaisyUI loading spinner while `loading` is true.
- Shows a red error message when `error` is set.
- Shows `emptyMessage` when `data` is empty.
- Headers are sticky (`sticky top-0 z-30`) for long lists.
- Supports both direct property accessors (`keyof T`) and custom render functions.

### `Modal`

A DaisyUI modal dialog with configurable title, body, and footer.

```ts
interface ModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}
```

### `Button`

A DaisyUI button wrapper with variant and size props.

**Variants:** `default`, `primary`, `secondary`, `accent`, `ghost`, `info`, `success`, `warning`, `error`  
**Sizes:** `xs`, `sm`, `md` (default), `lg`

### `Sidebar`

Permission-aware navigation drawer. See [Section 6](#6-navigation--sidebar).

### `Toast` / `useToast`

See [Custom Hooks — useToast](#usetoast).

### `Wysiwyg`

A thin wrapper around `react-simple-wysiwyg` used for rich-text content creation (news articles, etc.).

### `MultiSelect`

An inline multi-select component used by the Roles page to add/remove permissions. Renders the list of available options with checkboxes and fires `onAdd` / `onRemove` callbacks.

### `AssetPreview`

Renders a media preview based on asset type:
- **image** — `<img>` tag
- **audio** — HTML5 `<audio>` player
- **video** — HTML5 `<video>` player
- **json** — formatted `<pre>` block
- **other** — download link

### `GameItemForm`

Reusable form component shared by the create and edit modals on the Game Items page. Accepts a `form` state object and a setter, plus dropdown data for elements and game item types.

### `BeatmapEditor/` (sub-components)

| Component | Purpose |
|---|---|
| `Header` | Song selector / difficulty selector |
| `Controls` | Play/Pause/Stop, volume, zoom, snap, BPM, export/import |
| `AudioVisualizer` | Waveform + scrubber |
| `EditorCanvas` | Note grid for tap and hold placement |
| `Stats` | Note count, current time, duration summary |

### `Container`

A layout wrapper that provides consistent padding and centering.

### `ErrorFallback` / `LoadingFallback`

Standardised error boundary and loading state components used with `<ErrorBoundary>` and `<Suspense>`.

---

## 12. Custom Hooks

### `useAuth`

**File:** `src/hooks/useAuth.ts`

Returns the full auth Redux slice state: `{ user, token, loading, error, message }`.

```ts
const auth = useAuth();
if (auth.user) { /* logged in */ }
```

### `usePermissions` / `useHasPermission`

**File:** `src/hooks/usePermissions.ts`

```ts
// Returns true if the logged-in user holds the given permission string
const canBan = useHasPermission('user.ban');
```

Derives the flat permission list from `state.auth.user.roles[*].permissions`.

### `useToast`

**File:** `src/hooks/useToast.tsx`

Provides a `showToast(message, type)` function and a `<ToastContainer />` component that renders stacked toast notifications.

**Types:** `'success' | 'error' | 'warning' | 'info'`

```ts
const { showToast, ToastContainer } = useToast();
showToast('Saved successfully', 'success');
```

---

## 13. Helper Utilities

### `getAuthHeader`

**File:** `src/helpers/getAuthHeader.ts`

Returns the `Authorization: Bearer <token>` header object for Axios calls.

```ts
const header = getAuthHeader();
// => { Authorization: "Bearer eyJ..." } | {}
```

### `validateOrReject<T>`

**File:** `src/helpers/validateApi.ts`

Wraps Zod's `safeParse` for use inside `createAsyncThunk`. On validation failure, it calls `thunkAPI.rejectWithValue` with a human-readable error message listing all failing fields.

```ts
const data = validateOrReject<User>(UserSchema, response.data, thunkAPI);
```

### `uploadAssetWithPresigned`

**File:** `src/helpers/uploadAsset.ts`

Two-step presigned URL file upload:
1. POSTs `{ filename, contentType, asset_type_id }` to `POST /assets/generate-url` to obtain a presigned S3 URL.
2. PUTs the file binary directly to the presigned URL.
3. Returns the created `asset` object (including `id` and `assets_url`).

Accepted content types: `image/*`, `audio/*`, `video/*`, `application/json`.

### `sanitizeHtml` / `stripHtml`

**File:** `src/helpers/sanitizeHtml.ts`

- `sanitizeHtml(html)` — runs DOMPurify to remove XSS vectors from user-generated HTML before `dangerouslySetInnerHTML`.
- `stripHtml(html)` — strips all tags and returns plain text (used for article preview excerpts).

### `handleThunkError`

**File:** `src/helpers/handleThunkError.ts`

Normalises Axios errors and generic exceptions into a `string` suitable for `rejectWithValue`.

---

## 14. Redux State Management

### Store Configuration

**File:** `src/store/index.ts`

The store is created with `configureStore` from Redux Toolkit. All 26 domain reducers are registered here.

```ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Slice Inventory

| Store Key | Feature | Slice File |
|---|---|---|
| `auth` | Authentication | `features/auth/authSlice.ts` |
| `users` | User management | `features/users/userSlice.ts` |
| `roles` | Role management | `features/roles/roleSlice.ts` |
| `permissions` | Permission management | `features/permissions/permissionsSlice.ts` |
| `songs` | Song management | `features/songs/songSlice.ts` |
| `quotes` | Quote management | `features/quotes/quoteSlice.ts` |
| `cards` | Card management | `features/cards/cardSlice.ts` |
| `cardVariants` | Card variants | `features/cards/cardVariantSlice.ts` |
| `gachaPack` | Gacha packs | `features/cards/gachaPackSlice.ts` |
| `rarity` | Card rarities | `features/cards/raritySlice.ts` |
| `elements` | Game elements | `features/elements/elementSlice.ts` |
| `shopItems` | Shop items | `features/shopItems/shopItemsSlice.ts` |
| `shopTransactions` | Shop transactions | `features/shopTransactions/shopTransactionsSlice.ts` |
| `transactionsLog` | Transaction log | `features/transactionLog/transactionLogSlice.ts` |
| `gameItems` | Game items | `features/gameItems/gameItemsSlice.ts` |
| `gameItemsTypes` | Game item types | `features/gameItemsType/gameItemsTypeSlice.ts` |
| `assets` | Asset management | `features/assets/assetsSlice.ts` |
| `assetTypes` | Asset types | `features/assetTypes/assetTypeSlice.ts` |
| `news` | News articles | `features/news/newsSlice.ts` |
| `newsTypes` | News categories | `features/newsType/newsTypeSlice.ts` |
| `members` | Idol members | `features/members/membersSlice.ts` |
| `currency` | Currencies | `features/currencies/currencySlice.ts` |
| `events` | In-game events | `features/events/eventSlice.ts` |
| `bannerTypes` | Banner categories | `features/bannerTypes/bannerTypeSlice.ts` |
| `banners` | Banners | `features/banners/bannerSlice.ts` |

### Standard Slice Pattern

Every slice follows the same pattern:

```ts
// State interface
interface EntityState {
  data: Entity[] | null;
  loading: boolean;
  error: string | null;
}

// Async thunk
export const fetchEntities = createAsyncThunk<Entity[], void, { rejectValue: string }>(
  'entity/fetch',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/entities`, {
        headers: getAuthHeader(),
      });
      return validateOrReject<Entity[]>(EntitySchema.array(), response.data, thunkAPI);
    } catch (err) {
      return thunkAPI.rejectWithValue(handleThunkError(err));
    }
  }
);

// Slice
const entitySlice = createSlice({
  name: 'entity',
  initialState,
  reducers: { /* optional local reducers */ },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntities.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEntities.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; })
      .addCase(fetchEntities.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? 'Unknown error'; });
  },
});
```

The `news` slice uses a normalised entity adapter (`Record<string, NewsArticle>` + `ids: number[]`) for efficient lookup by ID.

---

## 15. Data Validation (Zod)

**Location:** `src/lib/schemas/`

All API responses are validated with Zod before being placed into the Redux store. This catches schema mismatches early and prevents rendering bugs from unexpected backend changes.

| Schema File | Validates |
|---|---|
| `auth.ts` | `AuthResponse`, `AuthUser` |
| `user.ts` | User entity |
| `role.ts` | Role entity |
| `permission.ts` | Permission entity |
| `song.ts` | Song, SongDetail, `ImportedBeatmapSchema` |
| `element.ts` | Element entity |
| `event.ts` | Event entity |
| `gameItem.ts` | Game item entity |
| `gameItemType.ts` | Game item type entity |
| `shopItem.ts` | Shop item entity |
| `asset.ts` | Asset entity |
| `assetType.ts` | Asset type entity |
| `news.ts` | News article |
| `newsType.ts` | News type entity |
| `banner.ts` | Banner entity |
| `bannerType.ts` | Banner type entity |
| `cardVariant.ts` | Card variant entity |

TypeScript types are derived directly from schemas using `z.infer<typeof Schema>`, ensuring type safety throughout the application without duplicating type definitions.

---

## 16. API Integration

### Base URL

Configured exclusively via `VITE_API_BASE_URL`. Never hardcoded.

```ts
// src/helpers/constants.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

### Authentication Header

Every authenticated request includes:

```
Authorization: Bearer <JWT>
```

The token is read from `localStorage` by `getAuthHeader()`.

### Key API Endpoints (inferred from thunks)

| Feature | Method | Path |
|---|---|---|
| Login | POST | `/users/signin` |
| Request password reset | POST | `/users/reset-password` |
| Verify reset token | GET | `/users/forgot-password?token=` |
| Reset password | POST | `/users/forgot-password` |
| List users | GET | `/users` |
| Ban user | POST/PATCH | `/users/ban` |
| Delete user | DELETE | `/users/:id` |
| Assign role to user | POST | `/roles/assign` |
| Remove role from user | DELETE | `/roles/delete-user-role` |
| List roles | GET | `/roles` |
| Assign permission to role | POST | `/permissions/assign` |
| Remove permission from role | DELETE | `/permissions/role` |
| List permissions | GET | `/permissions` |
| CRUD permissions | POST/PUT/DELETE | `/permissions` / `/permissions/:id` |
| List songs | GET | `/songs` |
| Get song by ID | GET | `/songs/:id` |
| Delete song | DELETE | `/songs/:id` |
| List cards | GET | `/cards` |
| List card variants | GET | `/cards/variants` |
| List gacha packs | GET | `/gacha-packs` |
| Create gacha pack | POST | `/gacha-packs` |
| List game items | GET | `/game-items` |
| CRUD game items | POST/PUT/DELETE | `/game-items` / `/game-items/:id` |
| List game item types | GET | `/game-items-type` |
| List shop items | GET | `/shop` |
| Add shop item | POST | `/shop` |
| Update shop visibility | PATCH | `/shop/:id` |
| List shop transactions | GET | `/shop/transactions` |
| List transaction log | GET | `/transactions/log` |
| List elements | GET | `/elements` |
| List rarities | GET | `/rarities` |
| List currencies | GET | `/currencies` |
| List assets | GET | `/assets` |
| Generate presigned URL | POST | `/assets/generate-url` |
| List news | GET | `/news` |
| Create news | POST | `/news` |
| List news types | GET | `/news-type` |
| List events | GET | `/events` |
| CRUD events | POST/PATCH/DELETE | `/events` / `/events/:id` |
| List banner types | GET | `/banner-types` |
| CRUD banner types | POST/PUT/DELETE | `/banner-types` / `/banner-types/:id` |
| List banners | GET | `/banners` |
| List members | GET | `/members` |

---

## 17. Role-Based Access Control (RBAC)

The dashboard enforces RBAC at multiple layers.

### Dashboard Access Gate

Only users with at least one role other than `"user"` can log in. This is checked in `authSlice.ts` after the API returns:

```ts
const hasOtherRoles = auth.user.roles.some((r) => r.role !== 'user');
if (!hasOtherRoles) {
  return thunkAPI.rejectWithValue('User is not eligible to login');
}
```

### Sidebar Visibility

Menu items tagged with a `permission` string are hidden from the sidebar for users who do not hold that permission. Group headers are also hidden when all their children are hidden.

### In-Page UI Gating

Individual buttons and actions are guarded with `useHasPermission`:

```ts
const canDelete = useHasPermission('events.delete');
// ...
{canDelete && <Button variant="error" onClick={handleDelete}>Delete</Button>}
```

### Known Permission Keys

| Permission Key | Controls |
|---|---|
| `user.view` | View users page |
| `user.ban` | Ban users button |
| `role.view` | View roles page |
| `permission.view` | View permissions page |
| `logs.view` | Shop History and Transaction Log pages |
| `news.create` | Create news button |
| `events.create` | Create event button |
| `events.edit` | Edit event button |
| `events.delete` | Delete event button |
| `game_items.create` | Create game item button |
| `game_items.edit` | Edit game item button |
| `game_items.delete` | Delete game item button |
| `banner_type.create` | Create banner type button |
| `banner_type.edit` | Edit banner type button |
| `banner_type.delete` | Delete banner type button |
| `banners.view` | View banners page |

---

## 18. Development Guide

### Adding a New Feature

Follow these steps to add a new managed entity to the dashboard:

1. **Define the Zod schema**  
   Create `src/lib/schemas/<entity>.ts` with `z.object(...)` and export the inferred type.

2. **Create the Redux slice**  
   Create `src/features/<entity>/<entity>Slice.ts` following the standard pattern (state interface, thunks, slice). Register the reducer in `src/store/index.ts`.

3. **Create the page component**  
   Create `src/pages/<Entity>.tsx`. Use `DataTable` for listing, `Modal` for forms, `useToast` for feedback, and `useHasPermission` to gate destructive actions.

4. **Add the route**  
   Add a `<Route>` entry in `src/App.tsx`.

5. **Update the sidebar**  
   Add a `MenuItem` entry in `src/components/sidebarConfig.tsx` with an appropriate `permission` if access should be restricted.

### Code Style Reminders

- Do not use `any`. Use explicit types or `unknown`.
- Do not call Axios directly in components — use thunks.
- Always validate API responses with `validateOrReject` + a Zod schema.
- Sanitize all user-generated HTML with `sanitizeHtml` before rendering.
- Use `useHasPermission` instead of manual role string comparisons.
- Follow the existing file naming conventions: PascalCase for components and pages, camelCase for slices and hooks.
