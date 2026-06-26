'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Role = 'buyer' | 'supplier'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('buyer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Unable to create account')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      role,
      company_name: companyName,
      phone,
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    if (role === 'supplier') router.push('/supplier/dashboard')
    else router.push('/buyer/dashboard')
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Create account</h1>
        <p style={{ color: '#64748B', marginBottom: '24px' }}>
          Join the aggregate marketplace
        </p>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>I am a</label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <RoleCard
              label="Buyer"
              description="I need aggregates delivered"
              active={role === 'buyer'}
              onClick={() => setRole('buyer')}
            />
            <RoleCard
              label="Supplier"
              description="I supply and deliver aggregates"
              active={role === 'supplier'}
              onClick={() => setRole('supplier')}
            />
          </div>

          <label style={labelStyle}>Company name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />

          {error ? (
            <p style={{ color: '#DC2626', fontSize: '14px', marginBottom: '12px' }}>
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '20px', color: '#64748B', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#2563EB', fontWeight: 600 }}>
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}

function RoleCard({
  label,
  description,
  active,
  onClick,
}: {
  label: string
  description: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        textAlign: 'left',
        padding: '14px',
        borderRadius: '12px',
        border: active ? '2px solid #2563EB' : '1px solid #E2E8F0',
        background: active ? '#EFF6FF' : '#ffffff',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '15px', color: '#1E293B' }}>
        {label}
      </div>
      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
        {description}
      </div>
    </button>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: '#F1F5F9',
}

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '460px',
  background: '#ffffff',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '32px',
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
  width: '100%',
  background: '#2563EB',
  color: '#ffffff',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 600,
  fontSize: '16px',
  cursor: 'pointer',
}
