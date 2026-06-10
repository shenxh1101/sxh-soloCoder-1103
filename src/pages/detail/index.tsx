import React, { useState, useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { dishes } from '@/data/dishes'
import { useStore } from '@/store/useStore'
import SpecSelector from '@/components/SpecSelector'
import { formatPrice } from '@/utils'

const DetailPage: React.FC = () => {
  const router = useRouter()
  const { id } = router.params
  const { addToCart, toggleFavorite, isFavorite, soldOutIds } = useStore()

  const dish = useMemo(() => dishes.find((d) => d.id === id), [id])

  const [selectedSpecId, setSelectedSpecId] = useState(dish?.specs[0]?.id || '')
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (!dish) {
    return (
      <View className={styles.page}>
        <Text>菜品不存在</Text>
      </View>
    )
  }

  const isSold = soldOutIds.includes(dish.id)
  const selectedSpec = dish.specs.find((s) => s.id === selectedSpecId) || dish.specs[0]
  const extraPrice = dish.extras
    .filter((e) => selectedExtraIds.includes(e.id))
    .reduce((sum, e) => sum + e.price, 0)
  const totalPrice = (selectedSpec.price + extraPrice) * quantity

  const handleAddToCart = () => {
    if (isSold) return

    const extraNames = dish.extras
      .filter((e) => selectedExtraIds.includes(e.id))
      .map((e) => e.name)

    addToCart({
      dishId: dish.id,
      name: dish.name,
      image: dish.image,
      specId: selectedSpec.id,
      specName: selectedSpec.name,
      extraIds: selectedExtraIds,
      extraNames,
      price: selectedSpec.price + extraPrice,
      quantity,
    })

    setAdded(true)
    Taro.showToast({ title: '已加入购物车', icon: 'success' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.imageWrap}>
        <Image className={styles.heroImage} src={dish.image} mode="aspectFill" />
        <View className={styles.imageTags}>
          {dish.isHot && <View className={styles.hotTag}>热卖</View>}
          {dish.isNew && <View className={styles.newTag}>新品</View>}
          {isSold && <View className={styles.soldOutTag}>已售罄</View>}
        </View>
        <View
          className={styles.favBtn}
          onClick={() => toggleFavorite(dish.id)}
        >
          <Text>{isFavorite(dish.id) ? '❤️' : '🤍'}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.foodHeader}>
          <Text className={styles.foodName}>{dish.name}</Text>
        </View>

        <View className={styles.priceRow}>
          <Text className={styles.price}>{formatPrice(selectedSpec.price + extraPrice)}</Text>
          {dish.originalPrice > selectedSpec.price && (
            <Text className={styles.originalPrice}>{formatPrice(dish.originalPrice)}</Text>
          )}
        </View>

        {dish.flavorTags.length > 0 && (
          <View className={styles.flavorTags}>
            {dish.flavorTags.map((tag, i) => (
              <View
                key={i}
                className={styles.flavorTag}
                style={{ color: tag.color, backgroundColor: `${tag.color}15` }}
              >
                {tag.name}
              </View>
            ))}
          </View>
        )}

        {dish.allergenTips.length > 0 && (
          <View className={styles.allergenRow}>
            <Text className={styles.allergenLabel}>⚠️ 过敏提示：</Text>
            {dish.allergenTips.map((tip, i) => (
              <Text key={i} className={styles.allergenTag}>{tip.name}</Text>
            ))}
          </View>
        )}

        <View className={styles.metaRow}>
          <Text className={styles.salesCount}>月售 {dish.salesCount}</Text>
          <Text className={styles.rating}>★ {dish.rating}</Text>
        </View>

        <Text className={styles.description}>{dish.description}</Text>
      </View>

      <Text className={styles.sectionTitle}>规格选择</Text>
      <SpecSelector
        specs={dish.specs}
        extras={dish.extras}
        selectedSpecId={selectedSpecId}
        selectedExtraIds={selectedExtraIds}
        onSpecChange={setSelectedSpecId}
        onExtraToggle={(extraId) => {
          setSelectedExtraIds((prev) =>
            prev.includes(extraId)
              ? prev.filter((id) => id !== extraId)
              : [...prev, extraId]
          )
        }}
      />

      <View className={styles.bottomBar}>
        <View className={styles.qtyCtrl}>
          <View
            className={styles.qtyBtn}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text>−</Text>
          </View>
          <Text className={styles.qty}>{quantity}</Text>
          <View
            className={styles.qtyBtn}
            onClick={() => setQuantity(quantity + 1)}
          >
            <Text>+</Text>
          </View>
        </View>
        <View
          className={classnames(styles.addBtn, isSold && styles.addBtnDisabled)}
          onClick={handleAddToCart}
        >
          <Text className={styles.addBtnText}>
            {isSold ? '已售罄' : added ? '已加入，再加一份' : '加入购物车'}
          </Text>
          <Text className={styles.currentPrice}>{formatPrice(totalPrice)}</Text>
        </View>
      </View>
    </View>
  )
}

export default DetailPage