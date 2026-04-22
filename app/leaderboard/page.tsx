"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Leaderboard() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      // 1️⃣ Get all scores
      const { data: scores } = await supabase
        .from("scores")
        .select("user_id, score, date")

      if (!scores) return

      // 2️⃣ Group scores by user
      const grouped: any = {}

      scores.forEach((s) => {
        if (!grouped[s.user_id]) {
          grouped[s.user_id] = []
        }
        grouped[s.user_id].push(s)
      })

      // 3️⃣ Calculate average of last 5 scores
      const averages: any[] = []

      for (const userId in grouped) {
        const userScores = grouped[userId]

        // sort latest first
        userScores.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        const last5 = userScores.slice(0, 5)

        const total = last5.reduce((sum: number, s: any) => sum + s.score, 0)
        const avg = total / last5.length

        averages.push({
          user_id: userId,
          avgScore: avg.toFixed(2),
        })
      }

      // 4️⃣ Get emails
      const userIds = averages.map((a) => a.user_id)

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds)

      // 5️⃣ Merge data
      const finalData = averages.map((a) => {
        const user = profiles?.find((p) => p.id === a.user_id)

        return {
          email: user?.email || "Unknown",
          avgScore: a.avgScore,
        }
      })

      // 6️⃣ Sort (higher score first)
      finalData.sort((a, b) => Number(b.avgScore) - Number(a.avgScore))

      setData(finalData)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ padding: "20px" }}>
      <h1>Leaderboard (Average of Last 5 Scores)</h1>

      {data.map((item, index) => (
        <div key={index}>
          #{index + 1} — {item.email} — {item.avgScore}
        </div>
      ))}
    </div>
  )
}