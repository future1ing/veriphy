'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props { role: 'client' | 'admin'; name: string; unread?: number }

const NAV = {
  client: [
    { href: '/dashboard',           icon: '⬡',  label: 'Tableau de bord' },
    { href: '/dashboard/alerts',    icon: '🔔', label: 'Alertes',       badge: true },
    { href: '/dashboard/profile',   icon: '🌿', label: 'Mes cultures' },
    { href: '/dashboard/pricing',   icon: '💳', label: 'Tarifs' },
  ],
  admin: [
    { href: '/admin',               icon: '⬡',  label: 'Dashboard' },
    { href: '/admin/alerts',        icon: '🔔', label: 'Alertes',       badge: true },
    { href: '/admin/clients',       icon: '👥', label: 'Clients' },
    { href: '/admin/databases',     icon: '🗄️', label: 'Bases données' },
    { href: '/admin/stats',         icon: '📊', label: 'Statistiques' },
    { href: '/admin/pipeline',      icon: '⚙️', label: 'Pipeline' },
    { href: '/admin/pricing',       icon: '💳', label: 'Tarifs' },
  ],
}

export default function Sidebar({ role, name, unread = 0 }: Props) {
  const path = usePathname()
  const router = useRouter()
  const nav = NAV[role]

  async function logout() {
    await createClient().auth.signOut()
    router.push('/login'); router.refresh()
  }

  return (
    <aside style={{
      width: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, bottom: 0, zIndex: 100, overflowY: 'auto',
      background: 'var(--sf)', borderRight: '1px solid var(--bd)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '20px 18px 16px' }}>
        <div style={{ width: 34, height: 34, background: 'var(--ac)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 18 18">
            <polygon points="9,1.5 15,5 15,13 9,16.5 3,13 3,5" fill="none" stroke="#0b0f0e" strokeWidth="1.3"/>
            <line x1="9" y1="1.5" x2="9" y2="16.5" stroke="#0b0f0e" strokeWidth=".9" opacity=".5"/>
            <line x1="3" y1="5" x2="15" y2="13" stroke="#0b0f0e" strokeWidth=".9" opacity=".5"/>
            <line x1="15" y1="5" x2="3" y2="13" stroke="#0b0f0e" strokeWidth=".9" opacity=".5"/>
            <circle cx="9" cy="9" r="2.5" fill="#0b0f0e"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 800, color: 'var(--tx)' }}>Veriphy</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 10px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', padding: '0 8px', margin: '8px 0 4px', color: 'var(--tx3)' }}>
          {role === 'admin' ? 'Administration' : 'Menu'}
        </p>
        {nav.map(item => {
          const active = path === item.href || (item.href.length > 7 && path.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
              borderRadius: 7, marginBottom: 1, fontSize: 13, textDecoration: 'none',
              background: active ? 'var(--acd)' : 'transparent',
              color: active ? 'var(--ac)' : 'var(--tx2)',
              fontWeight: active ? 500 : 400, transition: 'all .15s',
            }}>
              <span>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && unread > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: 'var(--red)', color: '#fff' }}>
                  {unread}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--bd)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--acd)', border: '1.5px solid var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--ac)', flexShrink: 0 }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
            <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{role === 'admin' ? 'Administrateur' : 'Client'}</div>
          </div>
          <button onClick={logout} style={{ padding: '4px 6px', background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', fontSize: 15, borderRadius: 5 }} title="Déconnexion">⏻</button>
        </div>
      </div>
    </aside>
  )
}
