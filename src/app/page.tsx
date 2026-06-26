import Link from 'next/link'

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#F1F5F9',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '560px' }}>
        <h1 style={{ fontSize: '48px', lineHeight: 1.1, marginBottom: '16px' }}>
          AggregateMarketplace
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: '#64748B',
            marginBottom: '32px',
          }}
        >
          Get competitive quotes on aggregates, delivered to your door
        </p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/login"
            style={{
              background: '#2563EB',
              color: '#ffffff',
              padding: '12px 28px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '16px',
            }}
          >
            Login
          </Link>
          <Link
            href="/register"
            style={{
              background: '#ffffff',
              color: '#1E293B',
              padding: '12px 28px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '16px',
              border: '1px solid #E2E8F0',
            }}
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  )
}
