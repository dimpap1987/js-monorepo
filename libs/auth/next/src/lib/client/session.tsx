'use client'

import { SessionUserType } from '@js-monorepo/types'
import { getCookie } from '@js-monorepo/utils/http'
import axios, { AxiosInstance } from 'axios'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const SessionContext = createContext<{
  user: SessionUserType | null | undefined
  isLoggedIn: boolean
  isAdmin: boolean
  refreshSession: () => void
}>({
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  refreshSession: () => {},
})

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_AUTH_URL}/api`,
  timeout: 5000,
  withCredentials: true,
})

const fetchSession = async (
  successCallback: (user: any) => void,
  errorCallback?: (error?: any) => void,
  clientBuilder = apiClient
) => {
  try {
    const response = await clientBuilder.get('/auth/session')

    if (response.status >= 200 && response.status < 300) {
      successCallback(response.data?.user)
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
  value,
  clientBuilder,
}: {
  readonly children?: React.ReactNode
  readonly value: {
    user: SessionUserType | null | undefined
    isLoggedIn: boolean
  }
  clientBuilder?: AxiosInstance
}) => {
  const [user, setUser] = useState(value.user)

  const refreshSession = useCallback(() => {
    fetchSession(
      (userResponse) => {
        setUser(userResponse)
      },
      () => {
        setUser(null)
        window.location.reload()
      },
      clientBuilder
    )
  }, [clientBuilder])

  useEffect(() => {
    if (!!user || getCookie('UNREGISTERED-USER')) return
    fetchSession((userResponse) => {
      setUser(userResponse)
    })
  }, [])

  useEffect(() => {
    if (!user) return

    const intervalId = setInterval(() => {
      refreshSession() // Refresh session if logged in
    }, 60000 * 30) // 30 minutes

    return () => {
      clearInterval(intervalId)
    }
  }, [refreshSession, user])

  const contextValue = useMemo(() => {
    return {
      user,
      isLoggedIn: !!user,
      refreshSession,
      isAdmin: user?.roles?.includes('ADMIN') ?? false,
    }
  }, [user, refreshSession])

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
