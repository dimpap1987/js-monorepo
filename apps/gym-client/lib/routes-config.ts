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
]

export const authRoutes = ['/auth/login', '/auth/register', '/auth/onboarding']

export const apiAuthPrefix = '/api/auth'

export function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true

  const route = routes.find((r) => pathname.startsWith(r.path))
  return route?.roles.includes(Role.PUBLIC) ?? false
}

export function getRouteConfig(pathname: string): RouteConfig | undefined {
  return routes.find((route) => pathname.startsWith(route.path))
}
