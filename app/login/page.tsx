'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const L = {
  fr: { tag:'Veille réglementaire pesticides', btn:'Se connecter', em:'Email', pw:'Mot de passe', noAcc:'Pas de compte ?', create:'Créer un accès', err:'Email ou mot de passe incorrect.' },
  ar: { tag:'مراقبة تنظيم المبيدات', btn:'دخول', em:'البريد', pw:'كلمة المرور', noAcc:'لا حساب ؟', create:'إنشاء حساب', err:'بريد أو كلمة مرور غير صحيحة.' },
  es: { tag:'Vigilancia regulatoria de pesticidas', btn:'Entrar', em:'Correo', pw:'Contraseña', noAcc:'¿Sin cuenta?', create:'Crear acceso', err:'Email o contraseña incorrectos.' },
  en: { tag:'Pesticide regulatory monitoring', btn:'Sign in', em:'Email', pw:'Password', noAcc:'No account?', create:'Create access', err:'Invalid email or password.' },
} as const

type Lang = keyof typeof L

export default function LoginPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('fr')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const t = L[lang]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = await createClient()
    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    })
    if (authErr || !data.user) { setError(t.err); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    router.push(profile?.role === 'admin' ? '/admin' : '/dashboard')
    router.refresh()
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,222,128,.08), transparent 70%), var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 20, padding: '2.75rem' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 42, height: 42, background: 'var(--ac)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 22 22">
              <polygon points="11,2 18,6.5 18,15.5 11,20 4,15.5 4,6.5" fill="none" stroke="#0b0f0e" strokeWidth="1.5"/>
              <line x1="11" y1="2" x2="11" y2="20" stroke="#0b0f0e" strokeWidth="1" opacity=".5"/>
              <line x1="4" y1="6.5" x2="18" y2="15.5" stroke="#0b0f0e" strokeWidth="1" opacity=".5"/>
              <line x1="18" y1="6.5" x2="4" y2="15.5" stroke="#0b0f0e" strokeWidth="1" opacity=".5"/>
              <circle cx="11" cy="11" r="3" fill="#0b0f0e"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--tx)' }}>Veriphy</div>
            <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{t.tag}</div>
          </div>
        </div>

        {/* Lang */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 22, flexWrap: 'wrap' }}>
          {(['fr','ar','es','en'] as Lang[]).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: '3px 10px', borderRadius: 20, border: '1px solid',
              borderColor: lang === l ? 'var(--ac)' : 'var(--bd)',
              background: lang === l ? 'var(--acd)' : 'transparent',
              color: lang === l ? 'var(--ac)' : 'var(--tx2)', fontSize: 11, cursor: 'pointer',
            }}>
              {l === 'fr' ? '🇫🇷 FR' : l === 'ar' ? '🇲🇦 AR' : l === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11.5, color: 'var(--tx2)', marginBottom: 5, fontWeight: 500 }}>{t.em}</label>
            <input className="vf-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemple.com" required/>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11.5, color: 'var(--tx2)', marginBottom: 5, fontWeight: 500 }}>{t.pw}</label>
            <input className="vf-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required/>
          </div>
          {error && <p style={{ fontSize: 12, color: 'var(--red)' }}>{error}</p>}
          <button className="vf-btn" type="submit" disabled={loading} style={{ marginTop: 2 }}>
            {loading ? '...' : t.btn}
          </button>
        </form>

        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--tx3)' }}>
          {t.noAcc}{' '}
          <a href="/register" style={{ color: 'var(--ac)', textDecoration: 'underline' }}>{t.create}</a>
        </p>
      </div>
    </div>
  )
}

