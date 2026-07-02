export const PLATFORM_FEE_PERCENT = 0.035 // 3.5%
export const DEFAULT_DELIVERY_RADIUS_MILES = 50
export const REQUIREMENT_NOTIFICATION_RADIUS_MILES = 50

export const MATERIAL_TYPES = [
  'Crushed Stone',
  'Sand',
  'Gravel',
  'Limestone',
  'Granite',
  'Recycled Aggregate',
  'Topsoil',
  'Sharp Sand',
  'Ballast',
  'MOT Type 1',
  'Other',
] as const

export const MATERIAL_DENSITIES: Record<string, number> = {
  'Crushed Stone': 1.5,
  'Sand': 1.6,
  'Gravel': 1.5,
  'Limestone': 1.7,
  'Granite': 1.65,
  'Recycled Aggregate': 1.3,
  'Topsoil': 0.9,
  'Sharp Sand': 1.6,
  'Ballast': 1.5,
  'MOT Type 1': 1.5,
  'Other': 1.5,
}
