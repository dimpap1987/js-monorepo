'use client'

import { apiClientBase } from '@js-monorepo/utils/http'
import { AxiosInstance } from 'axios'
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export interface SessionContextType {
  session: Record<string, any> | null
  isLoggedIn: boolean
  isAdmin: boolean
  refreshSession: () => void
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoggedIn: false,
  isAdmin: false,
  refreshSession: () => {},
})

const fetchSession = async (clientBuilder: AxiosInstance, endpoint: string) => {
  try {
    const response = await clientBuilder.get(endpoint, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
      params: {
        _: Date.now(),
      },
    })

    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, error: null }
    }

    return {
      data: null,
      error: {
        response: {
          status: response.status,
          statusText: response.statusText,
        },
      },
    }
  } catch (error: any) {
    console.error('Error fetching session:', error)
    return { data: null, error }
  }
}

export const SessionProvider = ({
  children,
  value = null,
  clientBuilder = apiClientBase,
  endpoint = '/auth/session',
}: {
  readonly children?: React.ReactNode
  readonly value?: Record<string, any> | null
  clientBuilder?: AxiosInstance
  endpoint?: string
}) => {
  const [session, setSession] = useState<Record<string, any> | null>(value)
  const cancelledRef = useRef(false)

  const refreshSession = useCallback(async () => {
    const { data, error } = await fetchSession(clientBuilder, endpoint)

    if (data) {
      setSession(data)
    } else {
      setSession(null)
      const isAuthError = error?.response?.status === 401 || error?.response?.status === 403
      if (isAuthError) {
        window.location.reload()
      }
    }
  }, [clientBuilder, endpoint])

  useEffect(() => {
    if (value) return

    cancelledRef.current = false

    fetchSession(clientBuilder, endpoint).then(({ data, error }) => {
      if (cancelledRef.current) return

      if (data) {
        setSession(data)
      } else {
        setSession(null)
      }
    })

    return () => {
      cancelledRef.current = true
    }
  }, [clientBuilder, endpoint, value])

  useEffect(() => {
    if (!session?.user) return

    const intervalId = setInterval(refreshSession, 60000 * 30)
    return () => clearInterval(intervalId)
  }, [refreshSession, session?.user])

  const contextValue = useMemo(
    () => ({
      session,
      isLoggedIn: !!session?.user,
      isAdmin: session?.user?.roles?.includes('ADMIN') ?? false,
      refreshSession,
    }),
    [session, refreshSession]
  )

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
