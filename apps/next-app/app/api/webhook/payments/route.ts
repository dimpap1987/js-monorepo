import { stripe } from '../../../lib/stripe'

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') as string
  const payload = await req.text()

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )

    switch (event?.type) {
      case 'checkout.session.completed':
        // handle checkout.session.completed
        console.log('Checkout successfully completed')
        console.log(event.data?.object)
        break
      default:
        // other events that we don't handle
        break
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message)
      return Response.json({ message: e.message }, { status: 400 })
    }
  }
  return Response.json({ received: true })
}
