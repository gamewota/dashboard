// Single source of truth for the dashboard route paths so the `/dashboard`
// base isn't repeated on every route. Build child paths from DASHBOARD.
const DASHBOARD = '/dashboard'

// `p('')` -> '/dashboard', `p('cards')` -> '/dashboard/cards'.
const p = (segment: string) => (segment ? `${DASHBOARD}/${segment}` : `${DASHBOARD}/`)

export const ROUTES = {
  home: p(''),
  cards: p('cards'),
  cardVariant: p('cards/variant'),
  gachaPack: p('cards/gacha-pack'),
  gachaPackDetails: p('cards/gacha-pack/:id'),
  songs: p('songs'),
  quotes: p('quotes'),
  users: p('users'),
  items: p('items'),
  shopHistory: p('shop-history'),
  transactionLog: p('transaction-log'),
  forgotPassword: p('forgot-password'),
  verify: p('verify'),
  resendVerify: p('resend-verify'),
  role: p('role'),
  permissions: p('permissions'),
  element: p('element'),
  gameItems: p('game-items'),
  gameItemsType: p('game-items-type'),
  assets: p('assets'),
  news: p('news'),
  newsDetail: p('news/:id'),
  newsType: p('news-type'),
  member: p('member'),
  rarity: p('rarity'),
  currency: p('currency'),
  beatmapEditor: p('beatmap-editor'),
  beatmapEditorForSong: p(':song_id/beatmap-editor'),
  events: p('events'),
  eventDetail: p('events/:id'),
  bannerTypes: p('banner-types'),
  banners: p('banners'),
  profileBanner: p('profile-banner'),
} as const

export type RouteKey = keyof typeof ROUTES
