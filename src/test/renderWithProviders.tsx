import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

type TestUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: { role: string; permissions: string[] }[];
};

const DEFAULT_USER: TestUser = {
  id: 1,
  username: 'tester',
  email: 'tester@example.com',
  first_name: 'Test',
  last_name: 'User',
  roles: [{ role: 'admin', permissions: ['user.view', 'role.view', 'permission.view'] }],
};

/**
 * Forces window.matchMedia to report a fixed breakpoint result.
 * Components read `(min-width: 64rem)` to decide desktop vs mobile layout.
 */
export function setViewport(isDesktop: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: isDesktop,
      media: query,
      onchange: null,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

export function makeTestStore(user: TestUser | null = DEFAULT_USER) {
  const authSlice = createSlice({
    name: 'auth',
    initialState: { user, token: user ? 'test.token' : null, loading: false, error: null },
    reducers: { logout: (state) => { state.user = null; state.token = null; } },
  });

  return configureStore({ reducer: { auth: authSlice.reducer } });
}

export function renderWithProviders(
  ui: ReactElement,
  { user = DEFAULT_USER, route = '/dashboard/' }: { user?: TestUser | null; route?: string } = {},
) {
  const store = makeTestStore(user);

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper }) };
}
