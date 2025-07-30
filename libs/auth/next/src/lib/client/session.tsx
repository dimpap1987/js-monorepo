'use client'

import { apiClientBase } from '@js-monorepo/utils/http'
import { AxiosInstance } from 'axios'
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

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
        _: new Date().getTime(), // Add a unique timestamp as a query parameter
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
  fallback = null,
}: {
  readonly children?: React.ReactNode
  readonly value?: Record<string, any> | null // No longer optional, will default to empty object
  clientBuilder?: AxiosInstance
  endpoint?: string
  fallback?: ReactNode
}) => {
  const [session, setSession] = useState<Record<string, any> | null>(value)
  const [loading, setLoading] = useState(!value)

  const refreshSession = useCallback(() => {
    setLoading(true)
    fetchSession(
      (userResponse) => {
        setSession({ ...userResponse })
        setLoading(false)
      },
      () => {
        setSession({}) // Reset to empty if an error occurs
        setLoading(false)
        window.location.reload() // Redirect after error
      },
      clientBuilder,
      endpoint
    )
  }, [clientBuilder, endpoint])

  useEffect(() => {
    if (session?.user) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchSession(
      (userResponse) => {
        setSession({ ...userResponse })
        setLoading(false)
      },
      () => {
        setSession({})
        setLoading(false)
      },
      clientBuilder,
      endpoint
    )
  }, [clientBuilder, endpoint])

  useEffect(() => {
    if (!session?.user) return

    const intervalId = setInterval(() => {
      refreshSession() // Refresh session every 30 minutes
    }, 60000 * 30)

    return () => {
      clearInterval(intervalId)
    }
  }, [refreshSession, session])

  const contextValue = useMemo(() => {
    const isLoggedIn = !!session?.user
    const isAdmin = session?.user?.roles?.includes('ADMIN') ?? false

    return {
      session,
      isLoggedIn,
      isAdmin,
      refreshSession,
    }
  }, [session, refreshSession])

  if (loading && fallback) {
    return <>{fallback}</>
  }

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
