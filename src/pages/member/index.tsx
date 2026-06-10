import React, { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useStore } from '@/store/useStore'
import { dishes } from '@/data/dishes'
import { coupons } from '@/data/coupons'
import DishCard from '@/components/DishCard'
import CouponCard from '@/components/CouponCard'
import ReviewCard from '@/components/ReviewCard'
import EmptyState from '@/components/EmptyState'

const MemberPage: React.FC = () => {
  const {
    orders,
    favoriteIds,
    toggleFavorite,
    reviews,
    isStaffMode,
    toggleStaffMode,
  } = useStore()

  const [activeTab, setActiveTab] = useState<'coupons' | 'favorites' | 'reviews'>('coupons')

  const favoriteDishes = dishes.filter((d) => favoriteIds.includes(d.id))

  const handleStaffClick = () => {
    toggleStaffMode()
    if (!isStaffMode) {
      Taro.navigateTo({ url: '/pages/staff/index' })
    }
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
          <Text className={styles.statValue}>{orders.length}</Text>
          <Text className={styles.statLabel}>历史订单</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{coupons.filter((c) => !c.isUsed && new Date(c.expiredAt) > new Date()).length}</Text>
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
              <Text className={styles.menuBadge}>{coupons.filter((c) => !c.isUsed && new Date(c.expiredAt) > new Date()).length}张</Text>
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

        <View className={styles.menuCard}>
          <View
            className={styles.menuItem}
            onClick={() => {
              Taro.switchTab({ url: '/pages/cart/index' })
            }}
          >
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>📋</Text>
              <Text className={styles.menuText}>我的订单</Text>
            </View>
            <View className={styles.menuRight}>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>
      </View>

      {activeTab === 'coupons' && (
        <View style={{ padding: `0 ${32}rpx` }}>
          {coupons.length > 0 ? (
            coupons.map((c) => (
              <CouponCard key={c.id} coupon={c} />
            ))
          ) : (
            <EmptyState icon="🎫" title="暂无优惠券" />
          )}
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
        <View style={{ padding: `0 ${32}rpx` }}>
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