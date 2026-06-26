import { createServiceClient } from '@/lib/supabase/server'
import RequestsClient, { type AdminRequest } from './RequestsClient'

export default async function AdminRequests() {
  const supabase = await createServiceClient()

  const { data } = await supabase
    .from('price_requests')
    .select(
      'id, material_category, quantity_tonnes, delivery_postcode, required_date, status, created_at, quotes(id, price_per_tonne, total_price, notes, status, ghost_bid, ghost_supplier_name)'
    )
    .order('created_at', { ascending: false })

  const requests = (data as AdminRequest[] | null) ?? []

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px', color: '#ffffff' }}>
        Requests
      </h1>
      <RequestsClient requests={requests} />
    </div>
  )
}
