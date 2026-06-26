import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin-auth'

const links = [
  { label: 'Overview', href: '/admin' },
  { label: 'Requests', href: '/admin/requests' },
  { label: 'Members', href: '/admin/members' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!isAdmin(user.email ?? '')) redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A' }}>
      <Sidebar links={links} dark />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar companyName={user.email} dark />
        <main style={{ padding: '32px', flex: 1, color: '#E2E8F0' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
