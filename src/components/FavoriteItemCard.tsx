import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { FavoriteItem } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface FavoriteItemCardProps {
  item: FavoriteItem;
  onRemove: (id: string) => void;
  onTrackPrice?: (item: FavoriteItem) => void;
}

export const FavoriteItemCard: React.FC<FavoriteItemCardProps> = ({
  item,
  onRemove,
  onTrackPrice,
}) => {
  const handleOpenItem = () => {
    Linking.openURL(item.itemUrl);
  };

  const formatPrice = () => {
    return `${item.currency || '$'}${item.price.toFixed(2)}`;
  };

  const formatDate = () => {
    const date = new Date(item.dateSaved);
    return date.toLocaleDateString();
  };

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
        <Text style={styles.price}>{formatPrice()}</Text>
        {item.location && (
          <Text style={styles.location} numberOfLines={1}>
            📍 {item.location}
          </Text>
        )}
        <Text style={styles.date}>Saved {formatDate()}</Text>
        {!item.isAvailable && (
          <Text style={styles.unavailable}>❌ No longer available</Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onTrackPrice?.(item)}
        >
          <Text style={styles.actionText}>📊</Text>
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
  price: {
    ...Typography.h3,
    color: Colors.light.primary,
    marginTop: Spacing.xs,
  },
  location: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  date: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  unavailable: {
    ...Typography.small,
    color: Colors.light.error,
    marginTop: Spacing.xs,
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
