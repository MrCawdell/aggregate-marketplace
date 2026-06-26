'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function TopBar({
  companyName,
  dark = false,
}: {
  companyName?: string | null
  dark?: boolean
}) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const bg = dark ? '#0F172A' : '#ffffff'
  const border = dark ? '#1E293B' : '#E2E8F0'
  const text = dark ? '#ffffff' : '#1E293B'

  return (
    <header
      style={{
        height: '64px',
        background: bg,
        borderBottom: `1px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      <span style={{ fontWeight: 600, fontSize: '15px', color: text }}>
        {companyName || 'My account'}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        style={{
          background: '#2563EB',
          color: '#ffffff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </header>
  )
}
