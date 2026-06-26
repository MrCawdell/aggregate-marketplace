'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type PriceRequest = {
  id: string
  material_category: string
  quantity_tonnes: number
  delivery_postcode: string
  required_date: string
  created_at: string
}

function outwardCode(postcode: string) {
  const trimmed = postcode.trim()
  if (trimmed.includes(' ')) return trimmed.split(/\s+/)[0].toUpperCase()
  if (trimmed.length > 3) return trimmed.slice(0, -3).toUpperCase()
  return trimmed.toUpperCase()
}

export default function MarketplacePage() {
  const [requests, setRequests] = useState<PriceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [quotingId, setQuotingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('price_requests')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <p style={{ color: '#64748B' }}>Loading marketplace...</p>
  }

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Marketplace</h1>

      {requests.length === 0 ? (
        <div style={cardStyle}>
          <p style={{ color: '#64748B' }}>No open requests right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map((req) => (
            <div key={req.id} style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                }}
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
                    Deliver to {outwardCode(req.delivery_postcode)} &middot;
                    required{' '}
                    {new Date(req.required_date).toLocaleDateString('en-GB')}
                  </div>
                </div>
                {quotingId === req.id ? null : (
                  <button
                    type="button"
                    onClick={() => setQuotingId(req.id)}
                    style={primaryButton}
                  >
                    Quote
                  </button>
                )}
              </div>

              {quotingId === req.id ? (
                <QuoteForm
                  request={req}
                  onCancel={() => setQuotingId(null)}
                  onDone={async () => {
                    setQuotingId(null)
                    await load()
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function QuoteForm({
  request,
  onCancel,
  onDone,
}: {
  request: PriceRequest
  onCancel: () => void
  onDone: () => void
}) {
  const [pricePerTonne, setPricePerTonne] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const total = pricePerTonne
    ? Number(pricePerTonne) * Number(request.quantity_tonnes)
    : 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error: insertError } = await supabase.from('quotes').insert({
      request_id: request.id,
      supplier_id: user.id,
      price_per_tonne: Number(pricePerTonne),
      total_price: total,
      notes: notes || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }
    onDone()
  }

  return (
    <form
      onSubmit={submit}
      style={{
        marginTop: '16px',
        borderTop: '1px solid #E2E8F0',
        paddingTop: '16px',
      }}
    >
      <label style={labelStyle}>Price per tonne (&pound;)</label>
      <input
        type="number"
        min="0"
        step="any"
        value={pricePerTonne}
        onChange={(e) => setPricePerTonne(e.target.value)}
        required
        style={inputStyle}
      />

      <div style={{ marginBottom: '16px', color: '#1E293B', fontWeight: 600 }}>
        Total: &pound;{total.toFixed(2)}{' '}
        <span style={{ color: '#94A3B8', fontWeight: 500, fontSize: '13px' }}>
          ({request.quantity_tonnes} tonnes)
        </span>
      </div>

      <label style={labelStyle}>Notes</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        style={{ ...inputStyle, resize: 'vertical' }}
      />

      {error ? (
        <p style={{ color: '#DC2626', fontSize: '14px', marginBottom: '12px' }}>
          {error}
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="submit" disabled={loading} style={primaryButton}>
          {loading ? 'Submitting...' : 'Submit Quote'}
        </button>
        <button type="button" onClick={onCancel} style={secondaryButton}>
          Cancel
        </button>
      </div>
    </form>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '20px 24px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: '6px',
  color: '#1E293B',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  marginBottom: '16px',
  fontSize: '15px',
  color: '#1E293B',
  background: '#ffffff',
}

const primaryButton: React.CSSProperties = {
  background: '#2563EB',
  color: '#ffffff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '15px',
  cursor: 'pointer',
  flexShrink: 0,
}

const secondaryButton: React.CSSProperties = {
  background: '#ffffff',
  color: '#1E293B',
  border: '1px solid #E2E8F0',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '15px',
  cursor: 'pointer',
}
