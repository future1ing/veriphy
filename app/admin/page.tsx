import { createAdminClient } from '@/lib/supabase/server'
import { PLAN_PRICES, type Plan } from '@/types'

export default async function AdminPage() {
  const supabase = createAdminClient()

  const [
    { count: totalClients },
    { count: activeClients },
    { count: totalAlerts },
    { count: criticalAlerts },
    { data: planRows },
    { data: lastReport },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client').eq('is_active', true),
    supabase.from('alerts').select('*', { count: 'exact', head: true }),
    supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('severity', 'critical'),
    supabase.from('profiles').select('plan').eq('role', 'client'),
    supabase.from('diff_reports').select('report_id, generated_at').order('generated_at', { ascending: false }).limit(1),
  ])

  const planCounts = (planRows || []).reduce<Record<string, number>>((acc, r) => {
    acc[r.plan] = (acc[r.plan] || 0) + 1; return acc
  }, {})

  const mrr = (planRows || []).reduce((s, r) => s + (PLAN_PRICES[r.plan as Plan] || 0), 0)

  const PLANS: Plan[] = ['free', 'starter', 'pro', 'business']
  const PLAN_COLORS: Record<Plan, string> = { free: 'var(--tx3)', starter: 'var(--blu)', pro: 'var(--ac)', business: 'var(--ora)' }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.5px', color: 'var(--tx)' }}>Administration</h2>
        <p style={{ fontSize: 12, color: 'var(--tx2)', marginTop: 3 }}>
          {lastReport?.[0] ? `Dernier pipeline: ${new Date(lastReport[0].generated_at).toLocaleDateString('fr-FR')}` : 'Aucun pipeline lancé'}
          {' · '}3 bases actives
        </p>
      </div>

      {/* Urgent */}
      <div style={{ background: 'var(--redd)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 12, padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 10 }}>
        <p style={{ fontSize: 12.5, color: 'var(--red)', fontWeight: 500 }}>
          🚨 URGENT — 12 produits MAPA Espagne expirent dans 6 jours — notifier les clients ES
        </p>
        <a href="/admin/pipeline" style={{ padding: '6px 14px', background: 'var(--red)', color: '#fff', borderRadius: 7, fontSize: 11.5, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Lancer pipeline →
        </a>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Clients actifs', val: activeClients || 0, icon: '👥', col: 'var(--ac)', sub: `${totalClients || 0} total` },
          { label: 'Alertes envoyées', val: totalAlerts || 0, icon: '📬', col: 'var(--blu)' },
          { label: 'Alertes critiques', val: criticalAlerts || 0, icon: '🚨', col: 'var(--red)' },
          { label: 'MRR estimé', val: `${mrr}€`, icon: '💶', col: 'var(--ora)', sub: 'mensuel récurrent' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${s.col},transparent)` }}/>
            <div style={{ position: 'absolute', right: 14, top: 14, fontSize: 20, opacity: .15 }}>{s.icon}</div>
            <p style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--tx3)', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 30, fontFamily: 'Syne,sans-serif', fontWeight: 800, color: 'var(--tx)' }}>{s.val}</p>
            {s.sub && <p style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 3 }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Plan distribution */}
        <div className="vf-card">
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--tx)' }}>Distribution des plans</h3>
          {PLANS.map(plan => {
            const count = planCounts[plan] || 0
            const pct = totalClients ? Math.round((count / totalClients) * 100) : 0
            return (
              <div key={plan} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11, color: PLAN_COLORS[plan] }}>{plan}</span>
                  <span style={{ color: 'var(--tx2)' }}>{count} clients · {pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--sf3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: PLAN_COLORS[plan], borderRadius: 3 }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick actions */}
        <div className="vf-card">
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--tx)' }}>Actions rapides</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: '🔄 Lancer le pipeline diff', href: '/admin/pipeline', col: 'var(--ac)' },
              { label: '👥 Gérer les clients', href: '/admin/clients', col: 'var(--blu)' },
              { label: '🗄️ Explorer les bases', href: '/admin/databases', col: 'var(--ora)' },
              { label: '🔔 Voir toutes les alertes', href: '/admin/alerts', col: 'var(--tx2)' },
              { label: '📊 Statistiques détaillées', href: '/admin/stats', col: 'var(--tx2)' },
            ].map(a => (
              <a key={a.href} href={a.href} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 8, fontSize: 13,
                background: 'var(--sf2)', border: '1px solid var(--bd)',
                color: a.col, textDecoration: 'none', transition: 'background .15s',
              }}>
                <span>{a.label}</span>
                <span style={{ color: 'var(--tx3)' }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
