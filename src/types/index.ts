export interface DishCategory {
  id: string
  name: string
  icon: string
}

export interface FlavorTag {
  name: string
  color: string
}

export interface AllergenTip {
  name: string
  icon: string
}

export interface SpecOption {
  id: string
  name: string
  price: number
}

export interface ExtraOption {
  id: string
  name: string
  price: number
}

export interface Dish {
  id: string
  name: string
  image: string
  price: number
  originalPrice: number
  categoryId: string
  categoryName: string
  description: string
  flavorTags: FlavorTag[]
  allergenTips: AllergenTip[]
  specs: SpecOption[]
  extras: ExtraOption[]
  isHot: boolean
  isNew: boolean
  isSoldOut: boolean
  salesCount: number
  rating: number
}

export interface CartDishItem {
  id: string
  dishId: string
  name: string
  image: string
  specId: string
  specName: string
  extraIds: string[]
  extraNames: string[]
  price: number
  quantity: number
}

export type OrderType = 'dine_in' | 'takeout'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

export interface Order {
  id: string
  orderNo: string
  items: CartDishItem[]
  totalPrice: number
  discountAmount: number
  finalPrice: number
  orderType: OrderType
  orderStatus: OrderStatus
  tableNo: string
  remark: string
  couponId: string
  queueNo: number
  estimatedWaitTime: number
  createdAt: string
}

export interface Coupon {
  id: string
  name: string
  description: string
  discountAmount: number
  minOrderAmount: number
  validDays: number
  isUsed: boolean
  expiredAt: string
}

export interface Review {
  id: string
  dishId: string
  dishName: string
  dishImage: string
  rating: number
  content: string
  createdAt: string
}

export type StaffOrder = Order

export interface SalesSummary {
  totalOrders: number
  totalRevenue: number
  avgOrderPrice: number
  topDishes: { name: string; count: number }[]
}