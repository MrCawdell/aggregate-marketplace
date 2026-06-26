import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/buyer', '/supplier', '/admin'] as const

function dashboardFor(role: string | undefined) {
  if (role === 'buyer') return '/buyer/dashboard'
  if (role === 'supplier') return '/supplier/dashboard'
  if (role === 'admin') return '/admin'
  return '/login'
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const matched = PROTECTED_PREFIXES.find(
    (prefix) => path === prefix || path.startsWith(prefix + '/')
  )

  if (matched) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role as string | undefined
    const expected = matched.slice(1)

    if (role !== expected) {
      const url = request.nextUrl.clone()
      url.pathname = dashboardFor(role)
      return NextResponse.redirect(url)
    }
  }

  return response
}

export { proxy as middleware }

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
