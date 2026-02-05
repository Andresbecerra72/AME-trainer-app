/**
 * Types for topic management by AME rating
 * Based on TC Study Reference Guide structure
 */

export type Rating = "M" | "E" | "S"

export interface RatingInfo {
  id: Rating
  name: string
  fullName: string
  description: string
  icon: string
  color: string
  categories: Category[]
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  ratingId: Rating
}

export interface TopicFormData {
  name: string
  description: string
  code: string
  icon: string
  ratingId: Rating
  categoryId: string
}

export interface TopicBatchInput {
  topics: TopicFormData[]
}

/**
 * M Rating (Maintenance) Categories
 */
export const M_CATEGORIES: Category[] = [
  {
    id: "SPM",
    name: "Standard Practices",
    description: "Basic maintenance practices, mathematics, physics, and general knowledge",
    icon: "wrench",
    ratingId: "M",
  },
  {
    id: "AF",
    name: "Airframe",
    description: "Aircraft structures, systems, and components",
    icon: "box",
    ratingId: "M",
  },
  {
    id: "PP",
    name: "Powerplant",
    description: "Engines, propulsion systems, and related components",
    icon: "fan",
    ratingId: "M",
  },
]

/**
 * E Rating (Electronics/Avionics) Categories
 */
export const E_CATEGORIES: Category[] = [
  {
    id: "SPE",
    name: "Standard Practices Avionics",
    description: "Electrical theory, electronics, wiring, and avionics systems",
    icon: "cpu",
    ratingId: "E",
  },
  {
    id: "AV",
    name: "Avionics",
    description: "Navigation, communication, and flight control systems",
    icon: "satellite-dish",
    ratingId: "E",
  },
]

/**
 * S Rating (Structures) Categories
 */
export const S_CATEGORIES: Category[] = [
  {
    id: "SPS",
    name: "Standard Practices Structures",
    description: "Aerodinamics, materials, and structural repair techniques",
    icon: "layers",
    ratingId: "S",
  },
  {
    id: "ST",
    name: "Structures",
    description: "Aircraft structures, sheet metal, composites, and corrosion control",
    icon: "layers",
    ratingId: "S",
  },
]

/**
 * All ratings with their metadata
 */
export const RATINGS: RatingInfo[] = [
  {
    id: "M",
    name: "M Rating",
    fullName: "Maintenance",
    description: "Aircraft Maintenance Engineer - Maintenance category",
    icon: "wrench",
    color: "from-blue-500 to-cyan-500",
    categories: M_CATEGORIES,
  },
  {
    id: "E",
    name: "E Rating",
    fullName: "Electronics",
    description: "Aircraft Maintenance Engineer - Electronics/Avionics category",
    icon: "cpu",
    color: "from-purple-500 to-pink-500",
    categories: E_CATEGORIES,
  },
  {
    id: "S",
    name: "S Rating",
    fullName: "Structures",
    description: "Aircraft Maintenance Engineer - Structures category",
    icon: "layers",
    color: "from-orange-500 to-red-500",
    categories: S_CATEGORIES,
  },
]

/**
 * Helper to get rating info by ID
 */
export function getRatingById(ratingId: Rating): RatingInfo | undefined {
  return RATINGS.find((r) => r.id === ratingId)
}

/**
 * Helper to get category by ID and rating
 */
export function getCategoryById(
  ratingId: Rating,
  categoryId: string
): Category | undefined {
  const rating = getRatingById(ratingId)
  return rating?.categories.find((c) => c.id === categoryId)
}

/**
 * Generate topic code
 */
export function generateTopicCode(
  ratingId: Rating,
  categoryId: string,
  sequence: number
): string {
  return `${ratingId}-${categoryId}-${String(sequence).padStart(2, "0")}`
}
