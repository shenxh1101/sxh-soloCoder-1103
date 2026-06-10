import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { Coupon } from '@/types'

interface CouponCardProps {
  coupon: Coupon
  selected?: boolean
  onSelect?: (coupon: Coupon) => void
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, selected, onSelect }) => {
  const isExpired = new Date(coupon.expiredAt) < new Date()
  const isDisabled = coupon.isUsed || isExpired

  return (
    <View
      className={classnames(
        styles.card,
        isDisabled && styles.disabled,
        selected && styles.selected
      )}
      onClick={() => !isDisabled && onSelect?.(coupon)}
    >
      <View className={styles.left}>
        <Text className={styles.amount}>¥{coupon.discountAmount}</Text>
        <Text className={styles.condition}>{coupon.description}</Text>
      </View>
      <View className={styles.divider} />
      <View className={styles.right}>
        <Text className={styles.name}>{coupon.name}</Text>
        <Text className={styles.expire}>
          {isExpired ? '已过期' : coupon.isUsed ? '已使用' : `有效期至 ${coupon.expiredAt}`}
        </Text>
        {selected && <View className={styles.selectedBadge}>已选</View>}
      </View>
    </View>
  )
}

export default CouponCard