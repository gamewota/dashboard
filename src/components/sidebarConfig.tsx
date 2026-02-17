import type { JSX } from 'react'

export type MenuItem = {
  key: string
  label: string
  path?: string
  icon?: JSX.Element
  permission?: string
  children?: MenuItem[]
}

// Lightweight inline icons (Heroicons-style outlines)
export const Icons = {
  Users: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1m-6 6v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2h6m6-10a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Role: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.08 12.08 0 015.84 10.578L12 14z" />
    </svg>
  ),
  Music: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-2v13" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Quote: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m8 8H3a1 1 0 01-1-1V7a1 1 0 011-1h3l2-2h6l2 2h3a1 1 0 011 1v12a1 1 0 01-1 1z" />
    </svg>
  ),
  Cards: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  ),
  Element: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3v6h6v-6c0-1.657-1.343-3-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4" />
    </svg>
  ),
  Assets: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2v10" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16h10" />
    </svg>
  ),
  Shop: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v4H3zM5 7v10a2 2 0 002 2h10a2 2 0 002-2V7" />
    </svg>
  ),
  News: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v9a2 2 0 01-2 2z" />
    </svg>
  ),
  History: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Editor: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
}

export const sidebarMenu: MenuItem[] = [
  {
    key: 'management',
    label: 'Management',
    icon: Icons.Users,
    children: [
      { key: 'users', label: 'Users', path: '/dashboard/users', icon: Icons.Users, permission: 'user.view' },
      { key: 'roles', label: 'Roles', path: '/dashboard/role', icon: Icons.Role, permission: 'role.view' },
      { key: 'permissions', label: 'Permissions', path: '/dashboard/permissions', icon: Icons.Role, permission: 'permission.view' },
    ],
  },
  {
    key: 'content',
    label: 'Content',
    icon: Icons.Music,
    children: [
      { key: 'songs', label: 'Songs', path: '/dashboard/songs', icon: Icons.Music },
      { key: 'quotes', label: 'Quotes', path: '/dashboard/quotes', icon: Icons.Quote },
      {
        key: 'cards',
        label: 'Cards',
        path: '/dashboard/cards',
        icon: Icons.Cards,
        children: [
            { key: 'card-variants', label: 'Card Variants', path: '/dashboard/cards/variant' },
            { key: 'gacha-packs', label: 'Gacha Packs', path: '/dashboard/cards/gacha-pack' }
        ],
      },
      { key: 'elements', label: 'Elements', path: '/dashboard/element', icon: Icons.Element },
      { key: 'assets', label: 'Assets', path: '/dashboard/assets', icon: Icons.Assets },
      { key: 'beatmap-editor', label: 'Beatmap Editor', path: '/dashboard/beatmap-editor', icon: Icons.Editor, permission: 'beatmap.edit' },
    ],
  },
  {
    key: 'shop',
    label: 'Shop',
    icon: Icons.Shop,
    children: [
      { key: 'items', label: 'Shop Items', path: '/dashboard/items' },
      { key: 'game-item-types', label: 'Game Item Types', path: '/dashboard/game-items-type' },
      { key: 'game-items', label: 'Game Items', path: '/dashboard/game-items' },
      { key: 'shop-history', label: 'Shop History', path: '/dashboard/shop-history', permission: 'logs.view' },
    ],
  },
  {
    key: 'system',
    label: 'System',
    icon: Icons.News,
    children: [
      { key: 'news', label: 'News', path: '/dashboard/news' },
      { key: 'news-types', label: 'News Types', path: '/dashboard/news-type' },
      { key: 'transaction-log', label: 'Transaction Log', path: '/dashboard/transaction-log', permission: 'logs.view' },
    ],
  },
]

export default sidebarMenu
