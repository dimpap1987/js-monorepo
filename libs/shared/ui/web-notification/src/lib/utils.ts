import { HttpClientProxy } from '@js-monorepo/utils/http'

const registerServiceWorker = async (worker = '/sw.js') => {
  // Check if the browser supports service workers
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker is not supported in this browser.')
    return null
  }

  try {
    // Check if there's already a service worker controller (i.e., if the service worker is already active)
    if (navigator.serviceWorker.controller) {
      console.log('Service Worker already controlling the page.')
      return navigator.serviceWorker.controller
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register(worker)
    console.log('Service Worker registered with scope:', registration.scope)

    // Optionally, you can add an event listener to handle the update of a new service worker
    registration.onupdatefound = () => {
      const installingWorker = registration.installing

      if (installingWorker) {
        installingWorker.onstatechange = () => {
          if (
            installingWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            console.log(
              'New service worker installed and ready to take control'
            )
          }
        }
      }
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
      // If permission is already granted, resolve immediately
      if (Notification.permission === 'granted') {
        resolve('granted')
        return
      }

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

async function subscribeNotifactionToServer(userId: number) {
  const registration = await navigator.serviceWorker.ready

  const subscription = await registration?.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env['NEXT_PUBLIC_VAPID_PUBLIC_KEY'],
  })
  const response = await new HttpClientProxy()
    .builder()
    .url(
      `${process.env.NEXT_PUBLIC_AUTH_URL}/api/notifications/subscribe/${userId}`
    )
    .body(subscription)
    .withCredentials()
    .withCsrf()
    .post()
    .execute()

  return response
}

export {
  registerServiceWorker,
  requestPushPermission,
  subscribeNotifactionToServer,
}
