import { createClient } from '@/lib/supabase/server'
import type { Alert } from '@/types'

const DB_COV = [
  { cc:'EU', flag:'🇪🇺', src:'EU Commission — MRL Database', prods:666,  recs:252445, col:'#60a5fa', status:'ok', sync:'2026-05-28' },
  { cc:'MA', flag:'🇲🇦', src:'ONSSA — Index Phytosanitaire',  prods:1335, recs:4645,   col:'#4ade80', status:'ok', sync:'2026-06-08' },
  { cc:'ES', flag:'🇪🇸', src:'MAPA — Registro Fitosanitarios',prods:3058, recs:1972,   col:'#fb923c', status:'warn', sync:'2026-06-08', warn:'408 produits expirent dans 90j' },
  { cc:'TR', flag:'🇹🇷', src:'EU Commission (export)',         prods:666,  recs:252445, col:'#a78bfa', status:'ok', sync:'2026-05-28' },
  { cc:'EG', flag:'🇪🇬', src:'MALR — Égypte',                 prods:0,    recs:0,      col:'#94a3b8', status:'pend', sync:'—' },
]

const SEV: Record<string, { color: string; label: string }> = {
  critical: { color: 'var(--red)', label: 'Critique' },
  warning:  { color: 'var(--ora)', label: 'Avertissement' },
  info:     { color: 'var(--blu)', label: 'Information' },
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: alerts }, { data: profile }] = await Promise.all([
    supabase.from('alerts').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(5) as any,
    supabase.from('profiles').select('plan, crops, name').eq('id', user.id).single(),
  ])

  const list: Alert[] = alerts || []
  const unread  = list.filter(a => !a.is_read).length
  const critical = list.filter(a => a.severity === 'critical').length

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.5px', color: 'var(--tx)' }}>
          Tableau de bord
        </h2>
        <p style={{ fontSize: 12, color: 'var(--tx2)', marginTop: 3 }}>
          Bonjour {profile?.name} · Plan {profile?.plan || 'free'} · 3 bases actives
        </p>
      </div>

      {/* Urgent banner */}
      <div style={{ background: 'var(--redd)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 12, padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 10 }}>
        <p style={{ fontSize: 12.5, color: 'var(--red)', fontWeight: 500 }}>
          🚨 URGENT — 12 produits espagnols expirent dans 6 jours (15/06/2026)
        </p>
        <a href="/dashboard/alerts" style={{ padding: '6px 14px', background: 'var(--red)', color: '#fff', borderRadius: 7, fontSize: 11.5, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Voir →
        </a>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Non lus', val: unread, icon: '🔔', col: 'var(--ac)' },
          { label: 'Critiques', val: critical, icon: '🚨', col: 'var(--red)' },
          { label: 'Total alertes', val: list.length, icon: '📋', col: 'var(--blu)' },
          { label: 'Pays couverts', val: 2, icon: '🌍', col: 'var(--ora)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.col}, transparent)` }}/>
            <div style={{ position: 'absolute', right: 14, top: 14, fontSize: 20, opacity: .15 }}>{s.icon}</div>
            <p style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--tx3)', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 30, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--tx)' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* DB Coverage */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--tx)' }}>Couverture bases de données</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {DB_COV.map(d => (
            <div key={d.cc} style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 12, padding: '13px 15px', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{d.flag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', marginBottom: 2 }}>{d.cc} — {d.src.split('—')[0].trim()}</div>
                <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 5 }}>{d.src}</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, flexWrap: 'wrap' }}>
                  {d.recs > 0 ? (
                    <>
                      <span style={{ color: 'var(--tx2)' }}><strong style={{ color: 'var(--tx)' }}>{d.prods.toLocaleString()}</strong> produits</span>
                      <span style={{ color: 'var(--tx2)' }}><strong style={{ color: 'var(--tx)' }}>{d.recs.toLocaleString()}</strong> enreg.</span>
                      <span style={{ color: 'var(--tx3)' }}>↻ {d.sync}</span>
                    </>
                  ) : <span style={{ color: 'var(--tx3)' }}>En attente</span>}
                </div>
                {'warn' in d && d.warn && <div style={{ fontSize: 10.5, color: 'var(--ora)', marginTop: 4 }}>⚠️ {d.warn}</div>}
                <div style={{ height: 3, background: 'var(--sf3)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: d.recs > 0 ? '100%' : '0%', background: d.col, borderRadius: 2 }}/>
                </div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 4, background: d.status === 'ok' ? 'var(--ac)' : d.status === 'warn' ? 'var(--ora)' : 'var(--tx3)' }}/>
            </div>
          ))}
        </div>
      </div>

      {/* Recent alerts */}
      <div className="vf-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--tx)' }}>Dernières alertes</h3>
          <a href="/dashboard/alerts" style={{ fontSize: 12, color: 'var(--ac)', textDecoration: 'none' }}>Voir tout →</a>
        </div>
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--tx2)' }}>
            <div style={{ fontSize: 36, opacity: .4, marginBottom: 10 }}>✅</div>
            <p>Aucune alerte pour vos cultures</p>
          </div>
        ) : list.map(a => {
          const sev = SEV[a.severity] || SEV.info
          return (
            <div key={a.id} style={{
              display: 'grid', gridTemplateColumns: '4px 1fr auto', gap: 11, alignItems: 'start',
              padding: '12px 14px', borderRadius: 7, marginBottom: 8,
              background: a.is_read ? 'var(--sf)' : 'var(--sf2)',
              borderLeft: `3px solid ${sev.color}`,
            }}>
              <div/>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', background: `${sev.color}22`, color: sev.color }}>{sev.label}</span>
                  <span style={{ fontSize: 10.5, padding: '2px 6px', borderRadius: 4, background: 'var(--sf3)', color: 'var(--tx3)' }}>{a.country}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>{a.substance_name}</span>
                  {!a.is_read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ac)' }}/>}
                </div>
                <p style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 4 }}>{a.description}</p>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--tx3)', flexWrap: 'wrap' }}>
                  {a.product_name && <span>🌿 {a.product_name}</span>}
                  {a.old_mrl && a.new_mrl && <span>{a.old_mrl} → <strong style={{ color: 'var(--ac)' }}>{a.new_mrl} mg/kg</strong></span>}
                  {a.regulation && <span>📋 {a.regulation}</span>}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--tx3)', whiteSpace: 'nowrap' }}>
                {new Date(a.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
