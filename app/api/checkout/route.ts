import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY

    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Missing STRIPE_SECRET_KEY' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2026-03-25.dahlia',
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',

      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium Subscription',
            },
            unit_amount: 500,
          },
          quantity: 1,
        },
      ],

      success_url: 'https://your-domain.vercel.app/dashboard',
      cancel_url: 'https://your-domain.vercel.app/subscribe',
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
