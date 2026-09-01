import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('plots').select('*')
  
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}
