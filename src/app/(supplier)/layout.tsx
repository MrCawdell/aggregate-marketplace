import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { createClient } from '@/lib/supabase/server'

const links = [
  { label: 'Dashboard', href: '/supplier/dashboard' },
  { label: 'Marketplace', href: '/supplier/marketplace' },
  { label: 'My Quotes', href: '/supplier/my-quotes' },
]

export default async function SupplierLayout({
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
