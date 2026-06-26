import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { createClient } from '@/lib/supabase/server'

const links = [
  { label: 'Dashboard', href: '/buyer/dashboard' },
  { label: 'Post a Request', href: '/buyer/post-request' },
  { label: 'My Requests', href: '/buyer/my-requests' },
]

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9' }}>
      <Sidebar links={links} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar companyName={profile?.company_name} />
        <main style={{ padding: '32px', flex: 1 }}>{children}</main>
      </div>
    </div>
  )
}
