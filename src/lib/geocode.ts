// Utility to convert UK postcode to lat/lng using postcodes.io
export async function geocodePostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const clean = postcode.replace(/\s/g, '').toUpperCase()
    const res = await fetch(`https://api.postcodes.io/postcodes/${clean}`)
    const data = await res.json()
    if (data.status !== 200) return null
    return { lat: data.result.latitude, lng: data.result.longitude }
  } catch { return null }
}

// Calculate straight-line distance between two lat/lng points in miles
export function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// Calculate delivered price: ex_works + (distance * rate_per_mile * quantity)
export function calculateDeliveredPrice(
  exWorksPerTonne: number,
  quantity: number,
  distanceMi: number,
  ratePerMile: number,
  bulkThreshold?: number | null,
  bulkPrice?: number | null
): number {
  const effectivePrice = (bulkThreshold && bulkPrice && quantity >= bulkThreshold)
    ? bulkPrice
    : exWorksPerTonne
  const materialCost = effectivePrice * quantity
  const deliveryCost = distanceMi * ratePerMile * quantity
  const subtotal = materialCost + deliveryCost
  return Math.round(subtotal * 100) / 100
}
