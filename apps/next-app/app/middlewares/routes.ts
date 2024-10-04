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
    path: '/profile',
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
]

export const authRoutes = ['/auth/login', '/auth/register', '/auth/onboarding']

export const apiAuthPrefix = '/api/auth'
