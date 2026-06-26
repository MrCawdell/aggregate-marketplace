import { createClient } from '@/lib/supabase/server'

export default async function BuyerDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const buyerId = user?.id ?? ''

  const [requests, quotes, orders] = await Promise.all([
    supabase
      .from('price_requests')
      .select('id', { count: 'exact', head: true })
      .eq('buyer_id', buyerId),
    supabase.from('quotes').select('id', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('buyer_id', buyerId),
  ])

  const stats = [
    { label: 'Requests posted', value: requests.count ?? 0 },
    { label: 'Quotes received', value: quotes.count ?? 0 },
    { label: 'Orders placed', value: orders.count ?? 0 },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#2563EB' }}>
              {stat.value}
            </div>
            <div style={{ color: '#64748B', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '28px',
        }}
      >
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>
          Welcome to AggregateMarketplace
        </h2>
        <p style={{ color: '#64748B', lineHeight: 1.6 }}>
          Post a price request and let verified suppliers compete for your
          business. Compare quotes side by side and accept the best deal &mdash;
          delivered straight to your site.
        </p>
      </div>
    </div>
  )
}
