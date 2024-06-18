export const routes = [
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
]

export const authRoutes = ['/auth/login', '/auth/register', '/auth/onboarding']

export const apiAuthPrefix = '/api/auth'
