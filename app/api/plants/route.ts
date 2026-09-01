import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('plantas')
    .insert([body])
    .select()
  
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const plotId = searchParams.get('plot_id')
  
  let query = supabase.from('plantas').select('*')
  if (plotId) query = query.eq('plot_id', plotId)
  
  const { data, error } = await query
  
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}
