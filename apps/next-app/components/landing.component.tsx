'use client'
import { DpButton } from '@js-monorepo/button'
import { useLoader } from '@js-monorepo/loader'
// import { MapComponent, Marker, Popup } from '@js-monorepo/map'
import { useSession } from '@js-monorepo/auth/next/client'
import { Marquee } from '@js-monorepo/components/marquee'
import { DonationDialogComponent } from '@js-monorepo/dialog'
import { useNotifications } from '@js-monorepo/notification'
import { checkoutSessionClient } from '@js-monorepo/payment'
import { cn } from '@js-monorepo/ui/util'
import { ReactNode, useState } from 'react'
import BannerSVG from './banner-svg'
interface MainProps {
  readonly children?: ReactNode
  readonly className?: string
}

export default function LandingComponent({ children, className }: MainProps) {
  const [, setLoaderState] = useLoader()
  const [addNotification] = useNotifications()
  const [loading, setLoading] = useState(false)
  const [isOpenCheckoutDialog, setOpenCheckoutDialog] = useState(false)
  const { user } = useSession()
  const [announcements, setAnnouncements] = useState<string[] | []>([])

  async function loadForTwoSecond() {
    setLoaderState({
      show: true,
      message: 'Loading...',
      description: 'Please wait. . .  . .',
    })
    return new Promise((resolve) => {
      setTimeout(() => {
        setLoaderState({ show: false })
        resolve(true)
      }, 4000)
    })
  }

  return (
    <section className={cn('overflow-hidden', className)}>
      <Marquee duration={15} onAnimationComplete={() => setAnnouncements([])}>
        {announcements.map((message, index) => (
          <span
            className="dark:text-lime-300 font-semibold tracking-wider font-mono select-none"
            key={index}
          >
            {message}
          </span>
        ))}
      </Marquee>
      {children}
      <div className="relative min-h-[200px] w-full mb-4 md:mb-0 before:content[''] before:w-full before:h-full before:absolute before:top-1/2 before:left-0 before:-translate-y-1/2 before:bg-gradient-to-r before:from-background before:via-transparent before:to-background">
        <BannerSVG />
      </div>
      <div className="flex flex-col justify-center align-items gap-2">
        <DpButton variant="accent" onClick={loadForTwoSecond}>
          Trigger loading
        </DpButton>

        <div className="flex gap-2 flex-wrap">
          <DpButton
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
          </DpButton>
          {/* Error  */}
          <DpButton
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
          </DpButton>
          {/* Spinner */}
          <DpButton
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
          </DpButton>
        </div>
        {/* Success */}
        <DpButton
          loading={loading}
          onClick={() => {
            setLoading((prev) => !prev)
            setTimeout(() => {
              setLoading((prev) => !prev)
            }, 2000)
          }}
        >
          Disable when Clicked
        </DpButton>
      </div>

      {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && user?.username && (
        <div className="mt-2">
          <DonationDialogComponent
            stripePublishableKey={
              process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
            }
            checkOutPromise={() =>
              checkoutSessionClient({
                username: user.username as string,
                url: '/api/checkout_sessions',
                customSubmitMessage: 'Thank you for your support',
                isDonate: true,
                price: 600,
              })
            }
          >
            <DpButton
              variant="secondary"
              loading={isOpenCheckoutDialog}
              className="w-full"
            >
              Donate 6 &euro;
            </DpButton>
          </DonationDialogComponent>
        </div>
      )}

      {/* Map component */}
      {/* <div className="mt-2 h-[300px]">
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
      </div> */}
    </section>
  )
}
