import { createServiceClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'

// Re-engagement cron: nudges hauliers (suppliers) who haven't logged in for a
// while back to the load board. Scheduled daily at 10:00 UTC (11am UK) via
// vercel.json. Gated by CRON_SECRET — fails closed if the secret is unset.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'TipperLink <noreply@tipperlink.co.uk>'

function firstNameFor(meta: Record<string, unknown> | undefined): string {
  const raw =
    (meta?.first_name as string | undefined) ||
    (meta?.full_name as string | undefined) ||
    (meta?.name as string | undefined) ||
    ''
  return String(raw).trim().split(/\s+/)[0] || 'there'
}

function emailHtml(firstName: string, loadBoardUrl: string): string {
  return `<div style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.5; color: #1E293B;">
  <p>Hi ${firstName},</p>
  <p>It's been a while since you logged in to TipperLink.</p>
  <p>There are loads on the board right now that need hauliers. New jobs get posted daily and the hauliers quoting regularly are the ones winning work.</p>
  <p>It's free to browse and bid. You only pay a small fee when you secure a job.</p>
  <p style="margin: 28px 0;">
    <a href="${loadBoardUrl}" style="display: inline-block; background: #2563EB; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">View the Load Board</a>
  </p>
  <p style="margin-bottom: 0;">Danny</p>
  <p style="margin-top: 0; color: #64748B;">TipperLink</p>
</div>`
}

function emailText(firstName: string, loadBoardUrl: string): string {
  return `Hi ${firstName},

It's been a while since you logged in to TipperLink.

There are loads on the board right now that need hauliers. New jobs get posted daily and the hauliers quoting regularly are the ones winning work.

It's free to browse and bid. You only pay a small fee when you secure a job.

View the Load Board: ${loadBoardUrl}

Danny
TipperLink`
}

export async function GET(request: Request) {
  // Gate on CRON_SECRET — fail closed if it is missing.
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = await createServiceClient()

  // Map profile id -> role so we only email hauliers (suppliers).
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
  if (profileError) {
    return Response.json({ error: profileError.message }, { status: 500 })
  }
  const roleById = new Map(
    (profileData ?? []).map((p: { id: string; role: string }) => [p.id, p.role])
  )

  const { data: userList, error: usersError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  })
  if (usersError) {
    return Response.json({ error: usersError.message }, { status: 500 })
  }

  const loadBoardUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/supplier/marketplace`
  const cutoff = Date.now() - FIVE_DAYS_MS

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const user of userList?.users ?? []) {
    // Hauliers only.
    if (roleById.get(user.id) !== 'supplier') {
      skipped++
      continue
    }

    const to = user.email
    if (!to) {
      skipped++
      continue
    }

    // Send only if never logged in, or last login is more than 5 days ago.
    const lastSignIn = user.last_sign_in_at
    const isDormant = !lastSignIn || new Date(lastSignIn).getTime() < cutoff
    if (!isDormant) {
      skipped++
      continue
    }

    const firstName = firstNameFor(user.user_metadata)

    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: "Have you seen what's on TipperLink lately?",
        html: emailHtml(firstName, loadBoardUrl),
        text: emailText(firstName, loadBoardUrl),
      })
      if (error) {
        failed++
      } else {
        sent++
      }
    } catch {
      failed++
    }
  }

  return Response.json({ ok: true, sent, skipped, failed })
}
