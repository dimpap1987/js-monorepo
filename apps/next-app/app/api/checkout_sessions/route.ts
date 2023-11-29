import {
  CreateCheckoutSessionRequestBody,
  createCheckoutSession,
} from '@js-monorepo/utils'
import { stripe } from '../../lib/stripe'

export async function POST(req: Request) {
  try {
    const {
      username,
      price,
      paymentName,
      paymentDescription,
      customSubmitMessage,
      isDonate,
    } = (await req.json()) as CreateCheckoutSessionRequestBody

    const session = await createCheckoutSession(stripe, {
      username,
      price,
      paymentName,
      paymentDescription,
      customSubmitMessage,
      isDonate,
    })

    return Response.json({
      clientSecret: session.client_secret,
    })
  } catch (error: any) {
    let message
    if (error.message === 'INVALID_USER') {
      message = 'No user provided'
    } else if (error.message === 'INVALID_PRICE') {
      message = 'Invalid price'
    } else {
      message = 'Something went wrong with your request'
    }

    return new Response(
      JSON.stringify({
        message,
      }),
      {
        status: 400,
      }
    )
  }
}
