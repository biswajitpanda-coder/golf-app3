import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // secure key (bypasses RLS)
)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature error:", err)
    return new Response("Webhook Error", { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any

    const email = session.customer_details?.email
    const customerId = session.customer
    const subscriptionId = session.subscription

    console.log("EMAIL:", email)

    if (!email) {
      console.error("No email found in session")
      return new Response("No email", { status: 400 })
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
      })
      .eq("email", email)
      .select()

    console.log("UPDATE DATA:", data)
    console.log("UPDATE ERROR:", error)
  }

  return new Response("ok", { status: 200 })
}