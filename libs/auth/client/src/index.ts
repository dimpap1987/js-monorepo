export * from './lib/session'

export async function logout() {
  try {
    const response = await fetch(`http://localhost:3333/api/auth/logout`, {
      method: 'GET',
      credentials: 'include',
    })
    if (response.ok) {
      window.location.reload()
    } else {
      console.error('Logout failed')
    }
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

export function login(provider: 'google' | 'github') {
  window.location.href = `http://localhost:3333/api/auth/${provider}/login`
}
