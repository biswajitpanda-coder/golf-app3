import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    // ✅ Read env INSIDE function
    const stripeKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
      return new Response("Missing environment variables", { status: 500 })
    }

    // ✅ Create clients safely at runtime
    const stripe = new Stripe(stripeKey)
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
      return new Response("Missing signature", { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      console.error("Webhook signature error:", err)
      return new Response("Webhook Error", { status: 400 })
    }

    // ✅ Handle event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any

      const email = session.customer_details?.email
      const customerId = session.customer
      const subscriptionId = session.subscription

      if (!email) {
        console.error("No email found in session")
        return new Response("No email", { status: 400 })
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
        })
        .eq("email", email)

      if (error) {
        console.error("DB update error:", error)
        return new Response("Database error", { status: 500 })
      }
    }

    return new Response("ok", { status: 200 })
  } catch (err) {
    console.error("Webhook fatal error:", err)
    return new Response("Server error", { status: 500 })
  }
}
