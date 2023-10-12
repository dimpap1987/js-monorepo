'use client'
import { ButtonComponent } from '@js-monorepo/button'
import { useLoader } from '@js-monorepo/loader'
import { useNotifications } from '@js-monorepo/notification'
import { ReactNode, useState } from 'react'

interface MainProps {
  children?: ReactNode
  className?: string
}

export default function Main({ children, className }: MainProps) {
  const [, setLoaderState] = useLoader()
  const [, , addNotification] = useNotifications()
  const [loading, setLoading] = useState(false)
  return (
    <main className={className}>
      {children}
      <div className="flex flex-col justify-center align-items gap-2">
        <ButtonComponent
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
        </ButtonComponent>

        <div className="flex gap-2 flex-wrap">
          <ButtonComponent
            className="flex-1"
            variant="primary"
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
          </ButtonComponent>
          {/* Error  */}
          <ButtonComponent
            className="flex-1"
            variant="danger"
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
          </ButtonComponent>
          {/* Spinner */}
          <ButtonComponent
            className="flex-1"
            variant="secondary"
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
          </ButtonComponent>
        </div>
        {/* Success */}
        <ButtonComponent
          loading={loading}
          onClick={() => {
            setLoading((prev) => !prev)
            setTimeout(() => {
              setLoading((prev) => !prev)
            }, 2000)
          }}
        >
          Disable when Clicked
        </ButtonComponent>
        <div></div>
      </div>
    </main>
  )
}
