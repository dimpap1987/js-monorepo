self.addEventListener('push', (event) => {
  console.log('Push message received', event)

  const data = event.data.json()
  const title = data?.title ?? ''
  const message = data?.message ?? ''
  const url = data?.data?.url

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      tag: 'unique-tag',
      icon: '/favicon.ico',
      data: {
        url,
      },
    })
  )
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
