import { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '../../lib/stripe'

export async function POST(req: Request) {
  try {
    const { price, paymentName, paymentDescription } = await req.json()
    //TODO validation for price
    if (!price) {
      return new Response(
        JSON.stringify({
          message: 'Invalid price provided',
        }),
        {
          status: 400,
        }
      )
    }

    // create stripe sesssion
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: paymentName || 'Custom Payment',
              description: paymentDescription || 'This is a custom payment',
            },
            unit_amount: price, // Amount in cents, e.g., $100.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      redirect_on_completion: 'never',
      // return_url: `${req.headers.get(
      //   'origin'
      // )}/return?session_id={CHECKOUT_SESSION_ID}`,
    })

    return Response.json({ clientSecret: session.client_secret })
  } catch (err: any) {
    console.error(err.message)
    return new Response(
      JSON.stringify({
        message: 'Something went wrong with your request',
      }),
      {
        status: 500,
      }
    )
  }
}

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.query?.session_id as string
    )

    return Response.json({
      status: session.status,
      customer_email: session.customer_details?.email,
    })
  } catch (err: any) {
    return new Response(err.message, {
      status: 500,
    })
  }
}
