import React, { useState, useMemo } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useStore } from '@/store/useStore'
import { dishes } from '@/data/dishes'
import { coupons } from '@/data/coupons'
import DishCard from '@/components/DishCard'
import CouponCard from '@/components/CouponCard'
import ReviewCard from '@/components/ReviewCard'
import OrderCard from '@/components/OrderCard'
import EmptyState from '@/components/EmptyState'

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
  } = useStore()

  const [activeTab, setActiveTab] = useState<'coupons' | 'favorites' | 'reviews' | 'orders'>('coupons')
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null)
  const [reviewStars, setReviewStars] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewingDishId, setReviewingDishId] = useState<string>('')
  const [reviewingDishName, setReviewingDishName] = useState('')
  const [reviewingDishImage, setReviewingDishImage] = useState('')

  const favoriteDishes = dishes.filter((d) => favoriteIds.includes(d.id))

  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.orderStatus === 'completed')
  }, [orders])

  const availableCouponCount = coupons.filter(
    (c) => !c.isUsed && !usedCouponIds.includes(c.id) && new Date(c.expiredAt) > new Date()
  ).length

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
    Taro.showToast({ title: '评价成功！', icon: 'success' })
    setReviewingOrderId(null)
  }

  const handleOrderDetail = (order: typeof orders[0]) => {
    Taro.navigateTo({ url: `/pages/pickup/index?orderId=${order.id}` })
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
          <Text className={styles.memberBadge}>累计消费 ¥{orders.reduce((s, o) => s + o.finalPrice, 0).toFixed(0)}</Text>
        </View>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{completedOrders.length}</Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{availableCouponCount}</Text>
          <Text className={styles.statLabel}>可用优惠券</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{favoriteIds.length}</Text>
          <Text className={styles.statLabel}>收藏菜品</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuCard}>
          <View
            className={styles.menuItem}
            onClick={() => setActiveTab('coupons')}
          >
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>🎫</Text>
              <Text className={styles.menuText}>我的优惠券</Text>
            </View>
            <View className={styles.menuRight}>
              <Text className={styles.menuBadge}>{availableCouponCount}张</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => setActiveTab('orders')}
          >
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>📋</Text>
              <Text className={styles.menuText}>我的订单</Text>
            </View>
            <View className={styles.menuRight}>
              <Text className={styles.menuBadge}>{completedOrders.length}笔</Text>
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
              <Text className={styles.menuIcon}>�</Text>
              <Text className={styles.menuText}>我的评价</Text>
            </View>
            <View className={styles.menuRight}>
              <Text className={styles.menuBadge}>{reviews.length}条</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>
      </View>

      {activeTab === 'coupons' && (
        <View style={{ padding: '0 32rpx' }}>
          {coupons.length > 0 ? (
            coupons.map((c) => (
              <CouponCard key={c.id} coupon={c} />
            ))
          ) : (
            <EmptyState icon="🎫" title="暂无优惠券" />
          )}
        </View>
      )}

      {activeTab === 'orders' && (
        completedOrders.length > 0 ? (
          <View style={{ padding: '0 32rpx' }}>
            {completedOrders.map((order) => (
              <View key={order.id}>
                <OrderCard order={order} onDetail={handleOrderDetail} />
                {reviewingOrderId === order.id ? (
                  <View className={styles.reviewForm}>
                    <Text className={styles.reviewFormTitle}>
                      评价 {reviewingDishName}
                    </Text>
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
                      <View
                        className={styles.reviewCancelBtn}
                        onClick={() => setReviewingOrderId(null)}
                      >
                        <Text>取消</Text>
                      </View>
                      <View
                        className={styles.reviewSubmitBtn}
                        onClick={submitReview}
                      >
                        <Text>提交评价</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  order.items.map((item) => (
                    <View key={item.id} className={styles.reviewTriggerRow}>
                      <Image className={styles.reviewTriggerImg} src={item.image} mode="aspectFill" />
                      <Text className={styles.reviewTriggerName}>{item.name}</Text>
                      <View
                        className={styles.reviewTriggerBtn}
                        onClick={() => openReviewForm(order.id, item.dishId, item.name, item.image)}
                      >
                        <Text className={styles.reviewTriggerBtnText}>去评价</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            ))}
          </View>
        ) : (
          <EmptyState icon="📋" title="暂无已完成订单" description="下单并取餐后可以评价菜品哦～" />
        )
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
              <ReviewCard key={r.id} review={r} />
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