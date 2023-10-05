'use client'
import { useLoader } from '@js-monorepo/loader'
import { useNotifications } from '@js-monorepo/notification'
import { ReactNode } from 'react'

interface MainProps {
  children?: ReactNode
  className?: string
}

export default function Main({ children, className }: MainProps) {
  const [, setLoaderState] = useLoader()
  const [, , addNotification] = useNotifications()
  return (
    <section className={className}>
      {children}
      <div className="flex flex-col justify-center align-items gap-2">
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
        {/* Success */}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={() => {
            addNotification({
              id: Math.floor(Math.random() * 1000000),
              message: 'This is a success message',
              type: 'success',
              duration: 4000,
            })
          }}
        >
          Success notification
        </button>
        {/* Error  */}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={() => {
            addNotification({
              id: Math.floor(Math.random() * 1000000),
              message: 'This is an error message',
              type: 'error',
              duration: 4000,
            })
          }}
        >
          Error notification
        </button>
        {/* Spinner */}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={() => {
            addNotification({
              id: Math.floor(Math.random() * 1000000),
              message: 'This is a spinner',
              type: 'spinner',
              duration: 4000,
            })
          }}
        >
          Spinner notification
        </button>
      </div>
    </section>
  )
}
