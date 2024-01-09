'use client'

import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'
import Loader from './loader'

interface LoaderProps {
  readonly message?: string
  readonly show?: boolean
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

export const LoaderComponent: React.FC<LoaderProviderPros> = ({ children }) => {
  const [loaderState, setLoaderState] = useState<LoaderProps>({
    show: false,
    message: '',
  })

  const contextValue = useMemo(() => {
    return {
      loaderState,
      setLoaderState,
    }
  }, [loaderState, setLoaderState])

  return (
    <LoaderContext.Provider value={contextValue}>
      {loaderState.show && (
        <Loader message={loaderState.message} show={loaderState.show} />
      )}
      {children}
    </LoaderContext.Provider>
  )
}

export default LoaderComponent
