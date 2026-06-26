'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGhostBid } from './actions'

export type AdminQuote = {
  id: string
  price_per_tonne: number
  total_price: number
  notes: string | null
  status: string
  ghost_bid: boolean
  ghost_supplier_name: string | null
}

export type AdminRequest = {
  id: string
  material_category: string
  quantity_tonnes: number
  delivery_postcode: string
  required_date: string
  status: string
  created_at: string
  quotes: AdminQuote[]
}

export default function RequestsClient({
  requests,
}: {
  requests: AdminRequest[]
}) {
  const [ghostFor, setGhostFor] = useState<AdminRequest | null>(null)

  if (requests.length === 0) {
    return (
      <div style={darkCard}>
        <p style={{ color: '#94A3B8' }}>No requests yet.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {requests.map((req) => (
        <div key={req.id} style={darkCard}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>
                {req.material_category} &middot; {req.quantity_tonnes} tonnes
              </div>
              <div
                style={{ color: '#94A3B8', fontSize: '14px', marginTop: '4px' }}
              >
                {req.delivery_postcode} &middot; required{' '}
                {new Date(req.required_date).toLocaleDateString('en-GB')}{' '}
                &middot; <span style={{ textTransform: 'capitalize' }}>
                  {req.status}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setGhostFor(req)}
              style={primaryButton}
            >
              Ghost bid
            </button>
          </div>

          <div
            style={{
              marginTop: '16px',
              borderTop: '1px solid #334155',
              paddingTop: '16px',
            }}
          >
            {req.quotes.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '14px' }}>No quotes.</p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {req.quotes.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      fontSize: '14px',
                      color: '#E2E8F0',
                    }}
                  >
                    <span>
                      &pound;{Number(q.total_price).toFixed(2)} (&pound;
                      {Number(q.price_per_tonne).toFixed(2)}/t)
                      {q.ghost_bid ? (
                        <span style={{ color: '#FBBF24' }}>
                          {' '}
                          &middot; ghost: {q.ghost_supplier_name}
                        </span>
                      ) : null}
                    </span>
                    <span
                      style={{ color: '#94A3B8', textTransform: 'capitalize' }}
                    >
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {ghostFor ? (
        <GhostBidModal
          request={ghostFor}
          onClose={() => setGhostFor(null)}
        />
      ) : null}
    </div>
  )
}

function GhostBidModal({
  request,
  onClose,
}: {
  request: AdminRequest
  onClose: () => void
}) {
  const router = useRouter()
  const [supplierName, setSupplierName] = useState('')
  const [pricePerTonne, setPricePerTonne] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const total = pricePerTonne
    ? Number(pricePerTonne) * Number(request.quantity_tonnes)
    : 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await createGhostBid({
      requestId: request.id,
      supplierName,
      pricePerTonne: Number(pricePerTonne),
    })
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '4px' }}>
          Add ghost bid
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '20px' }}>
          {request.material_category} &middot; {request.quantity_tonnes} tonnes
        </p>
        <form onSubmit={submit}>
          <label style={labelStyle}>Supplier name</label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            required
            style={inputStyle}
          />

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

          <div style={{ color: '#E2E8F0', marginBottom: '16px' }}>
            Total: &pound;{total.toFixed(2)}
          </div>

          {error ? (
            <p
              style={{ color: '#F87171', fontSize: '14px', marginBottom: '12px' }}
            >
              {error}
            </p>
          ) : null}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" disabled={loading} style={primaryButton}>
              {loading ? 'Adding...' : 'Add ghost bid'}
            </button>
            <button type="button" onClick={onClose} style={secondaryButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const darkCard: React.CSSProperties = {
  background: '#1E293B',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '20px 24px',
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  zIndex: 50,
}

const modal: React.CSSProperties = {
  width: '100%',
  maxWidth: '440px',
  background: '#0F172A',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '28px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: '6px',
  color: '#E2E8F0',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #334155',
  borderRadius: '8px',
  marginBottom: '16px',
  fontSize: '15px',
  color: '#E2E8F0',
  background: '#1E293B',
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
  background: 'transparent',
  color: '#E2E8F0',
  border: '1px solid #334155',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '15px',
  cursor: 'pointer',
}
