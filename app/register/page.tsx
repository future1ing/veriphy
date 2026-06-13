'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = await createClient()
    const { error: authErr } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name } },
    })
    if (authErr) { setError(authErr.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,222,128,.08), transparent 70%), var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 20, padding: '2.75rem' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--tx)', marginBottom: 6 }}>Créer un compte</div>
        <p style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 22 }}>Accès gratuit — plan Free, sans carte bancaire.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Nom complet / Entreprise', val: name, set: setName, type: 'text', ph: 'Ferme El Ouali' },
            { label: 'Email', val: email, set: setEmail, type: 'email', ph: 'email@exemple.com' },
            { label: 'Mot de passe', val: password, set: setPassword, type: 'password', ph: '••••••••' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: 11.5, color: 'var(--tx2)', marginBottom: 5, fontWeight: 500 }}>{f.label}</label>
              <input className="vf-input" type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} required minLength={f.type === 'password' ? 6 : 1}/>
            </div>
          ))}
          {error && <p style={{ fontSize: 12, color: 'var(--red)' }}>{error}</p>}
          <button className="vf-btn" type="submit" disabled={loading} style={{ marginTop: 2 }}>
            {loading ? '...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--tx3)' }}>
          Déjà un compte ?{' '}
          <a href="/login" style={{ color: 'var(--ac)', textDecoration: 'underline' }}>Se connecter</a>
        </p>
      </div>
    </div>
  )
}

