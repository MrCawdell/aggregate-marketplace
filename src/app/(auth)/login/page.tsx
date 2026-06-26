'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/admin-auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !data.user) {
      setError(signInError?.message ?? 'Unable to sign in')
      setLoading(false)
      return
    }

    if (isAdmin(data.user.email ?? '')) {
      router.push('/admin')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const role = profile?.role
    if (role === 'supplier') router.push('/supplier/dashboard')
    else if (role === 'admin') router.push('/admin')
    else router.push('/buyer/dashboard')
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome back</h1>
        <p style={{ color: '#64748B', marginBottom: '24px' }}>
          Sign in to your account
        </p>
        <form onSubmit={handleSubmit}>
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
            style={inputStyle}
          />
          {error ? (
            <p style={{ color: '#DC2626', fontSize: '14px', marginBottom: '12px' }}>
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '20px', color: '#64748B', fontSize: '14px' }}>
          Need an account?{' '}
          <Link href="/register" style={{ color: '#2563EB', fontWeight: 600 }}>
            Register
          </Link>
        </p>
      </div>
    </main>
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
  maxWidth: '420px',
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
