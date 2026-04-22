import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // ✅ Read env INSIDE function (fixes build error)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      )
    }

    // 🔐 Clients (created safely at runtime)
    const supabase = createClient(supabaseUrl, anonKey)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Missing user id' },
        { status: 400 }
      )
    }

    // ✅ Get auth token
    const authHeader = req.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // ✅ Verify user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 401 }
      )
    }

    // ✅ Check admin role
    const { data: currentUser, error: roleError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (roleError || !currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not allowed' },
        { status: 403 }
      )
    }

    // 🔥 Delete user from auth
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(id)

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      )
    }

    // 🔥 Delete from DB
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
