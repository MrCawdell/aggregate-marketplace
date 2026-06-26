import { createServiceClient } from '@/lib/supabase/server'

type Profile = {
  id: string
  email: string
  role: string
  company_name: string | null
  phone: string | null
  created_at: string
}

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  buyer: { bg: '#1E3A8A', color: '#BFDBFE' },
  supplier: { bg: '#064E3B', color: '#A7F3D0' },
  admin: { bg: '#4C1D95', color: '#DDD6FE' },
}

function RoleBadge({ role }: { role: string }) {
  const c = ROLE_COLORS[role] ?? { bg: '#334155', color: '#94A3B8' }
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'capitalize',
      }}
    >
      {role}
    </span>
  )
}

export default async function AdminMembers() {
  const supabase = await createServiceClient()

  const { data: profileData } = await supabase.from('profiles').select('*')
  const profiles = (profileData as Profile[] | null) ?? []
  const profileById = new Map(profiles.map((p) => [p.id, p]))

  const { data: userList } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  })

  const rows = (userList?.users ?? []).map((u) => {
    const profile = profileById.get(u.id)
    return {
      id: u.id,
      email: profile?.email ?? u.email ?? '',
      role: profile?.role ?? '—',
      company: profile?.company_name ?? '—',
      phone: profile?.phone ?? '—',
      joined: profile?.created_at ?? u.created_at,
    }
  })

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px', color: '#ffffff' }}>
        Members
      </h1>

      <div style={darkCard}>
        {rows.length === 0 ? (
          <p style={{ color: '#94A3B8' }}>No members yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8' }}>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #1E293B' }}>
                  <td style={tdStyle}>{r.email}</td>
                  <td style={tdStyle}>
                    {r.role === '—' ? '—' : <RoleBadge role={r.role} />}
                  </td>
                  <td style={tdStyle}>{r.company}</td>
                  <td style={tdStyle}>{r.phone}</td>
                  <td style={tdStyle}>
                    {r.joined
                      ? new Date(r.joined).toLocaleDateString('en-GB')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const darkCard: React.CSSProperties = {
  background: '#1E293B',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '24px',
}

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  fontWeight: 600,
}

const tdStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
  color: '#E2E8F0',
}
