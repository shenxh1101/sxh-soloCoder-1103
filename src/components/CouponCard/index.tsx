import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { Coupon } from '@/types'
import { formatPrice } from '@/utils'

const DAY_MS = 24 * 60 * 60 * 1000

function isExpiringSoon(expiredAt: string): boolean {
  const diff = new Date(expiredAt).getTime() - Date.now()
  return diff > 0 && diff < 3 * DAY_MS
}

interface CouponCardProps {
  coupon: Coupon
  selected?: boolean
  onSelect?: (coupon: Coupon) => void
  totalPrice?: number
  usedCouponIds?: string[]
  disabledReason?: string
  showDisabledReason?: boolean
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  selected,
  onSelect,
  totalPrice,
  usedCouponIds = [],
  disabledReason,
  showDisabledReason,
}) => {
  const isExpired = new Date(coupon.expiredAt) < new Date()
  const isUsed = coupon.isUsed || usedCouponIds.includes(coupon.id)
  const isDisabled = isUsed || isExpired
  const expiring = isExpiringSoon(coupon.expiredAt)

  const gapAmount = totalPrice !== undefined && totalPrice < coupon.minOrderAmount
    ? coupon.minOrderAmount - totalPrice
    : 0

  const clickable = !isDisabled && !showDisabledReason

  return (
    <View
      className={classnames(
        styles.card,
        isDisabled && styles.disabled,
        selected && styles.selected,
        showDisabledReason && styles.unavailable
      )}
      onClick={() => clickable && onSelect?.(coupon)}
    >
      <View className={styles.left}>
        <Text className={styles.amount}>¥{coupon.discountAmount}</Text>
        <Text className={styles.condition}>{coupon.description}</Text>
      </View>
      <View className={styles.divider} />
      <View className={styles.right}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{coupon.name}</Text>
          {expiring && !isDisabled && (
            <View className={styles.expiringTag}>
              <Text className={styles.expiringText}>即将过期</Text>
            </View>
          )}
          {coupon.couponType === 'category' && coupon.categoryName && (
            <View className={styles.categoryTag}>
              <Text className={styles.categoryText}>{coupon.categoryName}</Text>
            </View>
          )}
        </View>
        <Text className={styles.expire}>
          {isExpired ? '已过期' : isUsed ? '已使用' : `有效期至 ${coupon.expiredAt}`}
        </Text>
        {disabledReason && showDisabledReason && (
          <Text className={styles.disabledHint}>{disabledReason}</Text>
        )}
        {gapAmount > 0 && !isDisabled && !showDisabledReason && (
          <Text className={styles.gapHint}>还差{formatPrice(gapAmount)}可用</Text>
        )}
        {selected && <View className={styles.selectedBadge}>已选</View>}
      </View>
    </View>
  )
}

export default CouponCard