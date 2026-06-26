'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type PriceRequest = {
  id: string
  material_category: string
  quantity_tonnes: number
  delivery_postcode: string
  required_date: string
  status: string
  created_at: string
}

type Quote = {
  id: string
  request_id: string
  price_per_tonne: number
  total_price: number
  notes: string | null
  status: string
  supplier_id: string | null
  ghost_supplier_name: string | null
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open: { bg: '#DBEAFE', color: '#1D4ED8' },
  quoted: { bg: '#FEF3C7', color: '#B45309' },
  accepted: { bg: '#DCFCE7', color: '#15803D' },
  paid: { bg: '#DCFCE7', color: '#15803D' },
  delivered: { bg: '#E0E7FF', color: '#4338CA' },
  cancelled: { bg: '#FEE2E2', color: '#B91C1C' },
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

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<PriceRequest[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: reqs } = await supabase
      .from('price_requests')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })

    const requestList = reqs ?? []
    setRequests(requestList)

    if (requestList.length > 0) {
      const { data: qs } = await supabase
        .from('quotes')
        .select('*')
        .in(
          'request_id',
          requestList.map((r) => r.id)
        )
      setQuotes(qs ?? [])
    } else {
      setQuotes([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function acceptQuote(quote: Quote, request: PriceRequest) {
    setBusy(quote.id)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const total = Number(quote.total_price)
    const buyerPrice = total * 1.03
    const feeBuyer = total * 0.03
    const feeSupplier = total * 0.03
    const payout = total * 0.97

    await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quote.id)
    await supabase
      .from('price_requests')
      .update({ status: 'accepted' })
      .eq('id', request.id)
    await supabase.from('orders').insert({
      request_id: request.id,
      quote_id: quote.id,
      buyer_id: user.id,
      supplier_id: quote.supplier_id,
      supplier_price: total,
      buyer_price: buyerPrice,
      platform_fee_buyer: feeBuyer,
      platform_fee_supplier: feeSupplier,
      supplier_payout: payout,
    })

    setBusy(null)
    await load()
  }

  if (loading) {
    return <p style={{ color: '#64748B' }}>Loading requests...</p>
  }

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>My Requests</h1>

      {requests.length === 0 ? (
        <div style={cardStyle}>
          <p style={{ color: '#64748B' }}>
            You have not posted any requests yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map((req) => {
            const reqQuotes = quotes.filter((q) => q.request_id === req.id)
            const isOpen = expanded === req.id
            return (
              <div key={req.id} style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpanded(isOpen ? null : req.id)}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>
                      {req.material_category} &middot; {req.quantity_tonnes} tonnes
                    </div>
                    <div
                      style={{
                        color: '#64748B',
                        fontSize: '14px',
                        marginTop: '4px',
                      }}
                    >
                      {req.delivery_postcode} &middot; required{' '}
                      {new Date(req.required_date).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    <span style={{ color: '#64748B', fontSize: '14px' }}>
                      {reqQuotes.length} quote{reqQuotes.length === 1 ? '' : 's'}
                    </span>
                    <StatusBadge status={req.status} />
                    <span style={{ color: '#94A3B8' }}>{isOpen ? '−' : '+'}</span>
                  </div>
                </div>

                {isOpen ? (
                  <div
                    style={{
                      marginTop: '16px',
                      borderTop: '1px solid #E2E8F0',
                      paddingTop: '16px',
                    }}
                  >
                    {reqQuotes.length === 0 ? (
                      <p style={{ color: '#64748B', fontSize: '14px' }}>
                        No quotes yet.
                      </p>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        {reqQuotes.map((q) => {
                          const accepted = q.status === 'accepted'
                          const supplierLabel = accepted
                            ? q.ghost_supplier_name || 'Supplier'
                            : 'Hidden until accepted'
                          return (
                            <div
                              key={q.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '16px',
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                padding: '14px',
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 700 }}>
                                  &pound;{Number(q.total_price).toFixed(2)}{' '}
                                  <span
                                    style={{
                                      fontWeight: 500,
                                      color: '#64748B',
                                      fontSize: '13px',
                                    }}
                                  >
                                    (&pound;{Number(q.price_per_tonne).toFixed(2)}
                                    /tonne)
                                  </span>
                                </div>
                                <div
                                  style={{
                                    color: '#94A3B8',
                                    fontSize: '13px',
                                    marginTop: '2px',
                                  }}
                                >
                                  {supplierLabel}
                                  {q.notes ? ` — ${q.notes}` : ''}
                                </div>
                              </div>
                              {accepted ? (
                                <StatusBadge status="accepted" />
                              ) : req.status === 'open' || req.status === 'quoted' ? (
                                <button
                                  type="button"
                                  onClick={() => acceptQuote(q, req)}
                                  disabled={busy === q.id}
                                  style={acceptButton}
                                >
                                  {busy === q.id ? 'Accepting...' : 'Accept'}
                                </button>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : null}
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

const acceptButton: React.CSSProperties = {
  background: '#2563EB',
  color: '#ffffff',
  border: 'none',
  padding: '8px 18px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
  flexShrink: 0,
}
