import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import styles from './index.module.scss'
import { Review } from '@/types'
import { formatTime } from '@/utils'

interface ReviewCardProps {
  review: Review
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <View className={styles.card}>
      <Image className={styles.image} src={review.dishImage} mode="aspectFill" />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.dishName}>{review.dishName}</Text>
          <View className={styles.stars}>
            {Array.from({ length: 5 }, (_, i) => (
              <Text key={i} className={styles.star}>{i < review.rating ? '★' : '☆'}</Text>
            ))}
          </View>
        </View>
        <Text className={styles.reviewText}>{review.content}</Text>
        <Text className={styles.time}>{formatTime(review.createdAt)}</Text>
      </View>
    </View>
  )
}

export default ReviewCard