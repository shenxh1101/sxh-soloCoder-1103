import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import { Order } from '@/types'
import { formatPrice, getStatusLabel, getStatusColor } from '@/utils'

interface OrderCardProps {
  order: Order
  onDetail: (order: Order) => void
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onDetail }) => {
  return (
    <View className={styles.card} onClick={() => onDetail(order)}>
      <View className={styles.header}>
        <Text className={styles.orderNo}>#{order.orderNo}</Text>
        <Text className={styles.status} style={{ color: getStatusColor(order.orderStatus) }}>
          {getStatusLabel(order.orderStatus)}
        </Text>
      </View>
      <View className={styles.body}>
        {order.items.slice(0, 3).map((item, i) => (
          <View key={i} className={styles.itemRow}>
            <Text className={styles.itemName}>{item.name} ×{item.quantity}</Text>
            <Text className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
          </View>
        ))}
        {order.items.length > 3 && (
          <Text className={styles.moreItems}>等共{order.items.length}件商品</Text>
        )}
      </View>
      <View className={styles.footer}>
        <View className={styles.typeTag}>
          <Text className={styles.typeText}>{order.orderType === 'dine_in' ? `堂食 ${order.tableNo}` : '自取外带'}</Text>
        </View>
        {order.remark && (
          <Text className={styles.remark}>备注：{order.remark}</Text>
        )}
        <View className={styles.priceRow}>
          {order.discountAmount > 0 && (
            <Text className={styles.discount}>优惠¥{order.discountAmount}</Text>
          )}
          <Text className={styles.finalPrice}>实付{formatPrice(order.finalPrice)}</Text>
        </View>
      </View>
    </View>
  )
}

export default OrderCard