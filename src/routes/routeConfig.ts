import { lazy, type ComponentType } from 'react'
import Home from '../pages/Home'
import Card from '../pages/Card'
import Song from '../pages/Song'
import Quote from '../pages/Quote'
import User from '../pages/User'
import Item from '../pages/Item'
import Role from '../pages/Role'
import ShopTransactions from '../pages/ShopTransactions'
import TransactionLog from '../pages/TransactionLog'
import ForgotPassword from '../pages/ForgotPassword'
import VerifyUser from '../pages/VerifyUser'
import ResendVerification from '../pages/ResendVerification'
import Permission from '../pages/Permissions'
import GameItemsType from '../pages/GameItemsType'
import GameItems from '../pages/GameItems'
import Element from '../pages/Element'
import Assets from '../pages/Assets'
import News from '../pages/News'
import NewsDetail from '../pages/NewsDetail'
import NewsType from '../pages/NewsType'
import CardVariant from '../pages/CardVariant'
import GachaPack from '../pages/GachaPack'
import GachaPackDetails from '../pages/GachaPackDetails'
import Member from '../pages/Member'
import Rarity from '../pages/Rarity'
import Currency from '../pages/Currency'
import BeatmapEditor from '../pages/BeatmapEditor'
import { ROUTES } from './paths'

// Lazy-loaded pages
const Events = lazy(() => import('../pages/Events'))
const EventDetail = lazy(() => import('../pages/EventDetail'))
const BannerType = lazy(() => import('../pages/BannerType'))
const Banner = lazy(() => import('../pages/Banner'))
const ProfileBanner = lazy(() => import('../pages/ProfileBanner'))

export type RouteEntry = {
  path: string
  component: ComponentType
}

// Single list of path -> page. Add a route by appending one entry here.
export const routeConfig: RouteEntry[] = [
  { path: ROUTES.home, component: Home },
  { path: ROUTES.cards, component: Card },
  { path: ROUTES.cardVariant, component: CardVariant },
  { path: ROUTES.gachaPack, component: GachaPack },
  { path: ROUTES.gachaPackDetails, component: GachaPackDetails },
  { path: ROUTES.songs, component: Song },
  { path: ROUTES.quotes, component: Quote },
  { path: ROUTES.users, component: User },
  { path: ROUTES.items, component: Item },
  { path: ROUTES.shopHistory, component: ShopTransactions },
  { path: ROUTES.transactionLog, component: TransactionLog },
  { path: ROUTES.forgotPassword, component: ForgotPassword },
  { path: ROUTES.verify, component: VerifyUser },
  { path: ROUTES.resendVerify, component: ResendVerification },
  { path: ROUTES.role, component: Role },
  { path: ROUTES.permissions, component: Permission },
  { path: ROUTES.element, component: Element },
  { path: ROUTES.gameItems, component: GameItems },
  { path: ROUTES.gameItemsType, component: GameItemsType },
  { path: ROUTES.assets, component: Assets },
  { path: ROUTES.news, component: News },
  { path: ROUTES.newsDetail, component: NewsDetail },
  { path: ROUTES.newsType, component: NewsType },
  { path: ROUTES.member, component: Member },
  { path: ROUTES.rarity, component: Rarity },
  { path: ROUTES.currency, component: Currency },
  { path: ROUTES.beatmapEditor, component: BeatmapEditor },
  { path: ROUTES.beatmapEditorForSong, component: BeatmapEditor },
  { path: ROUTES.events, component: Events },
  { path: ROUTES.eventDetail, component: EventDetail },
  { path: ROUTES.bannerTypes, component: BannerType },
  { path: ROUTES.banners, component: Banner },
  { path: ROUTES.profileBanner, component: ProfileBanner }
]
