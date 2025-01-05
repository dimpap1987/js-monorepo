'use client'

import { deepCloneAndUpdate } from '@js-monorepo/utils/common'
import { apiClientBase, getCookie } from '@js-monorepo/utils/http'
import { AxiosInstance } from 'axios'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export interface SessionContextType {
  session: Record<string, any>
  isLoggedIn: boolean
  isAdmin: boolean
  refreshSession: () => void
}

const SessionContext = createContext<SessionContextType>({
  session: {},
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
    const response = await clientBuilder.get(endpoint)

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
  value = {},
  clientBuilder,
  endpoint = '/auth/session',
}: {
  readonly children?: React.ReactNode
  readonly value: Record<string, any> // No longer optional, will default to empty object
  clientBuilder?: AxiosInstance
  endpoint?: string
}) => {
  const [session, setSession] = useState<Record<string, any>>(value)

  const refreshSession = useCallback(() => {
    fetchSession(
      (userResponse) => {
        setSession((prevSession) =>
          deepCloneAndUpdate(prevSession, userResponse)
        )
      },
      () => {
        setSession({}) // Reset to empty if an error occurs
        window.location.reload() // Redirect after error
      },
      clientBuilder,
      endpoint
    )
  }, [clientBuilder, endpoint])

  useEffect(() => {
    if (!!session?.user || getCookie('UNREGISTERED-USER')) return
    fetchSession(
      (userResponse) => {
        setSession((prevSession) =>
          deepCloneAndUpdate(prevSession, userResponse)
        )
      },
      undefined,
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
  }, [refreshSession, session?.user])

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

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
