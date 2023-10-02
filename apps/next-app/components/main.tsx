'use client'
import { useLoader } from '@js-monorepo/loader'
import { ReactNode } from 'react'

interface MainProps {
  children?: ReactNode
}

export default function Main({ children }: MainProps) {
  const [, setLoaderState] = useLoader()

  // const notificationList: Notification[] = [
  //   {
  //     message: 'There was an error',
  //     type: 'error',
  //     description: 'desc',
  //   },
  //   {
  //     message: 'Successfully addded',
  //     type: 'success',
  //     description: 'desc2',
  //   },
  //   {
  //     message: 'Working on it',
  //     type: 'spinner',
  //   },
  // ]
  return (
    <>
      {children}
      <div className="flex justify-center">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={() => {
            setLoaderState({ show: true })
            const timeoutId = setTimeout(() => {
              setLoaderState({ show: false })
              clearTimeout(timeoutId)
            }, 2000)
          }}
        >
          Trigger loading
        </button>
      </div>
    </>
  )
}
