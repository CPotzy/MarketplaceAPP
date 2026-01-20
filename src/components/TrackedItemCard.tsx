import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { TrackedItem } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface TrackedItemCardProps {
  item: TrackedItem;
  onRemove: (id: string) => void;
  onViewHistory: (item: TrackedItem) => void;
}

export const TrackedItemCard: React.FC<TrackedItemCardProps> = ({
  item,
  onRemove,
  onViewHistory,
}) => {
  const handleOpenItem = () => {
    Linking.openURL(item.itemUrl);
  };

  const formatPrice = (price: number) => {
    return `${item.currency || '$'}${price.toFixed(2)}`;
  };

  const getPriceChange = () => {
    const diff = item.currentPrice - item.originalPrice;
    const percentChange = ((diff / item.originalPrice) * 100).toFixed(1);
    return { diff, percentChange };
  };

  const { diff, percentChange } = getPriceChange();
  const priceIncreased = diff > 0;
  const priceDecreased = diff < 0;
  const priceUnchanged = diff === 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleOpenItem}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>{formatPrice(item.currentPrice)}</Text>
          {!priceUnchanged && (
            <View
              style={[
                styles.priceChange,
                priceIncreased && styles.priceIncreased,
                priceDecreased && styles.priceDecreased,
              ]}
            >
              <Text
                style={[
                  styles.priceChangeText,
                  priceIncreased && styles.priceIncreasedText,
                  priceDecreased && styles.priceDecreasedText,
                ]}
              >
                {priceIncreased ? '↑' : '↓'} {Math.abs(diff).toFixed(2)} ({percentChange}%)
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.originalPrice}>
          Original: {formatPrice(item.originalPrice)}
        </Text>

        {item.alertPrice && (
          <Text style={styles.alertPrice}>
            Alert: {formatPrice(item.alertPrice)}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onViewHistory(item)}
        >
          <Text style={styles.actionText}>📈</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => onRemove(item.id)}
        >
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    ...Shadows.sm,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.border,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.sm,
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.light.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  currentPrice: {
    ...Typography.h3,
    color: Colors.light.primary,
  },
  priceChange: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  priceIncreased: {
    backgroundColor: '#FFE5E5',
  },
  priceDecreased: {
    backgroundColor: '#E5F7E5',
  },
  priceChangeText: {
    ...Typography.small,
    fontWeight: '600' as '600',
  },
  priceIncreasedText: {
    color: Colors.light.priceUp,
  },
  priceDecreasedText: {
    color: Colors.light.priceDown,
  },
  originalPrice: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    textDecorationLine: 'line-through',
  },
  alertPrice: {
    ...Typography.small,
    color: Colors.light.warning,
  },
  actions: {
    justifyContent: 'space-around',
    marginLeft: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#FFE5E5',
  },
  actionText: {
    fontSize: 20,
  },
});
