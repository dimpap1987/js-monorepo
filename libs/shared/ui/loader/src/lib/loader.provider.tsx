'use client'

import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'
import DpLoader from './loader'

interface LoaderProps {
  readonly message?: string
  readonly description?: string
  readonly show?: boolean
}

type LoaderProviderPros = PropsWithChildren & LoaderProps

const LoaderContext = createContext<
  | {
      loaderState: LoaderProps
      setLoaderState: React.Dispatch<React.SetStateAction<LoaderProps>>
    }
  | undefined
>(undefined)

export const useLoader = (): {
  state: LoaderProps
  setLoaderState: React.Dispatch<React.SetStateAction<LoaderProps>>
} => {
  const context = useContext(LoaderContext)
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider')
  }
  return {
    state: context.loaderState,
    setLoaderState: context.setLoaderState,
  }
}

export const DpLoaderProvider: React.FC<LoaderProviderPros> = ({
  children,
}) => {
  const [loaderState, setLoaderState] = useState<LoaderProps>({
    show: undefined,
    message: '',
    description: '',
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
        <DpLoader
          message={loaderState.message}
          description={loaderState.description}
          show={loaderState.show}
        />
      )}
      {children}
    </LoaderContext.Provider>
  )
}

export default DpLoaderProvider
