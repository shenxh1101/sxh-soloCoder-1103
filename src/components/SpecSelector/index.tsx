import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { SpecOption, ExtraOption } from '@/types'
import { formatPrice } from '@/utils'

interface SpecSelectorProps {
  specs: SpecOption[]
  extras: ExtraOption[]
  selectedSpecId: string
  selectedExtraIds: string[]
  onSpecChange: (specId: string) => void
  onExtraToggle: (extraId: string) => void
}

const SpecSelector: React.FC<SpecSelectorProps> = ({
  specs,
  extras,
  selectedSpecId,
  selectedExtraIds,
  onSpecChange,
  onExtraToggle,
}) => {
  return (
    <View className={styles.container}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>规格</Text>
        <View className={styles.options}>
          {specs.map((spec) => (
            <View
              key={spec.id}
              className={classnames(styles.option, selectedSpecId === spec.id && styles.optionActive)}
              onClick={() => onSpecChange(spec.id)}
            >
              <Text className={classnames(styles.optionText, selectedSpecId === spec.id && styles.optionTextActive)}>
                {spec.name}
              </Text>
              {spec.price > 0 && (
                <Text className={classnames(styles.optionPrice, selectedSpecId === spec.id && styles.optionTextActive)}>
                  {formatPrice(spec.price)}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {extras.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>加料</Text>
          <View className={styles.options}>
            {extras.map((extra) => (
              <View
                key={extra.id}
                className={classnames(
                  styles.option,
                  selectedExtraIds.includes(extra.id) && styles.optionActive
                )}
                onClick={() => onExtraToggle(extra.id)}
              >
                <Text
                  className={classnames(
                    styles.optionText,
                    selectedExtraIds.includes(extra.id) && styles.optionTextActive
                  )}
                >
                  {extra.name}
                </Text>
                <Text
                  className={classnames(
                    styles.optionPrice,
                    selectedExtraIds.includes(extra.id) && styles.optionTextActive
                  )}
                >
                  +{formatPrice(extra.price)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

export default SpecSelector