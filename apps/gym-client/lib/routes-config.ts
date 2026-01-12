import { MenuItem } from '@js-monorepo/types/menu'
import { IoMdNotifications } from 'react-icons/io'
import { MdAccountCircle, MdPalette } from 'react-icons/md'
import { RiAdminFill } from 'react-icons/ri'
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
    path: '/settings',
    roles: [Role.USER],
  },
  {
    path: '/notifications',
    roles: [Role.USER],
  },
  {
    path: '/settings',
    roles: [Role.USER],
  },
  {
    path: '/pricing',
    roles: [Role.PUBLIC],
  },
]

// Navbar & Sidebar Menu navigation

export const navigationsMenuItems: MenuItem[] = [
  {
    href: '/admin',
    name: 'Dashboard',
    roles: [Role.ADMIN],
    Icon: RiAdminFill,
  },
  {
    href: '/pricing',
    name: 'Pricing',
    roles: [Role.PUBLIC],
    Icon: RiAdminFill,
  },
]

export const SETTINGS_NAV_ITEMS = [
  {
    href: '/settings/account',
    label: 'Account',
    icon: MdAccountCircle,
    description: 'Account information',
  },
  {
    href: '/settings/appearance',
    label: 'Appearance',
    icon: MdPalette,
    description: 'Themes and preferences',
  },
  {
    href: '/settings/notifications',
    label: 'Notifications',
    icon: IoMdNotifications,
    description: 'Push notifications and alerts',
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
