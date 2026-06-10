import { create } from 'zustand'
import { CartDishItem, Order, Coupon, OrderType, Review } from '@/types'

function generateId(): string {
  return `ci${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function generateOrderNo(): string {
  const now = new Date()
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `${date}${seq}`
}

interface StoreState {
  cartItems: CartDishItem[]
  orders: Order[]
  favoriteIds: string[]
  reviews: Review[]
  selectedCouponId: string
  orderType: OrderType
  remark: string
  isStaffMode: boolean
  soldOutIds: string[]
  usedCouponIds: string[]

  addToCart: (item: Omit<CartDishItem, 'id'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setOrderType: (type: OrderType) => void
  setRemark: (remark: string) => void
  selectCoupon: (couponId: string) => void
  toggleFavorite: (dishId: string) => void
  isFavorite: (dishId: string) => boolean
  submitOrder: (coupon: Coupon | null) => Order
  getCartTotal: () => number
  getCartCount: () => number
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void
  toggleStaffMode: () => void
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void
  toggleSoldOut: (dishId: string) => void
  isSoldOut: (dishId: string) => boolean
}

export const useStore = create<StoreState>((set, get) => ({
  cartItems: [],
  orders: [],
  favoriteIds: [],
  reviews: [],
  selectedCouponId: '',
  orderType: 'dine_in',
  remark: '',
  isStaffMode: false,
  soldOutIds: ['12'],
  usedCouponIds: [],

  addToCart: (item) => {
    set((state) => {
      const existingIndex = state.cartItems.findIndex(
        (ci) =>
          ci.dishId === item.dishId &&
          ci.specId === item.specId &&
          JSON.stringify([...ci.extraIds].sort()) === JSON.stringify([...item.extraIds].sort())
      )

      if (existingIndex >= 0) {
        const updated = [...state.cartItems]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        }
        return { cartItems: updated }
      }

      return { cartItems: [...state.cartItems, { ...item, id: generateId() }] }
    })
  },

  removeFromCart: (id) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== id),
    }))
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(id)
      return
    }
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }))
  },

  clearCart: () => set({ cartItems: [], selectedCouponId: '', remark: '' }),

  setOrderType: (orderType) => set({ orderType }),

  setRemark: (remark) => set({ remark }),

  selectCoupon: (couponId) => set({ selectedCouponId: couponId }),

  toggleFavorite: (dishId) => {
    set((state) => {
      const exists = state.favoriteIds.includes(dishId)
      return {
        favoriteIds: exists
          ? state.favoriteIds.filter((id) => id !== dishId)
          : [...state.favoriteIds, dishId],
      }
    })
  },

  isFavorite: (dishId) => get().favoriteIds.includes(dishId),

  submitOrder: (coupon) => {
    const state = get()
    const discountAmount = coupon ? coupon.discountAmount : 0
    const totalPrice = state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const finalPrice = Math.max(0, totalPrice - discountAmount)
    const queueNo = Math.floor(Math.random() * 20) + 1
    const estimatedWaitTime = Math.floor(Math.random() * 25) + 5

    const order: Order = {
      id: `o_${Date.now()}`,
      orderNo: generateOrderNo(),
      items: [...state.cartItems],
      totalPrice,
      discountAmount,
      finalPrice,
      orderType: state.orderType,
      orderStatus: 'pending',
      tableNo: state.orderType === 'dine_in' ? `A${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}` : '',
      remark: state.remark,
      couponId: state.selectedCouponId,
      queueNo,
      estimatedWaitTime,
      createdAt: new Date().toISOString(),
    }

    const usedCouponIds = state.selectedCouponId
      ? [...state.usedCouponIds, state.selectedCouponId]
      : state.usedCouponIds

    set((s) => ({
      orders: [order, ...s.orders],
      cartItems: [],
      selectedCouponId: '',
      remark: '',
      usedCouponIds,
    }))

    return order
  },

  getCartTotal: () => {
    return get().cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  getCartCount: () => {
    return get().cartItems.reduce((sum, item) => sum + item.quantity, 0)
  },

  addReview: (review) => {
    set((state) => ({
      reviews: [
        ...state.reviews,
        {
          ...review,
          id: `r${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ],
    }))
  },

  toggleStaffMode: () => set((s) => ({ isStaffMode: !s.isStaffMode })),

  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, orderStatus: status } : o
      ),
    }))
  },

  toggleSoldOut: (dishId) => {
    set((state) => ({
      soldOutIds: state.soldOutIds.includes(dishId)
        ? state.soldOutIds.filter((id) => id !== dishId)
        : [...state.soldOutIds, dishId],
    }))
  },

  isSoldOut: (dishId) => get().soldOutIds.includes(dishId),
}))