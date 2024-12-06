import { apiClient } from '@js-monorepo/utils/http'

const check = () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('No Service Worker support!')
  }
  if (!('PushManager' in window)) {
    throw new Error('No Push API Support!')
  }
}

const handleRegistrationUpdate = (registration: ServiceWorkerRegistration) => {
  registration.update()

  // Handle update found for newly registered service worker
  registration.onupdatefound = () => {
    const installingWorker = registration.installing
    if (installingWorker) {
      installingWorker.onstatechange = () => {
        if (
          installingWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          console.log('New service worker installed. Please refresh.')
          // Optionally, you can notify the user to refresh the page
        }
      }
    }
  }
}

const registerServiceWorker = async (
  workerPath = '/sw.js',
  specificScope = '/'
) => {
  check()

  try {
    // Check if there's already a service worker controller
    if (navigator.serviceWorker.controller) {
      console.log('Service Worker already controlling the page.')
      const existingRegistration =
        await navigator.serviceWorker.getRegistration(specificScope)

      if (existingRegistration) {
        handleRegistrationUpdate(existingRegistration)
      }
      return existingRegistration
    }

    // Register the service worker with the specified scope
    const registration = await navigator.serviceWorker.register(workerPath, {
      scope: specificScope,
    })
    console.log('Service Worker registered with scope:', registration.scope)

    if (registration) {
      handleRegistrationUpdate(registration)
    }
    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

const requestPushPermission = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ('Notification' in window) {
      // Request permission if it's not granted
      Notification.requestPermission()
        .then((permission) => {
          resolve(permission)
        })
        .catch((error) => {
          console.error('Error requesting push notification permission:', error)
          reject(error) // Reject with the error if something goes wrong
        })
    } else {
      // If notifications are not supported, reject the promise
      console.warn('Notifications are not supported in this browser.')
      reject(new Error('Notifications are not supported'))
    }
  })
}

// service worker

// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option

const urlB64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  // eslint-disable-next-line no-useless-escape
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function subscribeNotifactionToServer(userId: number) {
  const vapidPublicKey = process.env['NEXT_PUBLIC_VAPID_PUBLIC_KEY']
  if (!vapidPublicKey) {
    throw new Error('Invalid Vapid key')
  }

  const registration = await navigator.serviceWorker.ready

  const subscription = await registration?.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(vapidPublicKey),
  })

  return apiClient.post(`/notifications/subscribe/${userId}`, subscription)
}

export {
  registerServiceWorker,
  requestPushPermission,
  subscribeNotifactionToServer,
}
