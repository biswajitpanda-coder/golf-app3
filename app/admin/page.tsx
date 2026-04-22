'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { syncUser } from '@/lib/syncUser'

type User = {
  id: string
  email: string
  role: string
}

export default function AdminPage() {
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      const authUser = data.user

      if (!authUser) {
        router.replace('/login')
        return
      }

      setEmail(authUser.email ?? null)

      // ✅ auto sync
      await syncUser()

      // ✅ check role
      const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .single()

      if (!currentUser || currentUser.role !== 'admin') {
        router.replace('/dashboard')
        return
      }

      // ✅ fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')

      setUsers(usersData || [])
      setLoading(false)
    }

    init()
  }, [router])

  const deleteUser = async (id: string) => {
    const confirmDelete = confirm('Delete this user?')
    if (!confirmDelete) return

    try {
      setDeletingId(id)

      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      if (!token) return

      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) return

      setUsers((prev) => prev.filter((u) => u.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const toggleRole = async (id: string, role: string) => {
    const newRole = role === 'admin' ? 'user' : 'admin'

    await supabase.from('users').update({ role: newRole }).eq('id', id)

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, role: newRole } : u
      )
    )
  }

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-green-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-6">
      <h1 className="text-4xl mb-6">ADMIN DASHBOARD</h1>

      <p className="mb-6">Logged in as: {email}</p>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 bg-black border border-green-500 rounded-md"
      />

      <div className="border border-green-500 rounded-lg">
        {filteredUsers.length === 0 ? (
          <p className="p-4">No users found</p>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-center px-4 py-3 border-b border-green-800"
            >
              <div>
                <p>{user.email}</p>
                <p className="text-sm">Role: {user.role}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => toggleRole(user.id, user.role)}
                  className="px-3 py-1 border border-green-400 rounded-md"
                >
                  {user.role === 'admin' ? 'Demote' : 'Make Admin'}
                </button>

                <button
                  onClick={() => deleteUser(user.id)}
                  disabled={deletingId === user.id}
                  className="px-3 py-1 border border-red-400 text-red-400 rounded-md"
                >
                  {deletingId === user.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}