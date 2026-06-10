import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import { CartDishItem, Order, Coupon, OrderType, Review, RefundStatus } from '@/types'

function generateId(): string {
  return `ci${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function generateOrderNo(): string {
  const now = new Date()
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `${date}${seq}`
}

function generatePickupCode(): string {
  return String(Math.floor(Math.random() * 9000) + 1000)
}

function makeReviewedKey(orderId: string, dishId: string): string {
  return `${orderId}_${dishId}`
}

const taroStorage = {
  getItem: (name: string) => {
    const value = Taro.getStorageSync(name)
    return value ? JSON.stringify(value) : null
  },
  setItem: (name: string, value: string) => {
    Taro.setStorageSync(name, JSON.parse(value))
  },
  removeItem: (name: string) => {
    Taro.removeStorageSync(name)
  },
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
  reviewedKeys: string[]
  points: number
  balance: number
  collectedCouponIds: string[]
  exchangeableCouponIds: string[]

  addToCart: (item: Omit<CartDishItem, 'id'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setOrderType: (type: OrderType) => void
  setRemark: (remark: string) => void
  selectCoupon: (couponId: string) => void
  toggleFavorite: (dishId: string) => void
  isFavorite: (dishId: string) => boolean
  submitOrder: (coupon: Coupon | null, useBalance: number) => Order
  getCartTotal: () => number
  getCartCount: () => number
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void
  toggleStaffMode: () => void
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void
  toggleSoldOut: (dishId: string) => void
  isSoldOut: (dishId: string) => boolean
  addReviewedKey: (orderId: string, dishId: string) => void
  hasReviewed: (orderId: string, dishId: string) => boolean
  reorder: (order: Order) => void
  requestRefund: (orderId: string) => void
  approveRefund: (orderId: string) => void
  rejectRefund: (orderId: string) => void
  completeRefund: (orderId: string) => void
  exchangePointsForCoupon: (points: number, couponId: string) => void
  collectCoupon: (couponId: string) => void
  urgeOrder: (orderId: string) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
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
      reviewedKeys: [],
      points: 300,
      balance: 50,
      collectedCouponIds: ['c1', 'c2', 'c3', 'c4', 'c5'],
      exchangeableCouponIds: [],

      addToCart: (item) => {
        const state = get()
        if (state.soldOutIds.includes(item.dishId)) {
          return
        }
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

      submitOrder: (coupon, useBalance) => {
        const state = get()
        const discountAmount = coupon ? coupon.discountAmount : 0
        const totalPrice = state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const actualUsedBalance = Math.min(useBalance, state.balance, totalPrice - discountAmount)
        const finalPrice = Math.max(0, totalPrice - discountAmount - actualUsedBalance)
        const earnedPoints = Math.floor(finalPrice)
        const queueNo = Math.floor(Math.random() * 20) + 1
        const estimatedWaitTime = Math.floor(Math.random() * 25) + 5

        const order: Order = {
          id: `o_${Date.now()}`,
          orderNo: generateOrderNo(),
          items: [...state.cartItems],
          totalPrice,
          discountAmount,
          usedBalance: actualUsedBalance,
          usedPoints: 0,
          earnedPoints,
          finalPrice,
          orderType: state.orderType,
          orderStatus: 'pending',
          refundStatus: null,
          tableNo: state.orderType === 'dine_in' ? `A${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}` : '',
          remark: state.remark,
          couponId: state.selectedCouponId,
          queueNo,
          estimatedWaitTime,
          pickupCode: generatePickupCode(),
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
          balance: s.balance - actualUsedBalance,
          points: s.points + earnedPoints,
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
          points: state.points + 10,
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

      addReviewedKey: (orderId, dishId) => {
        const key = makeReviewedKey(orderId, dishId)
        set((state) => ({
          reviewedKeys: state.reviewedKeys.includes(key)
            ? state.reviewedKeys
            : [...state.reviewedKeys, key],
        }))
      },

      hasReviewed: (orderId, dishId) => {
        return get().reviewedKeys.includes(makeReviewedKey(orderId, dishId))
      },

      reorder: (order) => {
        set((state) => {
          const newItems = order.items.map((item) => ({
            dishId: item.dishId,
            name: item.name,
            image: item.image,
            specId: item.specId,
            specName: item.specName,
            extraIds: item.extraIds,
            extraNames: item.extraNames,
            price: item.price,
            quantity: item.quantity,
          }))
          newItems.forEach((ni) => {
            if (state.soldOutIds.includes(ni.dishId)) return
            const existingIndex = state.cartItems.findIndex(
              (ci) =>
                ci.dishId === ni.dishId &&
                ci.specId === ni.specId &&
                JSON.stringify([...ci.extraIds].sort()) === JSON.stringify([...ni.extraIds].sort())
            )
            if (existingIndex >= 0) {
              state.cartItems[existingIndex].quantity += ni.quantity
            } else {
              state.cartItems.push({ ...ni, id: generateId() })
            }
          })
          return { cartItems: [...state.cartItems] }
        })
      },

      requestRefund: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, refundStatus: 'pending' as RefundStatus } : o
          ),
        }))
      },

      approveRefund: (orderId) => {
        set((state) => {
          const order = state.orders.find((o) => o.id === orderId)
          return {
            orders: state.orders.map((o) =>
              o.id === orderId ? { ...o, refundStatus: 'approved' as RefundStatus } : o
            ),
            balance: state.balance + (order?.finalPrice || 0),
          }
        })
      },

      rejectRefund: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, refundStatus: 'rejected' as RefundStatus } : o
          ),
        }))
      },

      completeRefund: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, refundStatus: 'completed' as RefundStatus } : o
          ),
        }))
      },

      exchangePointsForCoupon: (points, couponId) => {
        set((state) => {
          if (state.exchangeableCouponIds.includes(couponId)) return state
          return {
            points: state.points - points,
            collectedCouponIds: state.collectedCouponIds.includes(couponId)
              ? state.collectedCouponIds
              : [...state.collectedCouponIds, couponId],
            exchangeableCouponIds: [...state.exchangeableCouponIds, couponId],
          }
        })
      },

      collectCoupon: (couponId) => {
        set((state) => ({
          collectedCouponIds: state.collectedCouponIds.includes(couponId)
            ? state.collectedCouponIds
            : [...state.collectedCouponIds, couponId],
        }))
      },

      urgeOrder: (orderId) => {
        Taro.showToast({ title: '已催单，厨师正在加急处理！', icon: 'none' })
      },
    }),
    {
      name: 'food-miniapp-store',
      storage: taroStorage,
      partialize: (state) => ({
        orders: state.orders,
        favoriteIds: state.favoriteIds,
        reviews: state.reviews,
        soldOutIds: state.soldOutIds,
        usedCouponIds: state.usedCouponIds,
        reviewedKeys: state.reviewedKeys,
        points: state.points,
        balance: state.balance,
        collectedCouponIds: state.collectedCouponIds,
        exchangeableCouponIds: state.exchangeableCouponIds,
      }),
    }
  )
)