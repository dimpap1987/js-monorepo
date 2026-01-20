import { MenuItem } from '@js-monorepo/types/menu'
import { IoMdNotifications } from 'react-icons/io'
import { MdAccountCircle, MdPalette } from 'react-icons/md'
import {
  RiSdCardLine,
  RiDashboardLine,
  RiPriceTag3Line,
  RiCustomerService2Line,
  RiCalendarLine,
  RiBookmarkLine,
  RiUserLine,
  RiMailLine,
  RiCompassDiscoverLine,
  RiBookOpenLine,
  RiMapPinLine,
} from 'react-icons/ri'
import { Role, type RouteRole } from './roles'

export interface RouteConfig {
  path: string
  roles: RouteRole[]
}

export const routes: RouteConfig[] = [
  {
    path: '/admin',
    roles: [Role.ADMIN],
  },
  {
    path: '/onboarding',
    roles: [Role.USER],
  },
  {
    path: '/dashboard',
    roles: [Role.USER],
  },
  {
    path: '/settings',
    roles: [Role.USER],
  },
  {
    path: '/notifications',
    roles: [Role.USER],
  },
  {
    path: '/pricing',
    roles: [Role.PUBLIC],
  },
  {
    path: '/contact',
    roles: [Role.PUBLIC],
  },
  {
    path: '/coach',
    roles: [Role.PUBLIC],
  },
  {
    path: '/discover',
    roles: [Role.PUBLIC],
  },
  {
    path: '/my-bookings',
    roles: [Role.USER],
  },
  {
    path: '/my-invitations',
    roles: [Role.USER],
  },
]

// Navbar & Sidebar Menu navigation

export const navigationsMenuItems: MenuItem[] = [
  {
    href: '/discover',
    name: 'navigation.discover',
    roles: [Role.PUBLIC],
    Icon: RiCompassDiscoverLine,
    position: 'main',
  },
  {
    href: '/dashboard',
    name: 'navigation.dashboard',
    roles: [Role.USER],
    Icon: RiDashboardLine,
    requiresOrganizer: true,
    position: 'main',
    children: [
      {
        href: '/dashboard/calendar',
        name: 'navigation.calendar',
        roles: [Role.USER],
        Icon: RiCalendarLine,
      },
      {
        href: '/dashboard/classes',
        name: 'navigation.classes',
        roles: [Role.USER],
        Icon: RiBookOpenLine,
      },
      {
        href: '/dashboard/locations',
        name: 'navigation.locations',
        roles: [Role.USER],
        Icon: RiMapPinLine,
      },
      {
        href: '/dashboard/bookings',
        name: 'navigation.classBookings',
        roles: [Role.USER],
        Icon: RiUserLine,
      },
    ],
  },
  {
    href: '/my-bookings',
    name: 'navigation.myBookings',
    roles: [Role.USER],
    Icon: RiBookmarkLine,
    requiresParticipant: true,
    position: 'main',
  },
  {
    href: '/my-invitations',
    name: 'navigation.myInvitations',
    roles: [Role.USER],
    Icon: RiMailLine,
    position: 'main',
  },
  {
    href: '/admin',
    name: 'navigation.admin',
    roles: [Role.ADMIN],
    Icon: RiDashboardLine,
    position: 'main',
    isAdmin: true,
  },
  {
    href: '/pricing',
    name: 'navigation.pricing',
    roles: [Role.PUBLIC],
    Icon: RiPriceTag3Line,
    position: 'secondary',
  },
  {
    href: '/contact',
    name: 'navigation.contact',
    roles: [Role.PUBLIC],
    Icon: RiCustomerService2Line,
    position: 'secondary',
  },
]

export const SETTINGS_NAV_ITEMS = [
  {
    href: '/settings/account',
    label: 'settings.nav.account.label',
    icon: MdAccountCircle,
    description: 'settings.nav.account.description',
  },
  {
    href: '/settings/subscription',
    label: 'settings.nav.subscription.label',
    icon: RiSdCardLine,
    description: 'settings.nav.subscription.description',
  },
  {
    href: '/settings/appearance',
    label: 'settings.nav.appearance.label',
    icon: MdPalette,
    description: 'settings.nav.appearance.description',
  },
  {
    href: '/settings/notifications',
    label: 'settings.nav.notifications.label',
    icon: IoMdNotifications,
    description: 'settings.nav.notifications.description',
  },
] as const

export const authRoutes = ['/auth/login', '/auth/register', '/auth/onboarding']

export const apiAuthPrefix = '/api/auth'

// Utility functions
export function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true

  const route = routes.find((r) => pathname.startsWith(r.path))
  return route?.roles.includes(Role.PUBLIC) ?? false
}

export function getRouteConfig(pathname: string): RouteConfig | undefined {
  return routes.find((route) => pathname.startsWith(route.path))
}
