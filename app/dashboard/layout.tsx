import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('name, role').eq('id', user.id).single()
  if (profile?.role === 'admin') redirect('/admin')

  const { count: unread } = await supabase
    .from('alerts').select('*', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('is_read', false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="client" name={profile?.name || 'Client'} unread={unread || 0} />
      <main style={{ marginLeft: 240, flex: 1, padding: '28px 32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
