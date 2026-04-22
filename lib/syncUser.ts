import { supabase } from '@/lib/supabaseClient'

export const syncUser = async () => {
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) return

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!existingUser) {
    await supabase.from('users').insert([
      {
        id: user.id,
        email: user.email,
        role: 'user',
      },
    ])
  }
}