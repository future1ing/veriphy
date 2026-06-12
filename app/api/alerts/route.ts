import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, type Severity, type Plan } from '@/types'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const plan = (profile?.plan || 'free') as Plan
  const allowed = PLAN_LIMITS[plan].severities

  const { searchParams: sp } = new URL(req.url)
  const severity = sp.get('severity')
  const isRead   = sp.get('is_read')
  const source   = sp.get('source')
  const limit    = Math.min(parseInt(sp.get('limit') || '50'), 200)
  const offset   = parseInt(sp.get('offset') || '0')

  let q = supabase.from('alerts').select('*', { count: 'exact' })
    .eq('user_id', user.id).in('severity', allowed)
    .order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  if (severity && allowed.includes(severity as Severity)) q = q.eq('severity', severity)
  if (isRead !== null) q = q.eq('is_read', isRead === 'true')
  if (source) q = q.eq('source', source)

  const { data, error, count } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ alerts: data, total: count, plan, allowed_severities: allowed })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (body.read_all) {
    await supabase.from('alerts').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    return NextResponse.json({ ok: true })
  }

  if (body.alert_id) {
    await supabase.from('alerts').update({ is_read: true }).eq('id', body.alert_id).eq('user_id', user.id)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
