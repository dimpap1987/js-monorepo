import { CreateCheckoutSessionRequestBody } from '@js-monorepo/types'
import { HttpClientProxy } from '@js-monorepo/utils/http'
import { calculateThirtyMinutesFromNow } from '@js-monorepo/utils/common'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 2,
})

export async function createCheckoutSession(
  str: Stripe,
  {
    username,
    price,
    customSubmitMessage,
    isDonate,
    paymentDescription,
    paymentName,
  }: CreateCheckoutSessionRequestBody
) {
  if (!price) {
    throw Error('INVALID_PRICE')
  }

  // create session payload
  let sessionPayload: Stripe.Checkout.SessionCreateParams = {
    ui_mode: 'embedded',
    metadata: {
      username,
      date: new Date().toLocaleString(),
    },
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Payment',
            description: paymentDescription || undefined,
          },
          unit_amount: price, // Amount in cents, e.g., $100.00
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    redirect_on_completion: 'never',
    expires_at: calculateThirtyMinutesFromNow(), // 30 minutes epoch,
  }

  // set custom submit message
  if (customSubmitMessage) {
    sessionPayload = {
      ...sessionPayload,
      custom_text: {
        submit: {
          message: customSubmitMessage,
        },
      },
    }
  }

  //set session payload for donation
  if (isDonate) {
    sessionPayload = {
      ...sessionPayload,
      submit_type: 'donate',
    }

    if (!paymentName && sessionPayload.line_items) {
      const lineItems = sessionPayload.line_items

      sessionPayload = {
        ...sessionPayload,
        line_items: [
          {
            ...lineItems[0],
            price_data: {
              ...lineItems[0]?.price_data,
              currency: lineItems[0]?.price_data?.currency || 'eur',
              product_data: {
                name: 'Make your Donation',
              },
            },
          },
        ],
      }
    }
  }

  // create stripe session
  return str.checkout.sessions.create(sessionPayload)
}

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
