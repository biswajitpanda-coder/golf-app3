import { supabase } from '@/lib/supabaseClient'

export const addScore = async (score: number, date: string) => {
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) return

  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  // prevent duplicate date
  if (scores?.find((s) => s.date === date)) {
    alert('Score already exists for this date')
    return
  }

  // keep only latest 5 scores
  if (scores && scores.length >= 5) {
    await supabase
      .from('scores')
      .delete()
      .eq('id', scores[0].id)
  }

  // insert new score
  await supabase.from('scores').insert({
    user_id: user.id,
    score,
    date,
  })
}