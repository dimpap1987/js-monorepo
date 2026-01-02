import { ClientResponseType } from '@js-monorepo/types'

export async function handleQueryResponse<T>(response: ClientResponseType<T> & { ok: boolean }): Promise<T> {
  if (response.ok) {
    return response.data as T
  }
  // Type guard: if ok is false, it's an ErrorResponse
  const errorResponse = response as Extract<ClientResponseType<T>, { ok: false }>
  // Create an error that preserves the response structure
  const error = new Error(errorResponse.message || 'Request failed') as Error & {
    errors?: string[]
    data?: { errors?: string[] }
    response?: ClientResponseType<T>
  }
  error.errors = errorResponse.errors
  error.data = { errors: errorResponse.errors }
  error.response = response
  throw error
}

export const queryKeys = {
  admin: {
    users: (params?: string) => ['admin', 'users', params] as const,
    roles: () => ['admin', 'roles'] as const,
  },
  notifications: {
    user: (userId: number, params?: string) => ['notifications', 'user', userId, params] as const,
  },
  payments: {
    plans: () => ['payments', 'plans'] as const,
    subscription: (id: number) => ['payments', 'subscription', id] as const,
    invoices: (limit?: number, startingAfter?: string) => ['payments', 'invoices', { limit, startingAfter }] as const,
  },
} as const
