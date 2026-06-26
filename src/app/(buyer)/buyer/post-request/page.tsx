'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const MATERIALS = [
  'Crushed Stone',
  'Sand',
  'Gravel',
  'Limestone',
  'Granite',
  'Recycled Aggregate',
  'Topsoil',
  'Other',
]

export default function PostRequestPage() {
  const router = useRouter()
  const [materialCategory, setMaterialCategory] = useState(MATERIALS[0])
  const [quantity, setQuantity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [address, setAddress] = useState('')
  const [requiredDate, setRequiredDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error: insertError } = await supabase.from('price_requests').insert({
      buyer_id: user.id,
      material_category: materialCategory,
      quantity_tonnes: Number(quantity),
      delivery_postcode: postcode,
      delivery_address: address || null,
      required_date: requiredDate,
      notes: notes || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/buyer/my-requests')
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Post a Request</h1>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <label style={labelStyle}>Material category</label>
        <select
          value={materialCategory}
          onChange={(e) => setMaterialCategory(e.target.value)}
          style={inputStyle}
        >
          {MATERIALS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <label style={labelStyle}>Quantity (tonnes)</label>
        <input
          type="number"
          min="0"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={labelStyle}>Delivery postcode</label>
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={labelStyle}>Delivery address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Required date</label>
        <input
          type="date"
          value={requiredDate}
          onChange={(e) => setRequiredDate(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={labelStyle}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        {error ? (
          <p style={{ color: '#DC2626', fontSize: '14px', marginBottom: '12px' }}>
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={loading} style={primaryButton}>
          {loading ? 'Posting...' : 'Post Request'}
        </button>
      </form>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '28px',
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
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 600,
  fontSize: '16px',
  cursor: 'pointer',
}
