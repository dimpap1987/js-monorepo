export async function checkoutSessionClient({
  username,
  url,
  price,
  isDonate,
  customSubmitMessage,
}: {
  username: string
  url: string
  price: number
  isDonate: boolean
  customSubmitMessage: string
}) {
  return fetch(url, {
    body: JSON.stringify({
      username,
      price,
      isDonate,
      customSubmitMessage,
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
