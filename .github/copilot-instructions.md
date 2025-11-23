# Copilot instructions for this repository

These instructions tailor Copilot to our stack and conventions so generated code fits the project without rework.

Tech stack and tooling
- Language: TypeScript (ts 5.8)
- Bundler/dev server: Vite (vite 6)
- UI: React 19 with function components and hooks
- State management: Redux Toolkit (@reduxjs/toolkit) with react-redux
- Routing: react-router-dom v7
- Styling: Tailwind CSS v4 with @tailwindcss/vite plugin and DaisyUI v5
- HTTP: axios
- Auth utilities: jwt-decode
- Linting: ESLint 9 with @eslint/js, typescript-eslint, react-hooks, react-refresh

General code style
- Prefer type-safe code. Avoid any. Use explicit types for public APIs (props, return types, thunks).
- Use named exports. Default exports only when conventional (e.g., route modules).
- File naming:
  - Components: PascalCase filenames, e.g., UserCard.tsx
  - Redux slices/hooks: lowerCamelCase for files, e.g., userSlice.ts, useAuth.ts
- One React component per file unless components are trivial and tightly coupled.
- Keep components presentational where possible; move side effects, data fetching, and global state to slices/thunks.

Project structure (guidance for generating files)
- src/
  - app/ (root app setup: store.ts, providers, routing)
  - features/<domain>/ (Redux slice, thunks, selectors, domain-specific components)
  - components/ (shared UI components)
  - pages/ (route-level components)
  - hooks/ (reusable hooks)
  - lib/ (utilities, api client, constants)
  - styles/ (global CSS if needed)
- Public assets live in /public. Reference with /path from code.

React specifics
- Use function components. Example header:
  - import React from 'react' is not required in TSX.
  - export function ComponentName(props: Props) { … }
- State and effects:
  - Use useState/useEffect/useMemo/useCallback judiciously; avoid unnecessary memoization.
  - For global/stateful server data, use Redux Toolkit slices and thunks (createAsyncThunk).
- Suspense/Code-splitting:
  - Use React.lazy and <Suspense> for page-level components.
- Forms:
  - Keep controlled inputs; lift state only when necessary.

Routing (react-router v7)
- Prefer the data router API with createBrowserRouter and <RouterProvider>.
- Organize routes under src/app/routes.tsx or similar.
- Use lazy route elements for code-splitting.
- Keep route loaders/actions minimal; prefer Redux thunks for complex flows.

Redux Toolkit conventions
- One slice per domain under src/features/<domain>/<domain>Slice.ts.
- Export typed selectors from each feature (and re-export in a central index if needed).
- Use createAsyncThunk for side effects. Keep axios calls outside components.
- Configure store in src/app/store.ts with configureStore. Create typed hooks:
  - useAppDispatch = () => useDispatch<AppDispatch>()
  - useAppSelector: TypedUseSelectorHook<RootState>
- Avoid dispatching many small actions in a row; prefer thunks that encapsulate flows.

HTTP/API layer
- Create an axios instance with baseURL and interceptors (e.g., auth header injection, error handling) in src/lib/api.ts.
- Do not call axios directly in components. Call from thunks or lib functions.
- Handle errors centrally; thunks should return rejectWithValue with a typed error shape.

Auth
- Parse JWTs with jwt-decode only in the auth layer (e.g., when storing/refreshing tokens).
- Never trust client-derived claims for authorization checks beyond UI gating.

Tailwind CSS v4 and DaisyUI
- Use Tailwind utility classes for layout and spacing. Avoid inline style props.
- Import Tailwind once in a global stylesheet (e.g., src/styles/global.css):
  - @import "tailwindcss";
- Prefer DaisyUI components for common UI patterns (buttons, inputs, cards), customizing via Tailwind utilities when needed.
- Keep className readable:
  - Group by layout, spacing, typography, color (e.g., "flex items-center gap-2 text-sm text-content-600 p-4 bg-base-100").
- Responsive:
  - Use mobile-first classes with sm:, md:, lg:, xl: breakpoints.
- Theming:
  - Use DaisyUI theme tokens where possible instead of hard-coded colors.

Vite specifics
- Environment variables: use import.meta.env.VITE_* and document required keys.
- Static assets: place in public/ and reference by absolute path (/logo.svg).
- Entry HTML: index.html at repo root. Inject root element id="root" or "app" as appropriate.

