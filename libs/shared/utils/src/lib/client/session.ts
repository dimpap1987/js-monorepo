import { HttpClientProxy } from '../utils'

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
  return HttpClientProxy.builder(url)
    .body({
      username,
      price,
      isDonate,
      customSubmitMessage,
    })
    .withCsrf()
    .post()
    .execute()
}
