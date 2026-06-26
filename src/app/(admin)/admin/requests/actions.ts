'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin-auth'

export async function createGhostBid(input: {
  requestId: string
  supplierName: string
  pricePerTonne: number
}): Promise<{ error?: string }> {
  // Server Actions are public endpoints — verify the caller is an admin.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email ?? '')) {
    return { error: 'Not authorised' }
  }

  if (!input.supplierName.trim() || !Number.isFinite(input.pricePerTonne)) {
    return { error: 'Invalid input' }
  }

  const service = await createServiceClient()

  const { data: request, error: reqError } = await service
    .from('price_requests')
    .select('quantity_tonnes')
    .eq('id', input.requestId)
    .single()

  if (reqError || !request) {
    return { error: 'Request not found' }
  }

  const total = input.pricePerTonne * Number(request.quantity_tonnes)

  const { error: insertError } = await service.from('quotes').insert({
    request_id: input.requestId,
    supplier_id: null,
    price_per_tonne: input.pricePerTonne,
    total_price: total,
    ghost_bid: true,
    ghost_supplier_name: input.supplierName.trim(),
  })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/admin/requests')
  return {}
}
