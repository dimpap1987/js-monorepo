'use client'
import { ButtonComponent } from '@js-monorepo/button'
import { ConfirmationDialogComponent } from '@js-monorepo/dialog'
import { useLoader } from '@js-monorepo/loader'
import { MapComponent, Marker, Popup } from '@js-monorepo/map'
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
  const [isOpenDialog, setOpenDialog] = useState(false)

  async function loadForTwoSecond() {
    setLoaderState({ show: true })
    return new Promise((resolve) => {
      setTimeout(() => {
        setLoaderState({ show: false })
        resolve(true)
      }, 4000)
    })
  }
  return (
    <section className={className}>
      {children}
      <div className="flex flex-col justify-center align-items gap-2">
        <ButtonComponent
          className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={loadForTwoSecond}
        >
          Trigger loading
        </ButtonComponent>

        <div className="flex gap-2 flex-wrap">
          <ButtonComponent
            className="flex-1"
            variant="primary"
            onClick={() => {
              addNotification({
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
        <ButtonComponent
          onClick={() => {
            setOpenDialog((prev) => !prev)
          }}
        >
          Confirmation dialog
        </ButtonComponent>
      </div>

      <ConfirmationDialogComponent
        isOpen={isOpenDialog}
        onClose={() => setOpenDialog(false)}
        onCancel={() => setOpenDialog(false)}
        onConfirm={async () => {
          setOpenDialog(false)
          // await loadForTwoSecond()
          // addNotification({
          //   message: 'Successfully submitted !!!',
          //   type: 'success',
          //   duration: 4000,
          // })
        }}
      ></ConfirmationDialogComponent>

      {/* Map component */}

      <div className="mt-2 h-[400px]">
        <MapComponent
          mapContainerProps={{
            center: { lat: 37.98381, lng: 23.727539 },
            zoom: 10,
          }}
        >
          <Marker
            position={{
              lat: 37.98381,
              lng: 23.727539,
            }}
          >
            <Popup>You are here</Popup>
          </Marker>
        </MapComponent>
      </div>
    </section>
  )
}
