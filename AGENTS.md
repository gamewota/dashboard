# AGENTS.md - Codebase Guide for AI Agents

## 📋 Repository Overview

This is a **React-based admin dashboard** for the Rythm Game platform. It provides a comprehensive management interface for users, game content (cards, songs, quotes), shop items, transactions, roles/permissions, and news. The application is built with modern web technologies emphasizing type safety, state management, and role-based access control.

**Live Deployment:** https://gamewota.github.io/dashboard  
**Base Path:** `/dashboard/` (configured for GitHub Pages)

---

## 🛠️ Tech Stack

### Core Framework & Language
- **React 19** - UI framework with function components and hooks
- **TypeScript 5.8** - Type-safe JavaScript with strict mode enabled
- **Vite 6** - Build tool and dev server with Hot Module Replacement (HMR)

### State Management
- **Redux Toolkit 2.8** (`@reduxjs/toolkit`) - Modern Redux with `createSlice`, `createAsyncThunk`
- **React-Redux 9.2** - React bindings for Redux store

### Routing & Navigation
- **React Router DOM 7.6** - Client-side routing and navigation

### Styling
- **Tailwind CSS 4.1** - Utility-first CSS framework with JIT compilation
- **@tailwindcss/vite** - Tailwind plugin for Vite
- **DaisyUI 5** - Component library built on Tailwind CSS
- **Theme:** "bumblebee" (applied globally in `App.tsx`)

### Data & API
- **Axios 1.9** - HTTP client for API requests
- **Zod 4.1** - Schema validation with TypeScript type inference
- **JWT-decode 4.0** - JWT token parsing for authentication
- **DOMPurify 3.0** - HTML sanitization for XSS protection

### UI Components
- **react-simple-wysiwyg 3.4** - WYSIWYG rich text editor

### Development Tools
- **ESLint 9.25** - Code linting with TypeScript and React rules
- **TypeScript ESLint 8.30** - TypeScript-specific linting rules
- **eslint-plugin-react-hooks** - React hooks linting
- **eslint-plugin-react-refresh** - React Fast Refresh linting

---

## 📁 Project Structure

```
dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx       # Primary button component
│   │   ├── Modal.tsx        # Modal dialog component
│   │   ├── DataTable.tsx    # Reusable data table for CRUD pages
│   │   ├── Sidebar.tsx      # Main navigation sidebar
│   │   ├── Toast.tsx        # Toast notification component
│   │   ├── Wysiwyg.tsx      # WYSIWYG editor wrapper
│   │   └── ...
│   ├── features/            # Redux slices (feature-based organization)
│   │   ├── auth/            # Authentication slice & logic
│   │   ├── users/           # User management slice
│   │   ├── cards/           # Card management slice
│   │   ├── songs/           # Song management slice
│   │   ├── quotes/          # Quote management slice
│   │   ├── roles/           # Role management slice
│   │   ├── permissions/     # Permission management slice
│   │   ├── shopItems/       # Shop item slice
│   │   ├── shopTransactions/# Shop transaction slice
│   │   ├── transactionLog/  # Transaction log slice
│   │   ├── gameItems/       # Game item slice
│   │   ├── gameItemsType/   # Game item type slice
│   │   ├── elements/        # Element slice
│   │   ├── assets/          # Asset management slice
│   │   ├── news/            # News management slice
│   │   └── newsType/        # News type slice
│   ├── pages/               # Page-level components (routes)
│   │   ├── Home.tsx         # Dashboard home page (login/landing)
│   │   ├── User.tsx         # User management page
│   │   ├── Card.tsx         # Card management page
│   │   ├── Song.tsx         # Song management page
│   │   ├── Quote.tsx        # Quote management page
│   │   ├── Item.tsx         # Shop item management page
│   │   ├── Role.tsx         # Role management page
│   │   ├── Permissions.tsx  # Permission management page
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Hook to access auth state
│   │   ├── usePermissions.ts# Hook for permission checks
│   │   └── useToast.tsx     # Hook for toast notifications
│   ├── lib/schemas/         # Zod validation schemas
│   │   ├── auth.ts          # Auth response & user schemas
│   │   ├── user.ts          # User entity schema
│   │   ├── role.ts          # Role entity schema
│   │   ├── permission.ts    # Permission entity schema
│   │   ├── gameItem.ts      # Game item schema
│   │   └── ...
│   ├── helpers/             # Utility functions
│   │   ├── constants.ts     # API base URL and other constants
│   │   ├── getAuthHeader.ts # Helper to get Authorization header
│   │   ├── validateApi.ts   # Zod validation wrapper
│   │   ├── sanitizeHtml.ts  # HTML sanitization wrapper
│   │   └── ...
│   ├── types/               # TypeScript type definitions
│   ├── store/               # Redux store configuration
│   │   └── index.ts         # Root store with all reducers
│   ├── styles/              # Style configuration
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json        # App-specific TS config
├── tsconfig.node.json       # Node-specific TS config
├── eslint.config.js         # ESLint configuration
└── package.json             # Dependencies and scripts
```

