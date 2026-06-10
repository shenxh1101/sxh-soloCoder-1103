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

function getRefundLabel(status: string | null): string {
  const map: Record<string, string> = {
    pending: '退款审核中',
    approved: '退款已通过',
    rejected: '退款已拒绝',
    completed: '已退款',
  }
  return status ? map[status] || '' : ''
}

function getRefundColor(status: string | null): string {
  const map: Record<string, string> = {
    pending: '#FF7D00',
    approved: '#00B42A',
    rejected: '#C9CDD4',
    completed: '#00B42A',
  }
  return status ? map[status] || '#86909C' : '#86909C'
}

const PickupPage: React.FC = () => {
  const router = useRouter()
  const { orderId } = router.params
  const { orders, updateOrderStatus, requestRefund, urgeOrder } = useStore()

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
  const showPickupCode = order.orderStatus === 'ready'

  const headerBgColor =
    order.orderStatus === 'completed'
      ? 'linear-gradient(135deg, #86909C 0%, #C9CDD4 100%)'
      : order.orderStatus === 'cancelled'
        ? 'linear-gradient(135deg, #F53F3F 0%, #FF7875 100%)'
        : showPickupCode
          ? 'linear-gradient(135deg, #00B42A 0%, #00C853 100%)'
          : 'linear-gradient(135deg, #00B42A 0%, #00C853 100%)'

  const handleCancel = () => {
    updateOrderStatus(order.id, 'cancelled')
    Taro.showToast({ title: '订单已取消', icon: 'none' })
  }

  const handleUrge = () => {
    urgeOrder(order.id)
  }

  const handleRefund = () => {
    if (order.refundStatus) {
      Taro.showToast({ title: getRefundLabel(order.refundStatus), icon: 'none' })
      return
    }
    Taro.showModal({
      title: '申请退款',
      content: '确认申请退款？款项将退回余额',
      success: (res) => {
        if (res.confirm) {
          requestRefund(order.id)
          Taro.showToast({ title: '退款申请已提交', icon: 'success' })
        }
      },
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header} style={{ background: headerBgColor }}>
        {showPickupCode ? (
          <View className={styles.pickupCodeSection}>
            <Text className={styles.pickupCodeLabel}>取餐码</Text>
            <Text className={styles.pickupCode}>{order.pickupCode || '————'}</Text>
            <Text className={styles.pickupCodeTip}>请向店员出示此码取餐</Text>
          </View>
        ) : (
          <>
            <View className={styles.queueSection}>
              <Text className={styles.queueLabel}>排队号</Text>
              <Text className={styles.queueNo}>
                {order.orderStatus === 'cancelled' ? '—' : order.queueNo}
              </Text>
              <Text className={styles.queueSuffix}>
                {order.orderStatus === 'cancelled' ? '' : '号'}
              </Text>
            </View>
            <View className={styles.waitSection}>
              <Text className={styles.waitLabel}>
                {order.orderStatus === 'completed' ? '取餐完毕' : order.orderStatus === 'cancelled' ? '已取消' : '预计等待'}
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
          </>
        )}
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
                width: `${
                  currentStepIndex >= 0
                    ? (currentStepIndex / (stepList.length - 1)) * 100
                    : 0
                }%`,
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

        <View className={styles.costBreakdown}>
          <View className={styles.costRow}>
            <Text className={styles.costLabel}>菜品小计</Text>
            <Text className={styles.costValue}>{formatPrice(order.totalPrice)}</Text>
          </View>
          {order.discountAmount > 0 && (
            <View className={styles.costRow}>
              <Text className={styles.costLabel}>优惠券</Text>
              <Text className={styles.costDiscount}>-{formatPrice(order.discountAmount)}</Text>
            </View>
          )}
          {order.usedBalance > 0 && (
            <View className={styles.costRow}>
              <Text className={styles.costLabel}>余额抵扣</Text>
              <Text className={styles.costDiscount}>-{formatPrice(order.usedBalance)}</Text>
            </View>
          )}
          {order.earnedPoints > 0 && (
            <View className={styles.costRow}>
              <Text className={styles.costLabel}>获得积分</Text>
              <Text className={styles.costPoints}>+{order.earnedPoints}</Text>
            </View>
          )}
        </View>

        <View className={styles.priceSummary}>
          <Text className={styles.totalLabel}>实付</Text>
          <Text className={styles.totalValue}>{formatPrice(order.finalPrice)}</Text>
        </View>
      </View>

      {order.remark && (
        <View className={styles.remarkSection}>
          <Text className={styles.remarkIcon}>📝</Text>
          <Text className={styles.remarkText}>备注：{order.remark}</Text>
        </View>
      )}

      {order.refundStatus && (
        <View className={styles.refundBanner} style={{ borderColor: getRefundColor(order.refundStatus) }}>
          <Text className={styles.refundBannerText} style={{ color: getRefundColor(order.refundStatus) }}>
            {getRefundLabel(order.refundStatus)}
          </Text>
        </View>
      )}

      {order.orderStatus === 'pending' && (
        <View className={styles.actionArea}>
          <View className={styles.cancelBtn} onClick={handleCancel}>
            <Text>取消订单</Text>
          </View>
        </View>
      )}

      {order.orderStatus === 'preparing' && (
        <View className={styles.actionArea}>
          <View className={styles.urgeBtn} onClick={handleUrge}>
            <Text>🔔 催单</Text>
          </View>
        </View>
      )}

      {order.orderStatus === 'completed' && !order.refundStatus && (
        <View className={styles.actionArea}>
          <View className={styles.refundBtn} onClick={handleRefund}>
            <Text>申请退款</Text>
          </View>
        </View>
      )}

      {order.orderStatus === 'completed' && order.refundStatus && (
        <View className={styles.actionArea}>
          <View
            className={styles.refundBtn}
            style={{
              opacity: 0.6,
              background: getRefundColor(order.refundStatus),
            }}
            onClick={handleRefund}
          >
            <Text>{getRefundLabel(order.refundStatus)}</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default PickupPage