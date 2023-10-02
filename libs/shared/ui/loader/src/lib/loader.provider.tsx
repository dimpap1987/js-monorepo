'use client'

import React, { ReactNode, createContext, useContext, useState } from 'react'
import Loader from './loader'

interface LoaderProps {
  message?: string
  show?: boolean
}

type LoaderProviderPros = {
  children?: ReactNode
} & LoaderProps

const LoaderContext = createContext<
  | {
      loaderState: LoaderProps
      setLoaderState: React.Dispatch<React.SetStateAction<LoaderProps>>
    }
  | undefined
>(undefined)

export const useLoader = (): [
  LoaderProps,
  React.Dispatch<React.SetStateAction<LoaderProps>>,
] => {
  const context = useContext(LoaderContext)
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider')
  }
  return [context.loaderState, context.setLoaderState]
}

export const LoaderProvider: React.FC<LoaderProviderPros> = ({ children }) => {
  const [loaderState, setLoaderState] = useState<LoaderProps>({
    show: false,
    message: '',
  })

  return (
    <LoaderContext.Provider value={{ loaderState, setLoaderState }}>
      {children}
      {loaderState.show && (
        <Loader message={loaderState.message} show={loaderState.show} />
      )}
    </LoaderContext.Provider>
  )
}

export default LoaderProvider