---

## 🏗️ Key Architectural Patterns

### 1. Redux State Management

**Organization:** Feature-based slices in `/src/features/{domain}/{domain}Slice.ts`

**Standard Slice Pattern:**
```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { validateOrReject } from '../../helpers/validateApi';

// 1. Define state interface
interface EntityState {
  entities: Entity[];
  loading: boolean;
  error: string | null;
}

// 2. Create async thunks for API operations
export const fetchEntities = createAsyncThunk<Entity[], void, { rejectValue: string }>(
  'entity/fetch',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/entities`, getAuthHeader());
      return validateOrReject<Entity[]>(EntitySchema.array(), response.data, thunkAPI);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed');
      }
      return thunkAPI.rejectWithValue('Failed');
    }
  }
);

// 3. Create slice with reducers and extraReducers
const entitySlice = createSlice({
  name: 'entity',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntities.fulfilled, (state, action) => {
        state.loading = false;
        state.entities = action.payload;
      })
      .addCase(fetchEntities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});
```

**Available Slices (16 total):**
- `auth` - Authentication & session management
- `users` - User CRUD operations
- `cards`, `songs`, `quotes` - Game content management
- `roles`, `permissions` - RBAC management
- `shopItems`, `shopTransactions`, `transactionLog` - Commerce & transactions
- `gameItems`, `gameItemsType`, `elements` - Game mechanics
- `assets` - Asset management
- `news`, `newsType` - News/announcements

### 2. Authentication & Authorization

**JWT-based Authentication:**
- Token stored in `localStorage` with key `'token'`
- Session restoration on app initialization (`main.tsx`)
- Automatic logout on invalid/expired tokens

**User Model:**
```typescript
interface AuthUser {
  id: number;
  username: string;
  email: string;
  roles: {
    role: string;
    permissions: string[];
  }[];
}
```

**Permission Checking:**
```typescript
import { usePermissions } from './hooks/usePermissions';

// In component:
const hasPermission = usePermissions('permission.key');
if (hasPermission) {
  // Show protected UI
}
```

**Auth Flow:**
1. User logs in via `Home.tsx` (login form)
2. `login` thunk validates credentials and receives JWT
3. Token stored in `localStorage`
4. User object extracted from JWT via `jwt-decode`
5. Redux state updated with user info
6. Protected routes accessible via `Sidebar.tsx`

**Role-Based Access Control (RBAC):**
- Only users with roles other than `'user'` can log in to dashboard
- Check implemented in `authSlice.ts`: `hasOtherRoles = auth.user.roles.some((r) => r.role !== 'user')`

### 3. Data Validation with Zod

**Pattern:** All API responses validated before use

```typescript
import { z } from 'zod';
import { validateOrReject } from '../../helpers/validateApi';

// 1. Define schema
const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
});

// 2. Infer TypeScript type
type User = z.infer<typeof UserSchema>;

