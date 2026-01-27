/* eslint-disable */
self.addEventListener('push', (event) => {
  console.log('Push message received', event)

  const data = event.data ? event.data.json() : {}
  const title = data?.title ?? ''
  const message = data?.message ?? ''
  const url = data?.data?.url

  self.registration.showNotification(title || 'New notification', {
    body: message || 'You have a new message',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `notif-${Date.now()}`,
    data: { url },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const { url } = event.notification.data

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there is an existing window/tab open with your site
      const client = clientList.find((client) => client.url === url && 'focus' in client)
      if (client) {
        return client.focus() // Focus on the existing tab
      }
      return clients.openWindow(url) // Open a new tab/window
    })
  )
})
