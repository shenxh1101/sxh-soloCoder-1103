import React, { useState, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import styles from './index.module.scss'
import { categories, dishes } from '@/data/dishes'
import { useStore } from '@/store/useStore'
import DishCard from '@/components/DishCard'
import CategoryTabs from '@/components/CategoryTabs'
import EmptyState from '@/components/EmptyState'

const HomePage: React.FC = () => {
  const [activeCategoryId, setActiveCategoryId] = useState('1')
  const { favoriteIds, toggleFavorite, soldOutIds } = useStore()

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 500)
  })

  const filteredDishes = useMemo(() => {
    return dishes.filter((d) => d.categoryId === activeCategoryId)
  }, [activeCategoryId])

  const handleDishClick = (dish: typeof dishes[0]) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${dish.id}`,
    })
  }

  const handleSearchClick = () => {
    console.log('[Home] search clicked')
  }

  const displayDishes = useMemo(() => {
    return filteredDishes.map((dish) => ({
      ...dish,
      isSoldOut: soldOutIds.includes(dish.id),
    }))
  }, [filteredDishes, soldOutIds])

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerContent}>
          <Text className={styles.brand}>社区美食坊</Text>
          <Text className={styles.subtitle}>家门口的好味道</Text>
          <View className={styles.searchBar} onClick={handleSearchClick}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Text className={styles.searchPlaceholder}>搜索想吃的菜...</Text>
          </View>
        </View>
      </View>

      <View className={styles.banner}>
        <Image
          className={styles.bannerImage}
          src="https://picsum.photos/id/292/750/400"
          mode="aspectFill"
        />
        <View className={styles.bannerContent}>
          <View>
            <Text className={styles.bannerTitle}>今日特惠</Text>
            <Text className={styles.bannerDesc}>招牌推荐 8.5 折起</Text>
          </View>
          <View className={styles.bannerBadge}>
            <Text className={styles.bannerBadgeText}>去看看</Text>
          </View>
        </View>
      </View>

      <CategoryTabs
        categories={categories}
        activeId={activeCategoryId}
        onChange={setActiveCategoryId}
      />

      {displayDishes.length > 0 ? (
        <View className={styles.grid}>
          {displayDishes.map((dish) => (
            <View key={dish.id} className={styles.gridItem}>
              <DishCard
                dish={dish}
                isFavorite={favoriteIds.includes(dish.id)}
                onClick={handleDishClick}
                onFavorite={toggleFavorite}
              />
            </View>
          ))}
        </View>
      ) : (
        <EmptyState icon="🍽️" title="该分类暂无菜品" />
      )}
    </View>
  )
}

export default HomePage