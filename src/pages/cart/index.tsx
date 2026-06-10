import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useStore } from '@/store/useStore'
import { coupons, exchangeableCoupons } from '@/data/coupons'
import { dishes } from '@/data/dishes'
import CartItem from '@/components/CartItem'
import CouponCard from '@/components/CouponCard'
import EmptyState from '@/components/EmptyState'
import { Coupon } from '@/types'
import { formatPrice } from '@/utils'

const CartPage: React.FC = () => {
  const {
    cartItems,
    orderType,
    remark,
    selectedCouponId,
    usedCouponIds,
    collectedCouponIds,
    balance,
    getCartTotal,
    updateQuantity,
    removeFromCart,
    setOrderType,
    setRemark,
    selectCoupon,
    submitOrder,
  } = useStore()

  const [showCoupons, setShowCoupons] = useState(false)
  const [useBalance, setUseBalance] = useState(0)
  const [showBalanceInput, setShowBalanceInput] = useState(false)

  const total = getCartTotal()
  const cartCategoryIds = useMemo(() => {
    const ids = new Set<string>()
    cartItems.forEach((ci) => {
      const dish = dishes.find((d) => d.id === ci.dishId)
      if (dish) ids.add(dish.categoryId)
    })
    return ids
  }, [cartItems])

  const allCoupons = useMemo(() => [...coupons, ...exchangeableCoupons], [])

  const selectedCoupon = useMemo(() => {
    return allCoupons.find((c) => c.id === selectedCouponId) || null
  }, [selectedCouponId, allCoupons])

  const discountAmount = selectedCoupon ? selectedCoupon.discountAmount : 0
  const afterDiscount = Math.max(0, total - discountAmount)
  const finalPrice = Math.max(0, afterDiscount - useBalance)

  const allAvailableCoupons = useMemo(() => {
    return allCoupons.filter(
      (c) =>
        !c.isUsed &&
        !usedCouponIds.includes(c.id) &&
        new Date(c.expiredAt) > new Date() &&
        collectedCouponIds.includes(c.id)
    )
  }, [usedCouponIds, collectedCouponIds, allCoupons])

  const matchingCoupons = useMemo(() => {
    return allAvailableCoupons.filter((c) => {
      if (total < c.minOrderAmount) return false
      if (c.couponType === 'all') return true
      if (c.couponType === 'category' && c.categoryId) {
        return cartCategoryIds.has(c.categoryId)
      }
      return false
    })
  }, [allAvailableCoupons, cartCategoryIds, total])

  const nonMatchingCoupons = useMemo(() => {
    return allAvailableCoupons.filter((c) => {
      const isMatching = matchingCoupons.some((m) => m.id === c.id)
      return !isMatching
    })
  }, [allAvailableCoupons, matchingCoupons])

  useEffect(() => {
    if (selectedCouponId && selectedCoupon) {
      if (
        total < selectedCoupon.minOrderAmount ||
        usedCouponIds.includes(selectedCouponId) ||
        (selectedCoupon.couponType === 'category' &&
          selectedCoupon.categoryId &&
          !cartCategoryIds.has(selectedCoupon.categoryId))
      ) {
        selectCoupon('')
      }
    }
  }, [total, selectedCouponId, selectedCoupon, usedCouponIds, selectCoupon, cartCategoryIds])

  useEffect(() => {
    if (useBalance > afterDiscount) {
      setUseBalance(afterDiscount)
    }
  }, [useBalance, afterDiscount])

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
    const order = submitOrder(selectedCoupon, useBalance)
    Taro.showToast({ title: '下单成功！', icon: 'success' })
    Taro.navigateTo({
      url: `/pages/pickup/index?orderId=${order.id}`,
    })
  }

  const handleCouponSelect = (coupon: Coupon) => {
    const isUsed = coupon.isUsed || usedCouponIds.includes(coupon.id)
    const isExpired = new Date(coupon.expiredAt) < new Date()
    if (isUsed || isExpired) return

    if (
      coupon.couponType === 'category' &&
      coupon.categoryId &&
      !cartCategoryIds.has(coupon.categoryId)
    ) {
      return
    }

    if (total < coupon.minOrderAmount) {
      Taro.showToast({
        title: `还差${formatPrice(coupon.minOrderAmount - total)}可用`,
        icon: 'none',
      })
      return
    }

    if (selectedCouponId === coupon.id) {
      selectCoupon('')
    } else {
      selectCoupon(coupon.id)
    }
  }

  const getDisabledReason = (coupon: Coupon): string => {
    if (coupon.couponType === 'category' && coupon.categoryId && !cartCategoryIds.has(coupon.categoryId)) {
      return `限${coupon.categoryName || '指定品类'}使用`
    }
    if (total < coupon.minOrderAmount) {
      return `还差${formatPrice(coupon.minOrderAmount - total)}`
    }
    return ''
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
                  {selectedCoupon
                    ? `已选 -¥${selectedCoupon.discountAmount}`
                    : `${matchingCoupons.length}张可用`}
                </Text>
                <Text className={styles.couponArrow}>›</Text>
              </View>
            </View>

            {showCoupons && (
              <View className={styles.couponList}>
                {matchingCoupons.length > 0 && (
                  <>
                    {matchingCoupons.map((c) => (
                      <CouponCard
                        key={c.id}
                        coupon={c}
                        selected={c.id === selectedCouponId}
                        onSelect={handleCouponSelect}
                        totalPrice={total}
                        usedCouponIds={usedCouponIds}
                      />
                    ))}
                  </>
                )}
                {nonMatchingCoupons.length > 0 && (
                  <>
                    <Text className={styles.couponSectionLabel}>不可用</Text>
                    {nonMatchingCoupons.map((c) => (
                      <CouponCard
                        key={c.id}
                        coupon={c}
                        totalPrice={total}
                        usedCouponIds={usedCouponIds}
                        disabledReason={getDisabledReason(c)}
                        showDisabledReason
                      />
                    ))}
                  </>
                )}
                {allAvailableCoupons.length === 0 && (
                  <EmptyState icon="🎫" title="暂无可用优惠券" />
                )}
              </View>
            )}
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>余额抵扣</Text>
            <View className={styles.balanceInfo}>
              <Text className={styles.balanceLabel}>
                储值余额：{formatPrice(balance)}
              </Text>
              <View
                className={classnames(styles.toggleSwitch, showBalanceInput && styles.toggleSwitchOn)}
                onClick={() => {
                  setShowBalanceInput(!showBalanceInput)
                  if (showBalanceInput) setUseBalance(0)
                }}
              >
                <View className={classnames(styles.toggleDot, showBalanceInput && styles.toggleDotOn)} />
              </View>
            </View>
            {showBalanceInput && balance > 0 && (
              <View className={styles.balanceInputRow}>
                <Input
                  className={styles.balanceInput}
                  type="number"
                  placeholder={`最多可用${formatPrice(Math.min(balance, afterDiscount))}`}
                  placeholderClass={styles.remarkPlaceholder}
                  value={useBalance > 0 ? String(useBalance) : ''}
                  onInput={(e) => {
                    const val = Number(e.detail.value)
                    setUseBalance(Math.min(val, balance, afterDiscount))
                  }}
                />
                {useBalance > 0 && (
                  <Text className={styles.balanceHint}>抵扣{formatPrice(useBalance)}</Text>
                )}
              </View>
            )}
          </View>

          <View className={styles.bottomBar}>
            <View className={styles.totalInfo}>
              {discountAmount > 0 && (
                <Text className={styles.totalSub}>
                  优惠券 -¥{discountAmount}
                </Text>
              )}
              {useBalance > 0 && (
                <Text className={styles.totalSub}>
                  余额 -{formatPrice(useBalance)}
                </Text>
              )}
              <Text className={styles.totalLabel}>
                共{cartItems.reduce((s, i) => s + i.quantity, 0)}件
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