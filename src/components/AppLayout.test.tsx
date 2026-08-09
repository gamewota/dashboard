import { describe, expect, test, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppLayout from './AppLayout';
import { renderWithProviders, setViewport } from '../test/renderWithProviders';

const CONTENT = <div data-testid="page-content">Page content</div>;

/**
 * The sidebar has regressed twice in ways that left users stuck:
 * once with no way to reopen a closed sidebar, and once with the panel
 * rendered but hidden by `hidden lg:block` (daisyUI's plugin makes the base
 * `.hidden` utility outrank the `lg:` variant). These assert both directions
 * work and that the toggle is always reachable.
 */

const sidebar = () => screen.queryByRole('navigation');

/**
 * The top bar's toggle. Scoped to the banner landmark because the sidebar
 * renders its own close button with a similar accessible name.
 */
const toggle = () =>
  within(screen.getByRole('banner')).getByRole('button', { name: /navigation/i });

describe('AppLayout on desktop', () => {
  beforeEach(() => setViewport(true));

  test('shows the sidebar by default', () => {
    renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);

    expect(sidebar()).toBeInTheDocument();
  });

  test('closes the sidebar when the toggle is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);

    await user.click(toggle());

    expect(sidebar()).not.toBeInTheDocument();
  });

  test('reopens a closed sidebar — the toggle stays reachable', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);

    await user.click(toggle());
    expect(sidebar()).not.toBeInTheDocument();

    // The regression: with the sidebar closed there was no visible control.
    await user.click(toggle());

    expect(sidebar()).toBeInTheDocument();
  });

  test('the toggle carries no class that would hide it while the sidebar is closed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);

    await user.click(toggle());

    // jsdom does not apply stylesheets, so `toBeVisible()` cannot see a
    // Tailwind `hidden`/`lg:hidden` class. Assert on the class list instead —
    // this is exactly how the toggle disappeared on desktop before.
    const classes = toggle().className.split(/\s+/);
    expect(classes).not.toContain('hidden');
    expect(classes).not.toContain('lg:hidden');
  });

  test('persists the closed state across remounts', async () => {
    const user = userEvent.setup();
    const first = renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);
    await user.click(toggle());
    first.unmount();

    renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);

    expect(localStorage.getItem('sidebar:open')).toBe('false');
    expect(sidebar()).not.toBeInTheDocument();
  });

  test('restores an open sidebar from persisted state', () => {
    localStorage.setItem('sidebar:open', 'true');

    renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);

    expect(sidebar()).toBeInTheDocument();
  });

  test('labels the toggle for the action it will perform', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);

    expect(toggle()).toHaveAccessibleName('Close navigation');

    await user.click(toggle());

    expect(toggle()).toHaveAccessibleName('Open navigation');
  });

  test('the top bar is never hidden by a responsive class', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);

    // An earlier revision used `flex lg:hidden` here, which removed the only
    // control capable of reopening the sidebar on desktop. Check both the
    // open and closed states.
    const expectVisibleTopBar = () => {
      const classes = screen.getByRole('banner').className.split(/\s+/);
      expect(classes).not.toContain('hidden');
      expect(classes).not.toContain('lg:hidden');
    };

    expectVisibleTopBar();
    await user.click(toggle());
    expectVisibleTopBar();
  });

  test('always renders page content regardless of sidebar state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);

    expect(screen.getByTestId('page-content')).toBeInTheDocument();

    await user.click(toggle());

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });
});

describe('AppLayout on mobile', () => {
  beforeEach(() => setViewport(false));

  test('hides the sidebar initially even when the desktop state is open', () => {
    localStorage.setItem('sidebar:open', 'true');

    renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);

    expect(sidebar()).not.toBeInTheDocument();
  });

  test('opens an overlay sidebar when the toggle is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);

    await user.click(toggle());

    expect(sidebar()).toBeInTheDocument();
  });

  test('closes the overlay when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);
    await user.click(toggle());

    const backdrop = container.querySelector('[aria-hidden="true"]');
    expect(backdrop).not.toBeNull();
    await user.click(backdrop!);

    expect(sidebar()).not.toBeInTheDocument();
  });

  test('does not write the mobile overlay state to localStorage', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout>{CONTENT}</AppLayout>);

    await user.click(toggle());

    // Mobile open/close is transient; only the desktop preference persists.
    expect(localStorage.getItem('sidebar:open')).not.toBe('false');
  });
});
