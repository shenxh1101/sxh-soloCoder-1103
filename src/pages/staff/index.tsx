import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useStore } from '@/store/useStore'
import { dishes } from '@/data/dishes'
import { formatPrice, getStatusColor, getStatusLabel } from '@/utils'

type StaffTab = 'pending' | 'all' | 'sales' | 'soldout' | 'refund'

const StaffPage: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    soldOutIds,
    toggleSoldOut,
    approveRefund,
    rejectRefund,
    completeRefund,
  } = useStore()
  const [activeTab, setActiveTab] = useState<StaffTab>('pending')

  const pendingOrders = useMemo(() => {
    return orders.filter((o) => o.orderStatus === 'pending')
  }, [orders])

  const activeOrders = useMemo(() => {
    return orders.filter(
      (o) => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
    )
  }, [orders])

  const refundOrders = useMemo(() => {
    return orders.filter((o) => !!o.refundStatus)
  }, [orders])

  const salesSummary = useMemo(() => {
    const completed = orders.filter((o) => o.orderStatus === 'completed')
    const total = completed.length
    const revenue = completed.reduce((s, o) => s + o.finalPrice, 0)
    const avgPrice = total > 0 ? revenue / total : 0

    const dishCounts: Record<string, { name: string; count: number }> = {}
    completed.forEach((o) => {
      o.items.forEach((item) => {
        if (!dishCounts[item.dishId]) {
          dishCounts[item.dishId] = { name: item.name, count: 0 }
        }
        dishCounts[item.dishId].count += item.quantity
      })
    })

    const topDishes = Object.values(dishCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return { total, revenue, avgPrice, topDishes }
  }, [orders])

  const handleConfirm = (orderId: string) => {
    updateOrderStatus(orderId, 'confirmed')
    Taro.showToast({ title: '已接单', icon: 'success' })
  }

  const handleStartPreparing = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing')
    Taro.showToast({ title: '开始制作', icon: 'success' })
  }

  const handleReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready')
    Taro.showToast({ title: '已通知取餐', icon: 'success' })
  }

  const handleComplete = (orderId: string) => {
    updateOrderStatus(orderId, 'completed')
    Taro.showToast({ title: '已完成取餐', icon: 'success' })
  }

  const handleCancel = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled')
    Taro.showToast({ title: '已取消', icon: 'none' })
  }

  const handleApproveRefund = (orderId: string) => {
    approveRefund(orderId)
    Taro.showToast({ title: '退款已通过', icon: 'success' })
  }

  const handleRejectRefund = (orderId: string) => {
    rejectRefund(orderId)
    Taro.showToast({ title: '退款已拒绝', icon: 'none' })
  }

  const handleCompleteRefund = (orderId: string) => {
    completeRefund(orderId)
    Taro.showToast({ title: '退款已完成', icon: 'success' })
  }

  const renderOrderCard = (order: typeof orders[0], showActions: boolean) => (
    <View key={order.id} className={styles.orderCard}>
      <View className={styles.orderHeader}>
        <Text className={styles.orderNo}>#{order.orderNo}</Text>
        <View style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text className={styles.orderTypeBadge}>
            {order.orderType === 'dine_in' ? `堂食 ${order.tableNo}` : '自取'}
          </Text>
          <Text
            className={styles.orderStatusBadge}
            style={{
              color: getStatusColor(order.orderStatus),
              backgroundColor: `${getStatusColor(order.orderStatus)}15`,
            }}
          >
            {getStatusLabel(order.orderStatus)}
          </Text>
        </View>
      </View>

      <View className={styles.itemList}>
        {order.items.map((item, i) => (
          <View key={i} className={styles.itemRow}>
            <Text className={styles.itemName}>{item.name}</Text>
            <Text className={styles.itemQty}>×{item.quantity}</Text>
          </View>
        ))}
      </View>

      <View className={styles.orderFooter}>
        {order.remark ? (
          <Text className={styles.orderRemark}>📝 {order.remark}</Text>
        ) : (
          <View />
        )}
        <Text className={styles.orderPrice}>{formatPrice(order.finalPrice)}</Text>
      </View>

      {showActions && (
        <View className={styles.actionBtns}>
          {order.orderStatus === 'pending' && (
            <>
              <View
                className={classnames(styles.actionBtn, styles.btnCancel)}
                onClick={() => handleCancel(order.id)}
              >
                <Text>拒绝</Text>
              </View>
              <View
                className={classnames(styles.actionBtn, styles.btnConfirm)}
                onClick={() => handleConfirm(order.id)}
              >
                <Text>接单</Text>
              </View>
            </>
          )}
          {order.orderStatus === 'confirmed' && (
            <>
              <View
                className={classnames(styles.actionBtn, styles.btnCancel)}
                onClick={() => handleCancel(order.id)}
              >
                <Text>取消</Text>
              </View>
              <View
                className={classnames(styles.actionBtn, styles.btnPreparing)}
                onClick={() => handleStartPreparing(order.id)}
              >
                <Text>开始制作</Text>
              </View>
            </>
          )}
          {order.orderStatus === 'preparing' && (
            <View
              className={classnames(styles.actionBtn, styles.btnReady)}
              onClick={() => handleReady(order.id)}
            >
              <Text>通知取餐</Text>
            </View>
          )}
          {order.orderStatus === 'ready' && (
            <View
              className={classnames(styles.actionBtn, styles.btnConfirm)}
              onClick={() => handleComplete(order.id)}
            >
              <Text>已取餐 / 完成</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )

  const renderRefundCard = (order: typeof orders[0]) => (
    <View key={order.id} className={styles.orderCard}>
      <View className={styles.orderHeader}>
        <Text className={styles.orderNo}>#{order.orderNo}</Text>
        <View style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text className={styles.orderPrice}>{formatPrice(order.finalPrice)}</Text>
        </View>
      </View>

      <View className={styles.refundInfo}>
        <Text className={styles.refundStatus}>
          {order.refundStatus === 'pending'
            ? '⏳ 待处理退款'
            : order.refundStatus === 'approved'
              ? '✅ 退款已通过'
              : order.refundStatus === 'rejected'
                ? '❌ 退款已拒绝'
                : '✓ 退款已完成'}
        </Text>
      </View>

      {order.refundStatus === 'pending' && (
        <View className={styles.actionBtns}>
          <View
            className={classnames(styles.actionBtn, styles.btnCancel)}
            onClick={() => handleRejectRefund(order.id)}
          >
            <Text>拒绝退款</Text>
          </View>
          <View
            className={classnames(styles.actionBtn, styles.btnConfirm)}
            onClick={() => handleApproveRefund(order.id)}
          >
            <Text>通过退款</Text>
          </View>
        </View>
      )}

      {order.refundStatus === 'approved' && (
        <View className={styles.actionBtns}>
          <View
            className={classnames(styles.actionBtn, styles.btnConfirm)}
            onClick={() => handleCompleteRefund(order.id)}
          >
            <Text>确认已退款</Text>
          </View>
        </View>
      )}
    </View>
  )

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>店员管理</Text>
        <Text className={styles.headerSubtitle}>今日营业中</Text>
      </View>

      <ScrollView scrollX className={styles.tabRow}>
        <View
          className={classnames(styles.tab, activeTab === 'pending' && styles.tabActive)}
          onClick={() => setActiveTab('pending')}
        >
          <Text
            className={classnames(
              styles.tabCount,
              activeTab === 'pending' && styles.tabCountActive
            )}
          >
            {pendingOrders.length}
          </Text>
          <Text
            className={classnames(
              styles.tabLabel,
              activeTab === 'pending' && styles.tabLabelActive
            )}
          >
            待接单
          </Text>
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'all' && styles.tabActive)}
          onClick={() => setActiveTab('all')}
        >
          <Text
            className={classnames(
              styles.tabCount,
              activeTab === 'all' && styles.tabCountActive
            )}
          >
            {activeOrders.length}
          </Text>
          <Text
            className={classnames(
              styles.tabLabel,
              activeTab === 'all' && styles.tabLabelActive
            )}
          >
            进行中
          </Text>
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'refund' && styles.tabActive)}
          onClick={() => setActiveTab('refund')}
        >
          <Text
            className={classnames(
              styles.tabCount,
              activeTab === 'refund' && styles.tabCountActive
            )}
          >
            {refundOrders.filter((o) => o.refundStatus === 'pending').length}
          </Text>
          <Text
            className={classnames(
              styles.tabLabel,
              activeTab === 'refund' && styles.tabLabelActive
            )}
          >
            退款
          </Text>
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'sales' && styles.tabActive)}
          onClick={() => setActiveTab('sales')}
        >
          <Text
            className={classnames(
              styles.tabCount,
              activeTab === 'sales' && styles.tabCountActive
            )}
          >
            ¥
          </Text>
          <Text
            className={classnames(
              styles.tabLabel,
              activeTab === 'sales' && styles.tabLabelActive
            )}
          >
            今日销量
          </Text>
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'soldout' && styles.tabActive)}
          onClick={() => setActiveTab('soldout')}
        >
          <Text
            className={classnames(
              styles.tabCount,
              activeTab === 'soldout' && styles.tabCountActive
            )}
          >
            {soldOutIds.length}
          </Text>
          <Text
            className={classnames(
              styles.tabLabel,
              activeTab === 'soldout' && styles.tabLabelActive
            )}
          >
            售罄管理
          </Text>
        </View>
      </ScrollView>

      {activeTab === 'pending' && (
        <ScrollView scrollY style={{ height: 'calc(100vh - 240rpx)' }}>
          {pendingOrders.length > 0 ? (
            pendingOrders.map((o) => renderOrderCard(o, true))
          ) : (
            <View className={styles.empty}>
              <Text className={styles.emptyText}>暂无待接单的订单 🎉</Text>
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'all' && (
        <ScrollView scrollY style={{ height: 'calc(100vh - 240rpx)' }}>
          {activeOrders.length > 0 ? (
            activeOrders.map((o) => renderOrderCard(o, true))
          ) : (
            <View className={styles.empty}>
              <Text className={styles.emptyText}>暂无进行中的订单</Text>
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'refund' && (
        <ScrollView scrollY style={{ height: 'calc(100vh - 240rpx)' }}>
          {refundOrders.length > 0 ? (
            refundOrders.map((o) => renderRefundCard(o))
          ) : (
            <View className={styles.empty}>
              <Text className={styles.emptyText}>暂无退款申请</Text>
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'sales' && (
        <ScrollView scrollY style={{ height: 'calc(100vh - 240rpx)' }}>
          <View className={styles.salesSection}>
            <View className={styles.salesCard}>
              <Text className={styles.salesTitle}>📊 今日销售总览</Text>
              <View className={styles.salesGrid}>
                <View className={styles.salesItem}>
                  <Text className={styles.salesValue}>{salesSummary.total}</Text>
                  <Text className={styles.salesLabel}>订单数</Text>
                </View>
                <View className={styles.salesItem}>
                  <Text className={styles.salesValue}>
                    ¥{salesSummary.revenue.toFixed(0)}
                  </Text>
                  <Text className={styles.salesLabel}>营业额</Text>
                </View>
                <View className={styles.salesItem}>
                  <Text className={styles.salesValue}>
                    ¥{salesSummary.avgPrice.toFixed(0)}
                  </Text>
                  <Text className={styles.salesLabel}>客单价</Text>
                </View>
              </View>

              {salesSummary.topDishes.length > 0 && (
                <View className={styles.topDishes}>
                  <Text className={styles.topDishesTitle}>🏆 热销菜品 TOP5</Text>
                  {salesSummary.topDishes.map((d, idx) => (
                    <View key={idx} className={styles.topDishRow}>
                      <View className={styles.topDishRank}>{idx + 1}</View>
                      <Text className={styles.topDishName}>{d.name}</Text>
                      <Text className={styles.topDishCount}>{d.count}份</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {activeTab === 'soldout' && (
        <ScrollView scrollY style={{ height: 'calc(100vh - 240rpx)' }}>
          <View className={styles.soldOutSection}>
            <Text className={styles.soldOutTitle}>菜品售罄管理</Text>
            {dishes.map((dish) => (
              <View key={dish.id} className={styles.dishManageItem}>
                <View>
                  <Text className={styles.dishManageName}>{dish.name}</Text>
                  {soldOutIds.includes(dish.id) && (
                    <Text className={styles.soldOutLabel}>已售罄</Text>
                  )}
                </View>
                <View
                  className={classnames(
                    styles.toggleSwitch,
                    soldOutIds.includes(dish.id) && styles.toggleSwitchOn
                  )}
                  onClick={() => toggleSoldOut(dish.id)}
                >
                  <View
                    className={classnames(
                      styles.toggleDot,
                      soldOutIds.includes(dish.id) && styles.toggleDotOn
                    )}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

export default StaffPage