"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Success() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSubscription = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", data.user.id)
        .single()

      if (profile?.subscription_status === "active") {
        router.push("/dashboard")
      } else {
        setTimeout(checkSubscription, 2000)
      }
    }

    checkSubscription()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <p className="mb-4">Verifying payment... please wait</p>

        <div className="text-3xl font-bold text-red-500">
          Tailwind Working
        </div>
      </div>
    </div>
  )
}