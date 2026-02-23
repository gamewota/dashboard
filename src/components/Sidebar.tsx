import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import sidebarMenu, { type MenuItem } from './sidebarConfig'
import type { RootState } from '../store'
import { useCallback, useMemo, useEffect, useState } from 'react'

function isItemVisible(item: MenuItem, hasPerm: (p?: string) => boolean): boolean {
  if (item.permission && !hasPerm(item.permission)) return false
  if (!item.children) return true
  // children visible if any child visible
  return item.children.some((c) => isItemVisible(c, hasPerm))
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  type Role = { permissions?: string[] }
  const user = useSelector((s: RootState) => s.auth.user)
  const permissions = (user?.roles ?? []).flatMap((r: Role) => r.permissions ?? []) as string[]
  const hasPerm = useCallback((p?: string) => (p ? permissions.includes(p) : true), [permissions])
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({})
  
  // Control drawer open/close state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Close drawer when location changes (URL navigation)
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [location.pathname])

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
    <div className="drawer z-50">
      <input 
        id="my-drawer" 
        type="checkbox" 
        className="drawer-toggle" 
        checked={isDrawerOpen}
        onChange={(e) => setIsDrawerOpen(e.target.checked)}
      />
      <div className="drawer-content">
        <label tabIndex={0} className="btn btn-ghost" htmlFor="my-drawer">
          {/* Drawer toggle when in mobile */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
      </div>

      <div className="drawer-side">
        <label 
          htmlFor="my-drawer" 
          aria-label="close sidebar" 
          className="drawer-overlay bg-black/20 backdrop-blur-sm" 
          onClick={() => setIsDrawerOpen(false)}
        ></label>
        <div className="menu bg-base-200/85 backdrop-blur-md text-base-content min-h-full p-4 relative z-50 flex flex-col w-80 border-r border-white/10 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-bold text-lg">Admin</div>
            </div>
            <button 
              className="btn btn-ghost btn-sm" 
              aria-label="close sidebar"
              onClick={() => setIsDrawerOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="mt-4 overflow-y-auto">
            <ul className="flex flex-col gap-0 [&>li:not(:first-child)]:border-t [&>li:not(:first-child)]:border-base-300/50">
              {visibleMenu.map((group: MenuItem) => (
                <li key={group.key} className="py-2">
                  <div className="flex items-center gap-2 px-2">
                    {group.icon}
                    <span className="font-semibold text-xs uppercase text-base-content/70">{group.label}</span>
                  </div>

                  <ul className="mt-2">
                    {group.children?.filter((c: MenuItem) => isItemVisible(c, hasPerm)).map((item: MenuItem) => {
                      const active = isActivePath(item.path) || (item.children?.some((ch: MenuItem) => isActivePath(ch.path)) ?? false)
                      const hasChildren = Array.isArray(item.children) && item.children.length > 0
                      return (
                        <li key={item.key} className={`px-1`}>
                          <div className={`flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer ${active ? 'bg-base-100/80 border-l-4 border-primary' : 'hover:bg-base-300/50'}`}>
                            {item.icon}
                            {item.path ? (
                              <Link to={item.path} className="flex-1" onClick={() => setIsDrawerOpen(false)}>
                                <span>{item.label}</span>
                              </Link>
                            ) : (
                              <div className="flex-1"><span>{item.label}</span></div>
                            )}

                            {hasChildren && (
                              <button className="btn btn-ghost btn-xs" onClick={() => toggleOpen(item.key)} aria-expanded={Boolean(openKeys[item.key])}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${openKeys[item.key] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {hasChildren && openKeys[item.key] && (
                            <ul className="mt-1 ml-6">
                              {item.children!.filter((c: MenuItem) => isItemVisible(c, hasPerm)).map((child: MenuItem) => (
                                <li key={child.key} className="py-1 hover:bg-base-300/50">
                                  <Link to={child.path ?? '#'} className="flex items-center gap-2 px-2 rounded-md" onClick={() => setIsDrawerOpen(false)}>
                                    <span className="text-sm">{child.label}</span>
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

          <div className="mt-auto pt-4 border-t border-base-300/50">
            <button className="btn btn-error w-full" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