// 3. Validate API response
const parsed = validateOrReject<User>(UserSchema, response.data, thunkAPI);
```

**Location:** All schemas in `/src/lib/schemas/`

**Helper:** `validateOrReject<T>(schema, data, thunkAPI)` - standardizes validation & error handling

### 4. HTML Sanitization

**Purpose:** Prevent XSS attacks from user-generated content

**Implementation:**
```typescript
import { sanitizeHtml } from '../../helpers/sanitizeHtml';

// Sanitize before rendering
const cleanHtml = sanitizeHtml(userContent);
```

**Usage:** Applied to all WYSIWYG editor content and user-generated HTML

### 5. API Communication

**Base URL:** Configured via environment variable `VITE_API_BASE_URL`
```typescript
// src/helpers/constants.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

**Auth Header Injection:**
```typescript
import { getAuthHeader } from './helpers/getAuthHeader';

// Returns: { headers: { Authorization: 'Bearer <token>' } }
const config = getAuthHeader();
await axios.get(`${API_BASE_URL}/endpoint`, config);
```

**Error Handling:**
- All thunks use try/catch with Axios error detection
- User-friendly error messages extracted from `err.response?.data?.message`
- Fallback messages for network/unknown errors

### 6. Routing

**Router:** React Router DOM v7 with `<BrowserRouter>`

**Base Path:** `/dashboard/` (for GitHub Pages deployment)

**Route Structure:**
```typescript
<Routes>
  <Route path="/dashboard/" element={<Home />} />
  <Route path="/dashboard/users" element={<User />} />
  <Route path="/dashboard/cards" element={<Card />} />
  <Route path="/dashboard/songs" element={<Song />} />
  {/* ... more routes */}
</Routes>
```

**Protected Routes:** All routes except login check for `auth.user` via `useAuth()` hook

**Sidebar Navigation:** Conditionally rendered when `auth.user` is present

### 7. Component Patterns

**DataTable Pattern:**
```typescript
// Reusable table for CRUD operations
<DataTable
  columns={columnDefinitions}
  data={entities}
  onAdd={handleAdd}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

**Column Definitions:**
- Defined in separate files (e.g., `userColumns.tsx`)
- Support for custom renderers (buttons, badges, etc.)
- Handler functions captured in closures

**Modal Pattern:**
```typescript
const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  {/* Modal content */}
</Modal>
```

**Toast Notifications:**
```typescript
import { useToast } from './hooks/useToast';

const toast = useToast();
toast.success('Operation successful!');
toast.error('Operation failed!');
```

---

## 🚀 Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Set environment variable (create .env file)
VITE_API_BASE_URL=https://api.example.com
```

### Development Commands
```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Build Configuration
- **TypeScript:** Strict mode, ES2020 target
- **Vite:** Base path `/dashboard/` for GitHub Pages
- **Plugins:** React (Babel), Tailwind CSS

---

## 📝 Code Conventions & Style Guide

### File Naming
- **Components:** PascalCase (e.g., `UserCard.tsx`, `DataTable.tsx`)
- **Slices/Hooks:** camelCase (e.g., `authSlice.ts`, `useAuth.ts`)
- **Pages:** PascalCase (e.g., `User.tsx`, `Home.tsx`)
- **Schemas:** camelCase (e.g., `user.ts`, `auth.ts`)

### Component Style
- **Prefer:** Function components with hooks (no class components)
- **Props:** Define explicit TypeScript interfaces
- **Exports:** Named exports (default exports only for route modules)

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// Avoid
export default function Button(props: any) { /* ... */ }
```

### TypeScript Guidelines
- **Avoid `any`** - Use explicit types or `unknown`
- **Type inference** - Let TypeScript infer when obvious
- **Public APIs** - Always type props, return values, thunk payloads
- **Zod schemas** - Use `z.infer<typeof Schema>` for types

### Redux Guidelines
- **One slice per domain** - Keep related state together
- **Typed thunks** - Specify return type and reject value
- **Immutable updates** - Redux Toolkit handles this with Immer
- **Error handling** - Always use try/catch in thunks

