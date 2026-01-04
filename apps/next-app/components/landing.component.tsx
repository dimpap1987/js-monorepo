'use client'
import { DpButton } from '@js-monorepo/button'
import { Badge } from '@js-monorepo/components/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@js-monorepo/components/card'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@js-monorepo/components/drawer'
import { FileUpload } from '@js-monorepo/components/file-upload'
import { PermissionGate } from '@js-monorepo/components/permission'
import { SearchBar } from '@js-monorepo/components/search'
import { useLoader } from '@js-monorepo/loader'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { useNotifications } from '@js-monorepo/notification'
import { cn } from '@js-monorepo/ui/util'
import { ReactNode, useState } from 'react'
import { AiFillRocket } from 'react-icons/ai'
import { SITE_NAME } from '../lib/site-config'
import BannerSVG from './banner-svg'
import { PlanGateShowcase } from './plan-gate-showcase'
interface MainProps {
  readonly children?: ReactNode
  readonly className?: string
}

export default function LandingComponent({ children, className }: MainProps) {
  const { setLoaderState } = useLoader()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  // const [isOpenCheckoutDialog, setOpenCheckoutDialog] = useState(false)
  // const { user } = useSession()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query) {
      console.log(`Searching for: ${query}`)
    }
  }

  const handleFileUpload = async (files: File[], onProgress?: (fileIndex: number, progress: number) => void) => {
    addNotification({
      message: `Uploading ${files.length} file(s)...`,
      type: 'information',
      duration: 2000,
    })

    // Simulate upload with progress (for demo purposes only)
    // In production, this would be your actual upload API call
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      // If you have file IDs, you'd call onProgress for each file
      // For demo, we'll just simulate progress
    }

    addNotification({
      message: `Successfully uploaded ${files.length} file(s)!`,
      type: 'success',
      duration: 3000,
    })
  }

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
      {children}
      {/* Hero Section */}
      <div className="relative min-h-[400px] md:min-h-[500px] w-full mb-12 md:mb-16 flex flex-col items-center justify-center before:content-[''] before:w-full before:h-full before:absolute before:top-1/2 before:left-0 before:-translate-y-1/2 before:bg-gradient-to-r before:from-background before:via-transparent before:to-background">
        <BannerSVG />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <Badge variant="accent" className="mb-4 text-sm px-3 py-1">
            <AiFillRocket className="inline mr-1" />
            Welcome to {SITE_NAME}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Build Something Amazing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the power of modern technology with our feature-rich platform. Fast, secure, and designed for
            scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <DpNextNavLink href="/auth/login">
              <DpButton size="large" variant="primary" className="w-full sm:w-auto">
                Get Started
              </DpButton>
            </DpNextNavLink>
            <DpNextNavLink href="/pricing">
              <DpButton size="large" variant="outline" className="w-full sm:w-auto">
                View Pricing
              </DpButton>
            </DpNextNavLink>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center align-items gap-2">
        <DpButton variant="accent" onClick={loadForTwoSecond}>
          Trigger loading
        </DpButton>

        <div className="flex gap-2 flex-wrap">
          <DpButton
            className="flex-1"
            variant="outline"
            onClick={() => {
              addNotification({
                message: 'This is a success message',
                type: 'success',
                duration: 4000,
                description: 'Everything went good bla bla bla bla bla bla bla bla',
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

      {/* Component Showcase Section */}
      <div className="my-12 space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Component Showcase</h2>
          <p className="text-muted-foreground">Explore our reusable components</p>
        </div>

        {/* SearchBar Component */}
        <Card>
          <CardHeader>
            <CardTitle>Search Bar</CardTitle>
            <CardDescription>Debounced search with suggestions and recent searches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchBar
              placeholder="Search users, posts, products..."
              onSearch={handleSearch}
              suggestions={['React', 'Next.js', 'TypeScript', 'Tailwind CSS']}
              recentSearches={['JavaScript', 'Node.js']}
              debounceMs={500}
            />
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                Current search: <span className="font-medium">{searchQuery}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Permission Gate Component */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Gate</CardTitle>
            <CardDescription>Conditionally render content based on user permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PermissionGate
              permission="ADMIN"
              fallback={
                <div className="p-4 border border-border rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">You don&apos;t have permission to see this content</p>
                </div>
              }
            >
              <div className="p-4 border border-primary rounded-lg bg-accent">
                <p className="text-sm font-medium">Admin Content</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This content is only visible to users with admin permissions
                </p>
              </div>
            </PermissionGate>
            <div className="p-4 border border-border rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Public content is always visible</p>
            </div>
          </CardContent>
        </Card>

        {/* File Upload Component */}
        <Card>
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
            <CardDescription>Drag & drop file upload with progress tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onUpload={handleFileUpload}
              accept={{
                'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                'application/pdf': ['.pdf'],
              }}
              maxSize={5 * 1024 * 1024} // 5MB
              multiple
              maxFiles={3}
            />
          </CardContent>
        </Card>

        {/* Drawer Component */}
        <Card>
          <CardHeader>
            <CardTitle>Drawer</CardTitle>
            <CardDescription>A slide-up drawer component for mobile-friendly interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Drawer>
              <DrawerTrigger asChild>
                <DpButton variant="outline">Open Drawer</DpButton>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader>
                    <DrawerTitle>Settings</DrawerTitle>
                    <DrawerDescription>Configure your preferences below.</DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 pb-0">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Dark Mode</span>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Notifications</span>
                        <Badge variant="accent">On</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Language</span>
                        <Badge>English</Badge>
                      </div>
                    </div>
                  </div>
                  <DrawerFooter>
                    <DpButton>Save Changes</DpButton>
                    <DrawerClose asChild>
                      <DpButton variant="outline">Cancel</DpButton>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </CardContent>
        </Card>

        {/* Plan Gate Component */}
        <PlanGateShowcase />
      </div>

      {/* {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && user?.username && (
        <div className="mt-2">
          <DonationDialogComponent
            stripePublishableKey={
              process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
            }
            checkOutPromise={() =>
              checkoutSessionClient({
                username: user.username as string,
                url: '/next-api/checkout_sessions',
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
      )} */}

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
