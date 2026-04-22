"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function DrawPage() {
  const [winner, setWinner] = useState<any>(null)

  const runDraw = async () => {
    // 1️⃣ Get current month
    const month = new Date().toISOString().slice(0, 7)

    // 2️⃣ Get all entries
    const { data: entries } = await supabase
      .from("entries")
      .select("user_id, entries")
      .eq("month", month)

    if (!entries || entries.length === 0) {
      alert("No entries found")
      return
    }

    // 3️⃣ Create ticket pool
    const pool: string[] = []

    entries.forEach((e) => {
      for (let i = 0; i < e.entries; i++) {
        pool.push(e.user_id)
      }
    })

    // 4️⃣ Pick random winner
    const randomIndex = Math.floor(Math.random() * pool.length)
    const winnerId = pool[randomIndex]

    // 5️⃣ Get winner email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", winnerId)
      .single()

    setWinner(profile?.email)
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Monthly Draw</h1>

      <button onClick={runDraw}>
        Run Draw
      </button>

      {winner && (
        <h2>
          Winner: {winner}
        </h2>
      )}
    </div>
  )
}