import {
  CreateCheckoutSessionRequestBody,
  createCheckoutSession,
  stripe,
} from '@js-monorepo/utils'
import { NextResponse } from 'next/server'

import logger from '@next-app/logger'

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

    logger.info('Stripe Session creation')
    const session = await createCheckoutSession(stripe, {
      username,
      price,
      paymentName,
      paymentDescription,
      customSubmitMessage,
      isDonate,
    })

    return NextResponse.json({
      clientSecret: session.client_secret,
    })
  } catch (error: unknown) {
    let message = 'Something went wrong with your request'
    if (error instanceof Error) {
      if (error.message === 'INVALID_USER') {
        message = 'No user provided'
      } else if (error.message === 'INVALID_PRICE') {
        message = 'Invalid price'
      }
    }
    return new NextResponse(
      JSON.stringify({
        message,
      }),
      {
        status: 400,
      }
    )
  }
}
