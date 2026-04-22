import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST() {
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

    success_url: 'http://localhost:3000/dashboard',
    cancel_url: 'http://localhost:3000/subscribe',
  })

  return NextResponse.json({ url: session.url })
}