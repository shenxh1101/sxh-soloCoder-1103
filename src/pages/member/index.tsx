import React, { useState, useMemo } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useStore } from '@/store/useStore'
import { dishes } from '@/data/dishes'
import { coupons, exchangeableCoupons } from '@/data/coupons'
import DishCard from '@/components/DishCard'
import CouponCard from '@/components/CouponCard'
import ReviewCard from '@/components/ReviewCard'
import OrderCard from '@/components/OrderCard'
import EmptyState from '@/components/EmptyState'
import { OrderStatus } from '@/types'

type MainTab = 'coupons' | 'favorites' | 'reviews' | 'orders' | 'points'

const orderStatusFilters: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'confirmed', label: '已接单' },
  { key: 'preparing', label: '制作中' },
  { key: 'ready', label: '可取餐' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
]

type CouponTabKey = 'available' | 'used' | 'expired'

const couponTabs: { key: CouponTabKey; label: string }[] = [
  { key: 'available', label: '可用' },
  { key: 'used', label: '已使用' },
  { key: 'expired', label: '已过期' },
]

const MemberPage: React.FC = () => {
  const {
    orders,
    favoriteIds,
    toggleFavorite,
    reviews,
    isStaffMode,
    toggleStaffMode,
    addReview,
    usedCouponIds,
    collectedCouponIds,
    exchangeableCouponIds,
    hasReviewed,
    addReviewedKey,
    reorder,
    points,
    balance,
    exchangePointsForCoupon,
    collectCoupon,
  } = useStore()

  const [activeTab, setActiveTab] = useState<MainTab>('orders')
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all')
  const [couponTab, setCouponTab] = useState<CouponTabKey>('available')

  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null)
  const [reviewStars, setReviewStars] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewingDishId, setReviewingDishId] = useState('')
  const [reviewingDishName, setReviewingDishName] = useState('')
  const [reviewingDishImage, setReviewingDishImage] = useState('')

  const favoriteDishes = dishes.filter((d) => favoriteIds.includes(d.id))

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orders
    return orders.filter((o) => o.orderStatus === orderFilter)
  }, [orders, orderFilter])

  const availableCoupons = useMemo(() => {
    return coupons.filter(
      (c) =>
        !c.isUsed &&
        !usedCouponIds.includes(c.id) &&
        new Date(c.expiredAt) > new Date() &&
        collectedCouponIds.includes(c.id)
    )
  }, [usedCouponIds, collectedCouponIds])

  const usedCoupons = useMemo(() => {
    return coupons.filter(
      (c) => c.isUsed || usedCouponIds.includes(c.id)
    )
  }, [usedCouponIds])

  const expiredCoupons = useMemo(() => {
    return coupons.filter(
      (c) =>
        !c.isUsed &&
        !usedCouponIds.includes(c.id) &&
        new Date(c.expiredAt) <= new Date()
    )
  }, [usedCouponIds])

  const displayCoupons = useMemo(() => {
    if (couponTab === 'available') return availableCoupons
    if (couponTab === 'used') return usedCoupons
    return expiredCoupons
  }, [couponTab, availableCoupons, usedCoupons, expiredCoupons])

  const uncollectedCoupons = useMemo(() => {
    return coupons.filter(
      (c) =>
        !c.isUsed &&
        !usedCouponIds.includes(c.id) &&
        new Date(c.expiredAt) > new Date() &&
        !collectedCouponIds.includes(c.id)
    )
  }, [usedCouponIds, collectedCouponIds])

  const handleStaffClick = () => {
    toggleStaffMode()
    if (!isStaffMode) {
      Taro.navigateTo({ url: '/pages/staff/index' })
    }
  }

  const openReviewForm = (orderId: string, dishId: string, dishName: string, dishImage: string) => {
    setReviewingOrderId(orderId)
    setReviewingDishId(dishId)
    setReviewingDishName(dishName)
    setReviewingDishImage(dishImage)
    setReviewStars(5)
    setReviewText('')
  }

  const submitReview = () => {
    if (!reviewText.trim()) {
      Taro.showToast({ title: '请输入评价内容', icon: 'none' })
      return
    }
    addReview({
      dishId: reviewingDishId,
      dishName: reviewingDishName,
      dishImage: reviewingDishImage,
      rating: reviewStars,
      content: reviewText.trim(),
    })
    addReviewedKey(reviewingOrderId || '', reviewingDishId)
    Taro.showToast({ title: '评价成功！', icon: 'success' })
    setReviewingOrderId(null)
  }

  const handleOrderDetail = (order: typeof orders[0]) => {
    Taro.navigateTo({ url: `/pages/pickup/index?orderId=${order.id}` })
  }

  const handleReorder = (order: typeof orders[0]) => {
    reorder(order)
    Taro.showToast({ title: '已加入购物车', icon: 'success' })
    Taro.switchTab({ url: '/pages/cart/index' })
  }

  const handleReviewClick = (dishId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${dishId}` })
  }

  const handleExchange = (pointsCost: number, couponId: string) => {
    if (points < pointsCost) {
      Taro.showToast({ title: '积分不足', icon: 'none' })
      return
    }
    exchangePointsForCoupon(pointsCost, couponId)
    Taro.showToast({ title: '兑换成功！', icon: 'success' })
  }

  const handleCollect = (couponId: string) => {
    collectCoupon(couponId)
    Taro.showToast({ title: '领取成功！', icon: 'success' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.profileHeader}>
        <Image
          className={styles.avatar}
          src="https://picsum.photos/id/64/200/200"
          mode="aspectFill"
        />
        <View className={styles.profileInfo}>
          <Text className={styles.nickname}>美食达人</Text>
          <Text className={styles.level}>黄金会员</Text>
          <View className={styles.assetRow}>
            <Text className={styles.assetItem}>🧧 {points} 积分</Text>
            <Text className={styles.assetItem}>💰 ¥{balance.toFixed(0)} 余额</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuCard}>
          <View
            className={styles.menuItem}
            onClick={() => setActiveTab('orders')}
          >
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>📋</Text>
              <Text className={styles.menuText}>我的订单</Text>
            </View>
            <View className={styles.menuRight}>
              <Text className={styles.menuBadge}>{orders.length}笔</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => setActiveTab('coupons')}
          >
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>🎫</Text>
              <Text className={styles.menuText}>我的优惠券</Text>
            </View>
            <View className={styles.menuRight}>
              <Text className={styles.menuBadge}>{availableCoupons.length}张</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => setActiveTab('points')}
          >
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>🎁</Text>
              <Text className={styles.menuText}>积分兑券</Text>
            </View>
            <View className={styles.menuRight}>
              <Text className={styles.menuBadge}>{points}分</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => setActiveTab('favorites')}
          >
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>❤️</Text>
              <Text className={styles.menuText}>我的收藏</Text>
            </View>
            <View className={styles.menuRight}>
              <Text className={styles.menuBadge}>{favoriteIds.length}道</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => setActiveTab('reviews')}
          >
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>💬</Text>
              <Text className={styles.menuText}>我的评价</Text>
            </View>
            <View className={styles.menuRight}>
              <Text className={styles.menuBadge}>{reviews.length}条</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>
      </View>

      {activeTab === 'orders' && (
        <View>
          <ScrollView scrollX className={styles.filterRow}>
            {orderStatusFilters.map((f) => (
              <View
                key={f.key}
                className={classnames(
                  styles.filterTab,
                  orderFilter === f.key && styles.filterTabActive
                )}
                onClick={() => setOrderFilter(f.key)}
              >
                <Text>{f.label}</Text>
              </View>
            ))}
          </ScrollView>

          {filteredOrders.length > 0 ? (
            <View style={{ padding: '0 32rpx' }}>
              {filteredOrders.map((order) => (
                <View key={order.id}>
                  <OrderCard order={order} onDetail={handleOrderDetail} />
                  {order.refundStatus && (
                    <View className={styles.refundTag}>
                      <Text className={styles.refundTagText}>
                        {order.refundStatus === 'pending' ? '退款审核中' :
                         order.refundStatus === 'approved' ? '退款已通过' :
                         order.refundStatus === 'rejected' ? '退款已拒绝' : '已退款'}
                      </Text>
                    </View>
                  )}
                  {order.orderStatus === 'completed' && (
                    <View style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 0 }}>
                      {reviewingOrderId === order.id ? (
                        <View className={styles.reviewForm}>
                          <Text className={styles.reviewFormTitle}>评价 {reviewingDishName}</Text>
                          <View className={styles.starRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Text
                                key={star}
                                className={classnames(styles.starBtn, star <= reviewStars && styles.starBtnActive)}
                                onClick={() => setReviewStars(star)}
                              >
                                {star <= reviewStars ? '★' : '☆'}
                              </Text>
                            ))}
                          </View>
                          <Input
                            className={styles.reviewInput}
                            placeholder="写下你的评价..."
                            placeholderClass={styles.reviewInputPlaceholder}
                            value={reviewText}
                            onInput={(e) => setReviewText(e.detail.value)}
                            maxlength={200}
                          />
                          <View className={styles.reviewActions}>
                            <View className={styles.reviewCancelBtn} onClick={() => setReviewingOrderId(null)}>
                              <Text>取消</Text>
                            </View>
                            <View className={styles.reviewSubmitBtn} onClick={submitReview}>
                              <Text>提交评价</Text>
                            </View>
                          </View>
                        </View>
                      ) : (
                        <View>
                          {order.items.map((item) => {
                            const reviewed = hasReviewed(order.id, item.dishId)
                            return (
                              <View key={item.id} className={styles.reviewTriggerRow}>
                                <Image className={styles.reviewTriggerImg} src={item.image} mode="aspectFill" />
                                <Text className={styles.reviewTriggerName}>{item.name}</Text>
                                {reviewed ? (
                                  <View className={styles.reviewedBadge}>
                                    <Text className={styles.reviewedBadgeText}>已评价</Text>
                                  </View>
                                ) : (
                                  <View
                                    className={styles.reviewTriggerBtn}
                                    onClick={() =>
                                      openReviewForm(order.id, item.dishId, item.name, item.image)
                                    }
                                  >
                                    <Text className={styles.reviewTriggerBtnText}>去评价</Text>
                                  </View>
                                )}
                              </View>
                            )
                          })}
                          <View className={styles.reorderBtn} onClick={() => handleReorder(order)}>
                            <Text className={styles.reorderBtnText}>🔄 再来一单</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <EmptyState icon="📋" title="暂无此类订单" />
          )}
        </View>
      )}

      {activeTab === 'coupons' && (
        <View>
          <View className={styles.filterRow}>
            {couponTabs.map((t) => (
              <View
                key={t.key}
                className={classnames(
                  styles.filterTab,
                  couponTab === t.key && styles.filterTabActive
                )}
                onClick={() => setCouponTab(t.key)}
              >
                <Text>{t.label}</Text>
              </View>
            ))}
          </View>
          <View style={{ padding: '0 32rpx' }}>
            {displayCoupons.length > 0 ? (
              displayCoupons.map((c) => (
                <CouponCard key={c.id} coupon={c} usedCouponIds={usedCouponIds} />
              ))
            ) : (
              <EmptyState icon="🎫" title={`暂无${couponTabs.find((t) => t.key === couponTab)?.label}优惠券`} />
            )}
          </View>
          {couponTab === 'available' && uncollectedCoupons.length > 0 && (
            <View style={{ padding: '0 32rpx', marginTop: '16rpx' }}>
              <Text className={styles.couponCenterTitle}>领券中心</Text>
              {uncollectedCoupons.map((c) => (
                <View key={c.id} style={{ position: 'relative' }}>
                  <CouponCard coupon={c} usedCouponIds={usedCouponIds} />
                  <View className={styles.collectBtn} onClick={() => handleCollect(c.id)}>
                    <Text className={styles.collectBtnText}>领取</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {activeTab === 'points' && (
        <View style={{ padding: '0 32rpx' }}>
          <View className={styles.pointsCard}>
            <Text className={styles.pointsTitle}>积分兑换优惠券</Text>
            <Text className={styles.pointsDesc}>当前积分：{points}</Text>
          </View>
          {exchangeableCoupons.map((c) => {
            const alreadyExchanged = exchangeableCouponIds.includes(c.id)
            return (
              <View key={c.id} style={{ position: 'relative' }}>
                <CouponCard coupon={c} usedCouponIds={alreadyExchanged ? [c.id] : []} />
                {alreadyExchanged ? (
                  <View className={styles.exchangedBtn}>
                    <Text className={styles.exchangedBtnText}>已兑换</Text>
                  </View>
                ) : (
                  <View
                    className={classnames(
                      styles.collectBtn,
                      points < c.requiredPoints && styles.collectBtnDisabled
                    )}
                    onClick={() => handleExchange(c.requiredPoints, c.id)}
                  >
                    <Text className={styles.collectBtnText}>
                      {points >= c.requiredPoints ? `${c.requiredPoints}积分兑换` : '积分不足'}
                    </Text>
                  </View>
                )}
              </View>
            )
          })}
        </View>
      )}

      {activeTab === 'favorites' && (
        favoriteDishes.length > 0 ? (
          <View className={styles.favorites}>
            {favoriteDishes.map((dish) => (
              <View key={dish.id} className={styles.favoriteGridItem}>
                <DishCard
                  dish={dish}
                  isFavorite={true}
                  onClick={(d) => Taro.navigateTo({ url: `/pages/detail/index?id=${d.id}` })}
                  onFavorite={toggleFavorite}
                />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState icon="❤️" title="还没有收藏的菜品" description="遇到喜欢的就收藏吧～" />
        )
      )}

      {activeTab === 'reviews' && (
        <View style={{ padding: '0 32rpx' }}>
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <View key={r.id} onClick={() => handleReviewClick(r.dishId)}>
                <ReviewCard review={r} />
              </View>
            ))
          ) : (
            <EmptyState icon="💬" title="还没有评价" description="下单完成后可以评价菜品哦～" />
          )}
        </View>
      )}

      <View className={styles.staffSwitch}>
        <View className={styles.staffBtn} onClick={handleStaffClick}>
          <Text className={styles.staffIcon}>{isStaffMode ? '👨‍🍳' : '🔧'}</Text>
          <Text>{isStaffMode ? '店员模式（已开启）' : '切换到店员端'}</Text>
        </View>
      </View>
    </View>
  )
}

export default MemberPage