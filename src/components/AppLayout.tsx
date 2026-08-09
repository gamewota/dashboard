import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import SidebarNav from './SidebarNav'
import { useSidebarOpen } from '../hooks/useSidebarOpen'
import { BRAND_NAME } from '../helpers/branding'

type AppLayoutProps = {
  children: ReactNode
}

const LG_QUERY = '(min-width: 64rem)'

/**
 * Application shell for authenticated views.
 *
 * Deliberately does NOT use DaisyUI's `drawer`: that component is a CSS grid
 * that pins content to column 2 and the panel to column 1, which fights a
 * sidebar we want to mount/unmount freely. A plain flex row plus a
 * fixed-position mobile overlay gives us full open/close control on both
 * breakpoints.
 *
 * Desktop (lg+): sidebar is a flex sibling, toggled by `isOpen` (persisted).
 * Below lg:     sidebar is a fixed overlay with a backdrop, toggled by `isMobileOpen`.
 */
export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isOpen, toggle } = useSidebarOpen()

  // Tracked so the toggle can label itself for whichever sidebar it controls.
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(LG_QUERY).matches)

  useEffect(() => {
    const mq = window.matchMedia(LG_QUERY)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Close the mobile overlay on navigation.
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  const isSidebarShowing = isDesktop ? isOpen : isMobileOpen
  const handleToggle = () => (isDesktop ? toggle() : setIsMobileOpen((prev) => !prev))

  return (
    <div className="flex min-h-screen bg-base-200/40">
      {/* Desktop sidebar: in normal flow, so content reflows when it unmounts.
          Visibility is driven by the `isDesktop` media-query state rather than
          responsive utility classes — under Tailwind v4 + the daisyUI plugin,
          `hidden lg:block` resolves to `display:none` even above the breakpoint,
          because the base `.hidden` utility outranks the `lg:` variant. */}
      {isDesktop && isOpen && (
        <aside className="shrink-0 sticky top-0 h-screen">
          <SidebarNav onClose={toggle} />
        </aside>
      )}

      {/* Mobile sidebar: fixed overlay + backdrop. */}
      {!isDesktop && isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 h-full">
            <SidebarNav onNavigate={() => setIsMobileOpen(false)} onClose={() => setIsMobileOpen(false)} />
          </aside>
        </>
      )}

      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar is always rendered and always carries a visible toggle, at
            every breakpoint, so there is no state in which a closed sidebar
            cannot be reopened. */}
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-base-300 bg-base-100 px-4 py-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleToggle}
            aria-label={isSidebarShowing ? 'Close navigation' : 'Open navigation'}
            title={isSidebarShowing ? 'Close navigation' : 'Open navigation'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <span className="font-semibold truncate">{BRAND_NAME}</span>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
