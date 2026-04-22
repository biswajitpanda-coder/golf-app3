import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 🔐 Admin client (server only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 🔐 Normal client (to verify user)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  // ✅ Get logged-in user from cookies
  const authHeader = req.headers.get('authorization')

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token)

  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 401 })
  }

  // ✅ Check role from DB
  const { data: currentUser } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  // 🔥 Delete from Supabase Auth
  const { error: authError } =
    await supabaseAdmin.auth.admin.deleteUser(id)

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // 🔥 Delete from users table
  await supabaseAdmin.from('users').delete().eq('id', id)

  return NextResponse.json({ success: true })
}