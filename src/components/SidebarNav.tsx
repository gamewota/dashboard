import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import sidebarMenu, { type MenuItem } from './sidebarConfig'
import type { RootState } from '../store'
import { BRAND_INITIALS, BRAND_NAME, BRAND_SUBTITLE } from '../helpers/branding'
import { useCallback, useMemo, useState } from 'react'

function isItemVisible(item: MenuItem, hasPerm: (p?: string) => boolean): boolean {
  if (item.permission && !hasPerm(item.permission)) return false
  if (!item.children) return true
  // children visible if any child visible
  return item.children.some((c) => isItemVisible(c, hasPerm))
}

type SidebarNavProps = {
  /** Called after navigating — lets the mobile drawer close itself. */
  onNavigate?: () => void
  /** Closes the sidebar. Omitted when no close affordance should render. */
  onClose?: () => void
}

/**
 * The navigation panel itself. Layout/drawer mechanics live in AppLayout so the
 * same panel can render as a persistent rail on desktop and a drawer on mobile.
 */
export default function SidebarNav({ onNavigate, onClose }: SidebarNavProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  type Role = { permissions?: string[] }
  const user = useSelector((s: RootState) => s.auth.user)
  const permissions = (user?.roles ?? []).flatMap((r: Role) => r.permissions ?? []) as string[]
  const hasPerm = useCallback((p?: string) => (p ? permissions.includes(p) : true), [permissions])
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({})

  const visibleMenu = useMemo(() => sidebarMenu.filter((m) => isItemVisible(m, hasPerm)), [hasPerm])

  const toggleOpen = (key: string) => setOpenKeys((s) => ({ ...s, [key]: !s[key] }))

  const handleLogout = () => {
    dispatch(logout())
    navigate('/dashboard/')
  }

  const isActivePath = (path?: string) => {
    if (!path) return false
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="bg-base-200 text-base-content h-full w-72 p-4 flex flex-col border-r border-base-300">
      <div className="flex items-center gap-2 px-2 pb-4 border-b border-base-300">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-content text-[0.65rem] font-bold tracking-tight">
          {BRAND_INITIALS}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold leading-tight truncate">{BRAND_NAME}</div>
          <div className="text-xs text-base-content/60 leading-tight">{BRAND_SUBTITLE}</div>
        </div>
        {onClose && (
          <button
            className="btn btn-ghost btn-xs"
            onClick={onClose}
            aria-label="Close navigation"
            title="Close navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto overflow-x-hidden">
        <ul className="flex flex-col gap-0">
          {visibleMenu.map((group: MenuItem) => (
            <li key={group.key} className="py-2">
              <div className="flex items-center gap-2 px-2 mb-1">
                {group.icon}
                <span className="font-semibold text-xs uppercase tracking-wide text-base-content/50">{group.label}</span>
              </div>

              <ul>
                {group.children?.filter((c: MenuItem) => isItemVisible(c, hasPerm)).map((item: MenuItem) => {
                  const active = isActivePath(item.path) || (item.children?.some((ch: MenuItem) => isActivePath(ch.path)) ?? false)
                  const hasChildren = Array.isArray(item.children) && item.children.length > 0
                  const activeClass = active ? 'bg-primary/15 font-medium text-base-content' : 'hover:bg-base-300/60'

                  return (
                    <li key={item.key}>
                      <div className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer transition-colors ${activeClass}`}>
                        {item.icon}
                        {item.path ? (
                          <Link to={item.path} className="flex-1 min-w-0" onClick={onNavigate}>
                            <span className="truncate">{item.label}</span>
                          </Link>
                        ) : (
                          <div className="flex-1 min-w-0"><span className="truncate">{item.label}</span></div>
                        )}

                        {hasChildren && (
                          <button className="btn btn-ghost btn-xs" onClick={() => toggleOpen(item.key)} aria-expanded={Boolean(openKeys[item.key])} aria-label={`Toggle ${String(item.label)}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${openKeys[item.key] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {hasChildren && openKeys[item.key] && (
                        <ul className="mt-1 ml-7 border-l border-base-300 pl-2">
                          {item.children!.filter((c: MenuItem) => isItemVisible(c, hasPerm)).map((child: MenuItem) => (
                            <li key={child.key}>
                              <Link
                                to={child.path ?? '#'}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${isActivePath(child.path) ? 'bg-primary/15 font-medium' : 'hover:bg-base-300/60'}`}
                                onClick={onNavigate}
                              >
                                <span className="truncate">{child.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-4 border-t border-base-300">
        <button
          className="btn btn-ghost btn-sm w-full justify-start gap-2"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )
}