### Styling Guidelines
- **Tailwind-first** - Use utility classes, avoid custom CSS
- **DaisyUI components** - Use when appropriate for consistency
- **Responsive design** - Use Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- **Theme** - Respect DaisyUI theme variables

---

## 🔑 Important Files & Entry Points

| File | Purpose |
|------|---------|
| `src/main.tsx` | Application bootstrap, Redux Provider, JWT session restoration |
| `src/App.tsx` | Root component, routing configuration, theme application |
| `src/store/index.ts` | Redux store with all reducers |
| `src/features/auth/authSlice.ts` | Authentication logic, login thunk, session management |
| `src/components/Sidebar.tsx` | Main navigation and layout shell |
| `src/components/DataTable.tsx` | Reusable CRUD table component |
| `src/hooks/useAuth.ts` | Auth state access hook |
| `src/hooks/usePermissions.ts` | Permission checking hook |
| `src/helpers/validateApi.ts` | Zod validation wrapper |
| `src/helpers/getAuthHeader.ts` | Auth header helper |
| `vite.config.ts` | Build configuration |
| `index.html` | HTML entry point with redirect handling |

---

## 🧪 Testing & Quality

### Linting
```bash
npm run lint
```

**Configuration:** `eslint.config.js` with TypeScript and React rules

**Enabled Rules:**
- TypeScript recommended rules
- React hooks rules (exhaustive-deps, rules-of-hooks)
- React refresh rules

### Type Checking
```bash
# Type check without building
npx tsc --noEmit
```

### Build Validation
```bash
# Ensure clean build
npm run build
```

---

## 🔐 Security Considerations

1. **XSS Prevention:** All user-generated HTML sanitized with DOMPurify
2. **JWT Storage:** Tokens in `localStorage` (consider httpOnly cookies for production)
3. **Auth Headers:** JWT sent via `Authorization: Bearer <token>` header
4. **Input Validation:** Zod schemas validate all API responses
5. **RBAC:** Role-based access control prevents unauthorized actions
6. **HTTPS:** Production should enforce HTTPS
7. **Env Variables:** API URLs via environment variables (never hardcode)

---

## 🎯 Common Tasks for Agents

### Adding a New Feature/Page

1. **Create Redux Slice:**
   - File: `src/features/newFeature/newFeatureSlice.ts`
   - Define state interface, async thunks, slice

2. **Add to Store:**
   - Update `src/store/index.ts` to include new reducer

3. **Create Zod Schema:**
   - File: `src/lib/schemas/newFeature.ts`
   - Define validation schema and type

4. **Create Page Component:**
   - File: `src/pages/NewFeature.tsx`
   - Use `DataTable` for CRUD or custom UI

5. **Add Route:**
   - Update `src/App.tsx` with new route

6. **Update Sidebar:**
   - Add navigation link in `src/components/Sidebar.tsx`

### Making API Changes

1. Update schema in `src/lib/schemas/`
2. Update thunk in relevant slice
3. Update type definitions if needed
4. Test with dev server

### Styling Changes

1. Use Tailwind utility classes
2. Check DaisyUI components for pre-built options
3. Maintain responsive design with breakpoints
4. Follow existing patterns for consistency

---

## 📚 Additional Resources

- **React:** https://react.dev/
- **Redux Toolkit:** https://redux-toolkit.js.org/
- **Vite:** https://vite.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **DaisyUI:** https://daisyui.com/
- **Zod:** https://zod.dev/
- **React Router:** https://reactrouter.com/

---

## 🤝 Contributing Guidelines for Agents

When making changes to this codebase:

1. **Minimal Changes:** Make the smallest possible modifications to achieve the goal
2. **Type Safety:** Maintain strict TypeScript typing throughout
3. **Consistency:** Follow existing patterns and conventions
4. **Validation:** Always validate API responses with Zod
5. **Error Handling:** Implement proper error handling in thunks
6. **Testing:** Run `npm run lint` before committing
7. **Documentation:** Update this file if adding new patterns or conventions

---

**Last Updated:** 2026-02-16  
**Maintained by:** AI Agents for GameWota Dashboard
