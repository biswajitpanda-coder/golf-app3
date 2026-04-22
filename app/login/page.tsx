'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    // ✅ VALIDATION (IMPORTANT)
    if (!email || !password) {
      alert('Please enter email and password')
      return
    }

    setLoading(true)

    if (isLogin) {
      // 🔹 LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setLoading(false)
        return alert(error.message)
      }

      const user = data.user
      if (!user) {
        setLoading(false)
        return
      }

      // 🔹 Ensure profile exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!existing) {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          subscription_status: 'inactive',
        })
      }

      window.location.href = '/dashboard'

    } else {
      // 🔹 SIGNUP
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      setLoading(false)

      if (error) return alert(error.message)

      alert('Signup successful. Please login.')
      setIsLogin(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white">

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-80 text-center">

        <h1 className="text-2xl font-bold mb-6">
          {isLogin ? 'Login' : 'Signup'}
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 bg-black border border-white/20 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 bg-black border border-white/20 rounded"
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full py-2 bg-green-500 text-black rounded-lg mb-3"
        >
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Signup'}
        </button>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-gray-400 cursor-pointer hover:underline"
        >
          {isLogin
            ? "Don't have an account? Signup"
            : 'Already have an account? Login'}
        </p>

      </div>
    </div>
  )
}