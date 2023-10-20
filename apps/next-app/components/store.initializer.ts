'use client'

import { useRef } from 'react'
import { UserStoreState, useUserStore } from '@js-monorepo/store'

export type GlobalStore = {
  userStore: UserStoreState
}

function StoreInitializer({ userStore }: GlobalStore) {
  const initialized = useRef(false)
  if (!initialized.current) {
    useUserStore.setState({
      data: userStore.data,
      removeUser: userStore.removeUser,
      setUser: userStore.setUser,
    })
    initialized.current = true
  }
  return null
}

export default StoreInitializer
