import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useStore } from '@/store/useStore'
import { coupons } from '@/data/coupons'
import CartItem from '@/components/CartItem'
import CouponCard from '@/components/CouponCard'
import EmptyState from '@/components/EmptyState'
import { formatPrice } from '@/utils'

const CartPage: React.FC = () => {
  const {
    cartItems,
    orderType,
    remark,
    selectedCouponId,
    usedCouponIds,
    getCartTotal,
    updateQuantity,
    removeFromCart,
    setOrderType,
    setRemark,
    selectCoupon,
    submitOrder,
  } = useStore()

  const [showCoupons, setShowCoupons] = useState(false)

  const total = getCartTotal()

  const selectedCoupon = useMemo(() => {
    return coupons.find((c) => c.id === selectedCouponId) || null
  }, [selectedCouponId])

  const discountAmount = selectedCoupon ? selectedCoupon.discountAmount : 0
  const finalPrice = Math.max(0, total - discountAmount)

  const availableCoupons = useMemo(() => {
    return coupons.filter(
      (c) => !c.isUsed && !usedCouponIds.includes(c.id) && new Date(c.expiredAt) > new Date() && total >= c.minOrderAmount
    )
  }, [total, usedCouponIds])

  useEffect(() => {
    if (selectedCouponId && selectedCoupon) {
      if (total < selectedCoupon.minOrderAmount || usedCouponIds.includes(selectedCouponId)) {
        selectCoupon('')
      }
    }
  }, [total, selectedCouponId, selectedCoupon, usedCouponIds, selectCoupon])

  const handleMinus = (id: string) => {
    const item = cartItems.find((ci) => ci.id === id)
    if (item) {
      updateQuantity(id, item.quantity - 1)
    }
  }

  const handlePlus = (id: string) => {
    const item = cartItems.find((ci) => ci.id === id)
    if (item) {
      updateQuantity(id, item.quantity + 1)
    }
  }

  const handleSubmit = () => {
    if (cartItems.length === 0) {
      Taro.showToast({ title: '请先添加菜品', icon: 'none' })
      return
    }

    const order = submitOrder(selectedCoupon)
    Taro.showToast({ title: '下单成功！', icon: 'success' })
    Taro.navigateTo({
      url: `/pages/pickup/index?orderId=${order.id}`,
    })
  }

  const handleCouponSelect = (coupon: typeof coupons[0]) => {
    if (selectedCouponId === coupon.id) {
      selectCoupon('')
    } else {
      selectCoupon(coupon.id)
    }
  }

  return (
    <View className={styles.page}>
      {cartItems.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="购物车是空的"
          description="快去首页选几道美味吧～"
          actionText="去逛逛"
          onAction={() => Taro.switchTab({ url: '/pages/home/index' })}
        />
      ) : (
        <>
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onMinus={handleMinus}
              onPlus={handlePlus}
              onRemove={removeFromCart}
            />
          ))}

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>用餐方式</Text>
            <View className={styles.orderTypeRow}>
              <View
                className={classnames(styles.typeBtn, orderType === 'dine_in' && styles.typeBtnActive)}
                onClick={() => setOrderType('dine_in')}
              >
                <Text className={styles.typeIcon}>🍽️</Text>
                <Text className={classnames(styles.typeText, orderType === 'dine_in' && styles.typeTextActive)}>
                  堂食
                </Text>
              </View>
              <View
                className={classnames(styles.typeBtn, orderType === 'takeout' && styles.typeBtnActive)}
                onClick={() => setOrderType('takeout')}
              >
                <Text className={styles.typeIcon}>🥡</Text>
                <Text className={classnames(styles.typeText, orderType === 'takeout' && styles.typeTextActive)}>
                  自取外带
                </Text>
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>忌口/备注</Text>
            <Input
              className={styles.remarkInput}
              placeholder="请输入忌口或特殊要求，如：不要香菜、少盐..."
              placeholderClass={styles.remarkPlaceholder}
              value={remark}
              onInput={(e) => setRemark(e.detail.value)}
              maxlength={50}
            />
            <Text className={styles.remarkTip}>50字以内，厨师会尽量满足您的要求</Text>
          </View>

          <View className={styles.section}>
            <View className={styles.couponSelector} onClick={() => setShowCoupons(!showCoupons)}>
              <Text className={styles.couponLabel}>优惠券</Text>
              <View className={styles.couponValue}>
                <Text className={styles.couponDetail}>
                  {selectedCoupon ? `已选 -¥${selectedCoupon.discountAmount}` : `${availableCoupons.length}张可用`}
                </Text>
                <Text className={styles.couponArrow}>›</Text>
              </View>
            </View>

            {showCoupons && (
              <View className={styles.couponList}>
                {availableCoupons.length > 0 ? (
                  availableCoupons.map((c) => (
                    <CouponCard
                      key={c.id}
                      coupon={c}
                      selected={c.id === selectedCouponId}
                      onSelect={handleCouponSelect}
                    />
                  ))
                ) : (
                  <EmptyState icon="🎫" title="暂无可用优惠券" />
                )}
              </View>
            )}
          </View>

          <View className={styles.bottomBar}>
            <View className={styles.totalInfo}>
              <Text className={styles.totalLabel}>
                共{cartItems.reduce((s, i) => s + i.quantity, 0)}件
                {discountAmount > 0 ? `（已优惠¥${discountAmount}）` : ''}
              </Text>
              <Text className={styles.totalPrice}>{formatPrice(finalPrice)}</Text>
            </View>
            <View className={styles.submitBtn} onClick={handleSubmit}>
              {orderType === 'dine_in' ? '堂食下单' : '外带下单'}
            </View>
          </View>
        </>
      )}
    </View>
  )
}

export default CartPage