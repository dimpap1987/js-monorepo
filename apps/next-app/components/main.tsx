'use client'
import { ButtonComponent } from '@js-monorepo/button'
import { ConfirmationDialogComponent } from '@js-monorepo/dialog'
import { useLoader } from '@js-monorepo/loader'
import { MapComponent, Marker, Popup } from '@js-monorepo/map'
import { useNotifications } from '@js-monorepo/notification'
import { ReactNode, useState } from 'react'
import { EmbeddedCheckoutComponentDialog } from '@js-monorepo/payment'
import { checkoutSessionClient } from '@js-monorepo/utils'
import { useUserStore } from '@js-monorepo/store'
import BannerSVG from './banner-svg'
interface MainProps {
  children?: ReactNode
  className?: string
}

export default function Main({ children, className }: MainProps) {
  const [, setLoaderState] = useLoader()
  const [, , addNotification] = useNotifications()
  const [loading, setLoading] = useState(false)
  const [isOpenDialog, setOpenDialog] = useState(false)
  const [isOpenCheckoutDialog, setOpenCheckoutDialog] = useState(false)
  const { data: user } = useUserStore()

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
      <div className="relative min-h-[200px] md:min-h-[30vh] w-full mb-4 md:mb-0 before:content[''] before:w-full before:h-full before:absolute before:top-1/2 before:left-0 before:-translate-y-1/2 before:bg-gradient-to-r before:from-background before:via-transparent before:to-background">
        <BannerSVG />
      </div>
      <div className="flex flex-col justify-center align-items gap-2">
        <ButtonComponent
          className="bg-accent hover:bg-accent-hover font-bold py-2 px-4 border border-accent-border rounded"
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
                description: 'Everything went good',
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

      <div className="mt-2">
        <ButtonComponent
          variant="secondary"
          onClick={() => setOpenCheckoutDialog(true)}
          loading={isOpenCheckoutDialog}
        >
          Donate 5 &euro;
        </ButtonComponent>

        <EmbeddedCheckoutComponentDialog
          stripePublishableKey={
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
          }
          isOpen={isOpenCheckoutDialog}
          onClose={() => setOpenCheckoutDialog(false)}
          checkOutPromise={() =>
            checkoutSessionClient({
              username: user.username as string,
              url: '/api/checkout_sessions',
              customSubmitMessage: 'Thank you for your support',
              isDonate: true,
              price: 500,
            })
          }
        />
      </div>

      {/* Map component */}
      <div className="mt-2 h-[300px]">
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
