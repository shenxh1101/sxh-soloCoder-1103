import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { DishCategory } from '@/types'

interface CategoryTabsProps {
  categories: DishCategory[]
  activeId: string
  onChange: (id: string) => void
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeId, onChange }) => {
  return (
    <View className={styles.wrapper}>
      <ScrollView scrollX className={styles.scrollContainer}>
        {categories.map((cat) => (
          <View
            key={cat.id}
            className={classnames(styles.tab, activeId === cat.id && styles.active)}
            onClick={() => onChange(cat.id)}
          >
            <Text className={styles.tabIcon}>{cat.icon}</Text>
            <Text className={styles.tabText}>{cat.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default CategoryTabs