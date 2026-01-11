// Role-based route definitions
const roleRoutes: { [role: string]: string[] } = {
  admin: ['/admin', '/admin/settings'],
  user: ['/dashboard', '/profile'],
}

// Public routes anyone can access
const publicRoutes = ['/login', '/register', '/about']

export const authRoutes = ['/auth/login', '/auth/register', '/auth/onboarding']

export const apiAuthPrefix = '/api/auth'
