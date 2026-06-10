import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { Dish } from '@/types'
import { formatPrice } from '@/utils'

interface DishCardProps {
  dish: Dish
  isFavorite: boolean
  onClick: (dish: Dish) => void
  onFavorite: (dishId: string) => void
}

const DishCard: React.FC<DishCardProps> = ({ dish, isFavorite, onClick, onFavorite }) => {
  return (
    <View className={styles.card} onClick={() => onClick(dish)}>
      <View className={styles.imageWrap}>
        <Image
          className={styles.image}
          src={dish.image}
          mode="aspectFill"
        />
        {dish.isHot && <View className={styles.hotTag}>热卖</View>}
        {dish.isNew && <View className={styles.newTag}>新品</View>}
        {dish.isSoldOut && <View className={styles.soldOutMask}>
          <Text className={styles.soldOutText}>已售罄</Text>
        </View>}
        <View
          className={classnames(styles.favoriteBtn, isFavorite && styles.favorited)}
          onClick={(e) => {
            e.stopPropagation()
            onFavorite(dish.id)
          }}
        >
          <Text className={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </View>
      </View>
      <View className={styles.info}>
        <Text className={styles.name}>{dish.name}</Text>
        <View className={styles.tags}>
          {dish.flavorTags.map((tag, i) => (
            <View key={i} className={styles.tag} style={{ color: tag.color, backgroundColor: `${tag.color}15` }}>
              {tag.name}
            </View>
          ))}
        </View>
        <View className={styles.bottom}>
          <View className={styles.priceRow}>
            <Text className={styles.price}>{formatPrice(dish.price)}</Text>
            {dish.originalPrice > dish.price && (
              <Text className={styles.originalPrice}>{formatPrice(dish.originalPrice)}</Text>
            )}
          </View>
          <View className={styles.salesRow}>
            <Text className={styles.sales}>月售{dish.salesCount}</Text>
            <Text className={styles.rating}>★{dish.rating}</Text>
          </View>
        </View>
        {dish.allergenTips.length > 0 && (
          <View className={styles.allergens}>
            {dish.allergenTips.map((tip, i) => (
              <Text key={i} className={styles.allergenTag}>{tip.name}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

export default DishCard