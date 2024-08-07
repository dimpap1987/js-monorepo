'use client'

import { UserJWT } from '@js-monorepo/types'
import { HttpClientProxy } from '@js-monorepo/utils'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const SessionContext = createContext<{
  user: UserJWT | null | undefined
  isLoggedIn: boolean
  refreshSession: () => void
}>({
  user: null,
  isLoggedIn: false,
  refreshSession: () => {},
})

const fetchSession = async (
  successCallback: (user: any) => void,
  errorCallback: (error?: any) => void
) => {
  try {
    const response = await HttpClientProxy.builder<{
      user: UserJWT
    }>(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/session`)
      .get()
      .withCredentials()
      .execute()

    if (response.ok) {
      successCallback(response.data?.user)
    } else {
      errorCallback()
    }
  } catch (error) {
    console.error('Error fetching session:', error)
    errorCallback(error)
  }
}

export const SessionProvider = ({
  children,
  value,
}: {
  readonly children?: React.ReactNode
  readonly value: {
    user: UserJWT | null | undefined
    isLoggedIn: boolean
  }
}) => {
  const [user, setUser] = useState(value.user)
  const [isLoggedIn, setIsLoggedIn] = useState(value.isLoggedIn)

  const refreshSession = useCallback(() => {
    fetchSession(
      (userResponse) => {
        setIsLoggedIn(!!userResponse)
        setUser(userResponse)
      },
      () => {
        setUser(null)
        setIsLoggedIn(false)
        window.location.reload()
      }
    )
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return

    const intervalId = setInterval(refreshSession, 60000 * 4) // 4 minutes

    return () => {
      clearInterval(intervalId)
    }
  }, [isLoggedIn, refreshSession])

  const contextValue = useMemo(() => {
    return {
      user,
      isLoggedIn,
      refreshSession,
    }
  }, [user, isLoggedIn, refreshSession])

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