ESLint
- Fix lint warnings in generated code. Honor react-hooks and typescript-eslint rules.
- No unused imports/vars. Prefer const over let where possible.
- Keep dependency arrays accurate in useEffect.

Accessibility and UX
- Use semantic HTML and associated ARIA attributes as needed.
- Ensure focus states are visible; include keyboard navigation considerations.
- Provide alt text for images. Buttons must be <button>, not clickable <div>s.

Performance
- Avoid re-creating objects/functions in props without memoization when expensive.
- Virtualize long lists if needed.
- Debounce/throttle rapid user input that triggers heavy work.

What to generate for common tasks

1) New feature with Redux slice
- Files:
  - src/features/<domain>/<domain>Slice.ts
  - src/features/<domain>/thunks.ts
  - src/features/<domain>/selectors.ts
  - Optional: src/features/<domain>/types.ts
- Slice:
  - InitialState interface
  - Status flags: isLoading, error
  - Reducers for local state updates
- Thunks:
  - Use createAsyncThunk with typed payloads/returns
  - Call axios via src/lib/api
- Selectors:
  - Basic selectors and memoized derived selectors if needed

2) New page (route-level component)
- Place in src/pages/<PageName>.tsx
- Export a React.lazy-loadable component
- Style with Tailwind + DaisyUI
- Connect to Redux via useAppSelector/useAppDispatch only if needed
- Add route in router configuration with lazy import

3) New shared component
- Place in src/components/<ComponentName>.tsx
- Typed props interface; keep it presentational
- Provide className passthrough and rest props when appropriate
- Style with Tailwind utility classes; prefer DaisyUI primitives

4) API client
- src/lib/api.ts:
  - axios.create({ baseURL, withCredentials if needed })
  - Request interceptor to attach Authorization if token present
  - Response interceptor to normalize errors
- Export typed functions per resource; do not export raw axios instance across app layers unless necessary

Examples and templates

Redux slice template (abbreviated):
```ts
// src/features/user/userSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchUserById } from './thunks';

export interface UserState {
  entities: Record<string, User>;
  isLoading: boolean;
  error?: string;
}

const initialState: UserState = { entities: {}, isLoading: false };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    upsert(state, action: PayloadAction<User>) {
      state.entities[action.payload.id] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => { state.isLoading = true; state.error = undefined; })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entities[action.payload.id] = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? action.error.message;
      });
  },
});

export const { upsert } = userSlice.actions;
export default userSlice.reducer;
```

Thunk template:
```ts
// src/features/user/thunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api'; // if path aliases exist; otherwise use relative import

export const fetchUserById = createAsyncThunk<User, string, { rejectValue: string }>(
  'user/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<User>(`/users/${id}`);
      return data;
    } catch (err) {
      // normalizeError should map AxiosError to string or typed error
      return rejectWithValue(normalizeError(err));
    }
  }
);
```

Page template:
```tsx
// src/pages/Dashboard.tsx
import { Suspense } from 'react';

export function Dashboard() {
  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* content */}
      </div>
    </div>
  );
}

export default Dashboard;
```

Tailwind v4 global import (if not already present):
```css
/* src/styles/global.css */
@import "tailwindcss";
/* custom layers or utilities can go here */
```

Router setup (data router, lazy pages):
```tsx
// src/app/router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('@/pages/Dashboard'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <Dashboard />
      </Suspense>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
```

When Copilot is unsure
- Ask for:
  - API shapes (request/response types), env keys (VITE_*), route paths/params, slice names.
- Prefer stubs with TODO comments and typed placeholders over guesses.
- Respect existing patterns in the repo if they differ from these defaults.

Do and don’t summary
- Do: use Redux Toolkit for global state and async flows, Tailwind v4 utilities + DaisyUI components, TypeScript-first APIs, Vite envs, lazy-loaded pages.
- Don’t: inline axios in components, use any, add CSS-in-JS, invent theme tokens, ignore ESLint warnings.

These instructions are specific to this repository’s dependencies: React 19, Redux Toolkit, react-router-dom v7, Tailwind v4 with @tailwindcss/vite, DaisyUI, Vite, axios, jwt-decode, ESLint 9, TypeScript 5.8. Keep generated code aligned with these versions and APIs.