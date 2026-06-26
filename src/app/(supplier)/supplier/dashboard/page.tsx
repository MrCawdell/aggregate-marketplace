import { createClient } from '@/lib/supabase/server'

export default async function SupplierDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const supplierId = user?.id ?? ''

  const [submitted, accepted, orders] = await Promise.all([
    supabase
      .from('quotes')
      .select('id', { count: 'exact', head: true })
      .eq('supplier_id', supplierId),
    supabase
      .from('quotes')
      .select('id', { count: 'exact', head: true })
      .eq('supplier_id', supplierId)
      .eq('status', 'accepted'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('supplier_id', supplierId),
  ])

  const stats = [
    { label: 'Quotes submitted', value: submitted.count ?? 0 },
    { label: 'Quotes accepted', value: accepted.count ?? 0 },
    { label: 'Orders to fulfil', value: orders.count ?? 0 },
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
          Win more business
        </h2>
        <p style={{ color: '#64748B', lineHeight: 1.6 }}>
          Browse open price requests in the Marketplace and submit competitive
          quotes. Track their status under My Quotes.
        </p>
      </div>
    </div>
  )
}
