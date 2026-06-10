import React, { useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useStore } from '@/store/useStore'
import { formatPrice } from '@/utils'

const stepList = [
  { key: 'pending', label: '待确认' },
  { key: 'confirmed', label: '已接单' },
  { key: 'preparing', label: '制作中' },
  { key: 'ready', label: '可取餐' },
  { key: 'completed', label: '已完成' },
]

const PickupPage: React.FC = () => {
  const router = useRouter()
  const { orderId } = router.params
  const { orders, updateOrderStatus } = useStore()

  const order = useMemo(() => {
    return orders.find((o) => o.id === orderId) || orders[0]
  }, [orders, orderId])

  if (!order) {
    return (
      <View className={styles.page}>
        <View className={styles.notFound}>
          <Text className={styles.notFoundText}>未找到订单</Text>
        </View>
      </View>
    )
  }

  const currentStepIndex = stepList.findIndex((s) => s.key === order.orderStatus)
  const isActive = order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled'
  const headerBgColor = order.orderStatus === 'completed'
    ? 'linear-gradient(135deg, #86909C 0%, #C9CDD4 100%)'
    : order.orderStatus === 'cancelled'
      ? 'linear-gradient(135deg, #F53F3F 0%, #FF7875 100%)'
      : 'linear-gradient(135deg, #00B42A 0%, #00C853 100%)'

  const handleCancel = () => {
    updateOrderStatus(order.id, 'cancelled')
    Taro.showToast({ title: '订单已取消', icon: 'none' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header} style={{ background: headerBgColor }}>
        <View className={styles.queueSection}>
          <Text className={styles.queueLabel}>排队号</Text>
          <Text className={styles.queueNo}>{order.orderStatus === 'cancelled' ? '—' : order.queueNo}</Text>
          <Text className={styles.queueSuffix}>{order.orderStatus === 'cancelled' ? '' : '号'}</Text>
        </View>
        <View className={styles.waitSection}>
          <Text className={styles.waitLabel}>
            {order.orderStatus === 'completed'
              ? '取餐完毕'
              : order.orderStatus === 'cancelled'
                ? '已取消'
                : '预计等待'}
          </Text>
          <Text className={styles.waitTime}>
            {order.orderStatus === 'completed'
              ? '✓'
              : order.orderStatus === 'cancelled'
                ? '✕'
                : order.estimatedWaitTime}
          </Text>
          <Text className={styles.waitUnit}>
            {order.orderStatus === 'completed' || order.orderStatus === 'cancelled' ? '' : '分钟'}
          </Text>
        </View>
      </View>

      <View className={styles.statusBar}>
        <View className={styles.orderInfo}>
          <Text className={styles.orderNo}>订单号：{order.orderNo}</Text>
          <Text className={styles.orderType}>
            {order.orderType === 'dine_in' ? `堂食 ${order.tableNo}` : '自取外带'}
          </Text>
        </View>

        <View className={styles.steps}>
          <View className={styles.progressLine}>
            <View
              className={styles.progressFill}
              style={{
                width: `${currentStepIndex >= 0 ? (currentStepIndex / (stepList.length - 1)) * 100 : 0}%`,
              }}
            />
          </View>
          {stepList.map((step, idx) => (
            <View key={step.key} className={styles.step}>
              <View
                className={classnames(
                  styles.stepDot,
                  idx < currentStepIndex && styles.stepDotActive,
                  idx === currentStepIndex && styles.stepDotCurrent,
                  order.orderStatus === 'cancelled' && idx === currentStepIndex && styles.stepDotCancelled
                )}
              >
                {idx < currentStepIndex && <Text className={styles.stepDotCheck}>✓</Text>}
              </View>
              <Text
                className={classnames(
                  styles.stepText,
                  idx <= currentStepIndex && styles.stepTextActive
                )}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.itemsSection}>
        <Text className={styles.itemsTitle}>订单明细</Text>
        {order.items.map((item, i) => (
          <View key={i} className={styles.itemRow}>
            <View className={styles.itemLeft}>
              <Image className={styles.itemImage} src={item.image} mode="aspectFill" />
              <Text className={styles.itemName}>
                {item.name} ×{item.quantity}
              </Text>
            </View>
            <Text className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
          </View>
        ))}
        <View className={styles.priceSummary}>
          <Text className={styles.totalLabel}>
            合计
            {order.discountAmount > 0 ? `（优惠¥${order.discountAmount}）` : ''}
          </Text>
          <Text className={styles.totalValue}>{formatPrice(order.finalPrice)}</Text>
        </View>
      </View>

      {order.remark && (
        <View className={styles.remarkSection}>
          <Text className={styles.remarkIcon}>📝</Text>
          <Text className={styles.remarkText}>备注：{order.remark}</Text>
        </View>
      )}

      {isActive && (
        <View className={styles.cancelBtn} onClick={handleCancel}>
          <Text>取消订单</Text>
        </View>
      )}
    </View>
  )
}

export default PickupPage