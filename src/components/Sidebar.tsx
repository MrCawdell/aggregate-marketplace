'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type SidebarLink = {
  label: string
  href: string
}

export default function Sidebar({
  links,
  dark = false,
}: {
  links: SidebarLink[]
  dark?: boolean
}) {
  const pathname = usePathname()

  const bg = dark ? '#0F172A' : '#ffffff'
  const border = dark ? '#1E293B' : '#E2E8F0'
  const idle = dark ? '#94A3B8' : '#64748B'

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        background: bg,
        borderRight: `1px solid ${border}`,
        padding: '24px 16px',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontWeight: 800,
          fontSize: '18px',
          color: dark ? '#ffffff' : '#1E293B',
          padding: '0 8px 24px',
        }}
      >
        AggregateMarketplace
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: active ? 700 : 500,
                color: active ? '#ffffff' : idle,
                background: active ? '#2563EB' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
