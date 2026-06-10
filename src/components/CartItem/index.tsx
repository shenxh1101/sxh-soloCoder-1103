import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import styles from './index.module.scss'
import { CartDishItem } from '@/types'
import { formatPrice } from '@/utils'

interface CartItemProps {
  item: CartDishItem
  onMinus: (id: string) => void
  onPlus: (id: string) => void
  onRemove: (id: string) => void
}

const CartItem: React.FC<CartItemProps> = ({ item, onMinus, onPlus, onRemove }) => {
  return (
    <View className={styles.item}>
      <Image className={styles.image} src={item.image} mode="aspectFill" />
      <View className={styles.info}>
        <Text className={styles.name}>{item.name}</Text>
        <Text className={styles.spec}>{item.specName}{item.extraNames.length > 0 ? ` + ${item.extraNames.join('、')}` : ''}</Text>
        <View className={styles.bottom}>
          <Text className={styles.price}>{formatPrice(item.price)}</Text>
          <View className={styles.qtyCtrl}>
            <View className={styles.qtyBtn} onClick={() => onMinus(item.id)}>
              <Text className={styles.qtyIcon}>−</Text>
            </View>
            <Text className={styles.qty}>{item.quantity}</Text>
            <View className={styles.qtyBtn} onClick={() => onPlus(item.id)}>
              <Text className={styles.qtyIcon}>+</Text>
            </View>
          </View>
        </View>
      </View>
      <View className={styles.removeBtn} onClick={() => onRemove(item.id)}>
        <Text className={styles.removeIcon}>×</Text>
      </View>
    </View>
  )
}

export default CartItem