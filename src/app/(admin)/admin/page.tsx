import { createServiceClient } from '@/lib/supabase/server'

type OrderFees = {
  platform_fee_buyer: number
  platform_fee_supplier: number
}

type RecentRequest = {
  id: string
  material_category: string
  quantity_tonnes: number
  delivery_postcode: string
  status: string
  created_at: string
}

export default async function AdminOverview() {
  const supabase = await createServiceClient()

  const [requests, quotes, orders, orderFees, recent] = await Promise.all([
    supabase
      .from('price_requests')
      .select('id', { count: 'exact', head: true }),
    supabase.from('quotes').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('platform_fee_buyer, platform_fee_supplier'),
    supabase
      .from('price_requests')
      .select(
        'id, material_category, quantity_tonnes, delivery_postcode, status, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const revenue = ((orderFees.data as OrderFees[] | null) ?? []).reduce(
    (sum, o) =>
      sum + Number(o.platform_fee_buyer) + Number(o.platform_fee_supplier),
    0
  )

  const stats = [
    { label: 'Total requests', value: String(requests.count ?? 0) },
    { label: 'Total quotes', value: String(quotes.count ?? 0) },
    { label: 'Total orders', value: String(orders.count ?? 0) },
    { label: 'Platform revenue', value: `£${revenue.toFixed(2)}` },
  ]

  const recentRequests = (recent.data as RecentRequest[] | null) ?? []

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px', color: '#ffffff' }}>
        Overview
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {stats.map((stat) => (
          <div key={stat.label} style={darkCard}>
            <div
              style={{ fontSize: '32px', fontWeight: 800, color: '#60A5FA' }}
            >
              {stat.value}
            </div>
            <div style={{ color: '#94A3B8', marginTop: '4px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={darkCard}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#ffffff' }}>
          Recent requests
        </h2>
        {recentRequests.length === 0 ? (
          <p style={{ color: '#94A3B8' }}>No requests yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8' }}>
                <th style={thStyle}>Material</th>
                <th style={thStyle}>Quantity</th>
                <th style={thStyle}>Postcode</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Posted</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #1E293B' }}>
                  <td style={tdStyle}>{r.material_category}</td>
                  <td style={tdStyle}>{r.quantity_tonnes} t</td>
                  <td style={tdStyle}>{r.delivery_postcode}</td>
                  <td style={{ ...tdStyle, textTransform: 'capitalize' }}>
                    {r.status}
                  </td>
                  <td style={tdStyle}>
                    {new Date(r.created_at).toLocaleDateString('en-GB')}
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
