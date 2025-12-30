export const routes: {
  path: string
  roles: (string | 'PUBLIC')[]
}[] = [
  {
    path: '/about',
    roles: ['PUBLIC'],
  },
  {
    path: '/api/checkout_sessions',
    roles: ['PUBLIC'],
  },
  {
    path: '/privacy-cookie-statement',
    roles: ['PUBLIC'],
  },
  {
    path: '/terms-of-use',
    roles: ['PUBLIC'],
  },
  {
    path: '/pricing',
    roles: ['PUBLIC'],
  },
  {
    path: '/notifications',
    roles: ['USER', 'ADMIN'],
  },
  {
    path: '/settings',
    roles: ['USER', 'ADMIN'],
  },
  {
    path: '/dashboard',
    roles: ['ADMIN'],
  },
  {
    path: '/feedback',
    roles: ['PUBLIC'],
  },
  {
    path: '/checkout',
    roles: ['USER', 'ADMIN'],
  },
]

export const authRoutes = ['/auth/login', '/auth/register', '/auth/onboarding']

export const apiAuthPrefix = '/api/auth'

export function isPublicRoute(pathname: string) {
  return (
    pathname === '/' ||
    routes.filter((route) => route.roles?.includes('PUBLIC')).some((route) => pathname.startsWith(route.path))
  )
}
