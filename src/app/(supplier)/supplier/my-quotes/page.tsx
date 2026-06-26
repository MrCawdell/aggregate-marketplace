'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type RequestDetail = {
  material_category: string
  quantity_tonnes: number
  delivery_postcode: string
  required_date: string
}

type QuoteRow = {
  id: string
  price_per_tonne: number
  total_price: number
  notes: string | null
  status: string
  created_at: string
  price_requests: RequestDetail | null
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#FEF3C7', color: '#B45309' },
  accepted: { bg: '#DCFCE7', color: '#15803D' },
  rejected: { bg: '#FEE2E2', color: '#B91C1C' },
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: '#E2E8F0', color: '#64748B' }
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
      {status}
    </span>
  )
}

export default function MyQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('quotes')
        .select(
          '*, price_requests(material_category, quantity_tonnes, delivery_postcode, required_date)'
        )
        .eq('supplier_id', user.id)
        .order('created_at', { ascending: false })

      setQuotes((data as QuoteRow[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <p style={{ color: '#64748B' }}>Loading quotes...</p>
  }

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>My Quotes</h1>

      {quotes.length === 0 ? (
        <div style={cardStyle}>
          <p style={{ color: '#64748B' }}>
            You have not submitted any quotes yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {quotes.map((q) => {
            const req = q.price_requests
            return (
              <div
                key={q.id}
                style={{
                  ...cardStyle,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>
                    {req
                      ? `${req.material_category} · ${req.quantity_tonnes} tonnes`
                      : 'Request'}
                  </div>
                  <div
                    style={{
                      color: '#64748B',
                      fontSize: '14px',
                      marginTop: '4px',
                    }}
                  >
                    &pound;{Number(q.total_price).toFixed(2)} total &middot; &pound;
                    {Number(q.price_per_tonne).toFixed(2)}/tonne
                    {req
                      ? ` · required ${new Date(
                          req.required_date
                        ).toLocaleDateString('en-GB')}`
                      : ''}
                  </div>
                  {q.notes ? (
                    <div
                      style={{
                        color: '#94A3B8',
                        fontSize: '13px',
                        marginTop: '4px',
                      }}
                    >
                      {q.notes}
                    </div>
                  ) : null}
                </div>
                <StatusBadge status={q.status} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '20px 24px',
}
