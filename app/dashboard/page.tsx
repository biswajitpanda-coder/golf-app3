'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Score = {
  id: string
  score: number
  date: string
}

export default function Dashboard() {
  const [scores, setScores] = useState<Score[]>([])
  const [newScore, setNewScore] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('inactive')

  // 🔹 Fetch scores
  const fetchScores = async (userId: string) => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    setScores(data || [])
  }

  // 🔹 Fetch subscription
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', userId)
      .single()

    if (data) {
      setStatus(data.subscription_status || 'inactive')
    }
  }

  // 🔹 Init
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!user) {
        window.location.href = '/login'
        return
      }

      await fetchScores(user.id)
      await fetchProfile(user.id)
    }

    init()
  }, [])

  // 🔹 Add score
  const addScore = async () => {
    if (!newScore || !date) return

    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) return

    if (scores.find((s) => s.date === date)) {
      alert('Score already exists for this date')
      return
    }

    if (scores.length >= 5) {
      await supabase
        .from('scores')
        .delete()
        .eq('id', scores[scores.length - 1].id)
    }

    await supabase.from('scores').insert({
      user_id: user.id,
      score: Number(newScore),
      date,
    })

    setNewScore('')
    setDate('')
    fetchScores(user.id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 text-white p-6">

      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* 🔹 GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Subscription */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg mb-2">Subscription</h2>

          <p className={status === 'active' ? 'text-green-400' : 'text-red-400'}>
            {status === 'active' ? 'Active' : 'Inactive'}
          </p>

          {status === 'active' ? (
            <p className="text-sm text-gray-400 mt-1">
              Renews: 30 May 2026
            </p>
          ) : (
            <button
              onClick={() => (window.location.href = '/subscribe')}
              className="mt-4 px-5 py-2 bg-green-500 text-black rounded-xl font-semibold hover:scale-105 transition"
            >
              Subscribe Now
            </button>
          )}
        </div>

        {/* Participation */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg mb-2">Participation</h2>
          <p>Draws Entered: {scores.length}</p>
          <p className="text-sm text-gray-400 mt-1">
            Next Draw: 1 May 2026
          </p>
        </div>

        {/* Winnings */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg mb-2">Winnings</h2>
          <p>Total Won: ₹0</p>
          <p className="text-sm text-gray-400 mt-1">
            No winnings yet
          </p>
        </div>

      </div>

      {/* 🔹 SCORE SECTION */}
      <div className="mt-10 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">

        <h2 className="text-lg mb-4">Score</h2>

        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            type="number"
            placeholder="Score"
            value={newScore}
            onChange={(e) => setNewScore(e.target.value)}
            className="px-3 py-2 bg-black border border-white/20 rounded-lg"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 bg-black border border-white/20 rounded-lg"
          />

          <button
            onClick={addScore}
            className="px-5 py-2 bg-green-500 text-black rounded-xl font-semibold hover:scale-105 transition"
          >
            Add
          </button>
        </div>

        {scores.length === 0 ? (
          <p className="text-gray-400">No scores yet</p>
        ) : (
          scores.map((s) => (
            <div key={s.id} className="border-b border-white/10 py-2">
              {s.score} — {s.date}
            </div>
          ))
        )}
      </div>

      {/* 🔹 CHARITY */}
      <p className="text-sm text-gray-400 mt-6">
        10% of your subscription goes to charity ❤️
      </p>

    </div>
  )
}