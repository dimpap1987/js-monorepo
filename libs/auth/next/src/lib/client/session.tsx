'use client'

import { apiClientBase } from '@js-monorepo/utils/http'
import { AxiosInstance } from 'axios'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export interface SessionContextType {
  session: Record<string, any> | null
  isLoggedIn: boolean
  isAdmin: boolean
  isLoading: boolean // Expose loading state
  refreshSession: () => void
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoggedIn: false,
  isAdmin: false,
  isLoading: false,
  refreshSession: () => {},
})

const fetchSession = async (
  successCallback: (user: any) => void,
  errorCallback?: (error?: any) => void,
  clientBuilder = apiClientBase,
  endpoint = '/auth/session'
) => {
  try {
    const response = await clientBuilder.get(endpoint, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
      params: {
        _: new Date().getTime(),
      },
    })

    if (response.status >= 200 && response.status < 300) {
      successCallback(response.data)
    } else {
      errorCallback?.()
    }
  } catch (error) {
    console.error('Error fetching session:', error)
    errorCallback?.(error)
  }
}

export const SessionProvider = ({
  children,
  value = null,
  clientBuilder,
  endpoint = '/auth/session',
}: {
  readonly children?: React.ReactNode
  readonly value?: Record<string, any> | null
  clientBuilder?: AxiosInstance
  endpoint?: string
}) => {
  const [session, setSession] = useState<Record<string, any> | null>(value)
  const [loading, setLoading] = useState<boolean>(value === null)

  const refreshSession = useCallback(() => {
    setLoading(true)
    fetchSession(
      (userResponse) => {
        setSession({ ...userResponse })
        setLoading(false)
      },
      () => {
        setSession(null)
        setLoading(false)
        window.location.reload()
      },
      clientBuilder,
      endpoint
    )
  }, [clientBuilder, endpoint])

  useEffect(() => {
    // If we already have a session with user, don't fetch
    if (session?.user) {
      setLoading(false)
      return
    }

    fetchSession(
      (userResponse) => {
        setSession({ ...userResponse })
        setLoading(false)
      },
      () => {
        setSession(null)
        setLoading(false)
      },
      clientBuilder,
      endpoint
    )
  }, [clientBuilder, endpoint])

  // Session refresh interval - only runs when we have a valid session
  useEffect(() => {
    if (!session?.user) return

    const intervalId = setInterval(() => {
      refreshSession()
    }, 60000 * 30) // 30 minutes

    return () => {
      clearInterval(intervalId)
    }
  }, [refreshSession, session?.user])

  const contextValue = useMemo(() => {
    const isLoggedIn = !!session?.user
    const isAdmin = session?.user?.roles?.includes('ADMIN') ?? false

    return {
      session,
      isLoggedIn,
      isAdmin,
      isLoading: loading,
      refreshSession,
    }
  }, [session, loading, refreshSession])

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
