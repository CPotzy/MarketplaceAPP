import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FavoriteItemCard } from '../components/FavoriteItemCard';
import { DatabaseService } from '../services';
import { FavoriteItem } from '../types';
import { Colors, Typography, Spacing } from '../theme';

export const FavoritesScreen: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>('All');

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [selectedFolder])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const items = await DatabaseService.getFavorites(
        selectedFolder === 'All' ? undefined : selectedFolder
      );
      setFavorites(items);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this item from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.removeFavorite(id);
              setFavorites(prev => prev.filter(item => item.id !== id));
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Error', 'Failed to remove favorite');
            }
          },
        },
      ]
    );
  };

  const handleTrackPrice = async (item: FavoriteItem) => {
    try {
      const isAlreadyTracking = await DatabaseService.isTracking(item.itemId);
      
      if (isAlreadyTracking) {
        Alert.alert('Already Tracking', 'This item is already being tracked');
        return;
      }

      await DatabaseService.addTrackedItem({
        itemId: item.itemId,
        title: item.title,
        originalPrice: item.price,
        currentPrice: item.price,
        currency: item.currency,
        sellerName: item.sellerName,
        sellerId: item.sellerId,
        imageUrl: item.imageUrl,
        itemUrl: item.itemUrl,
        location: item.location,
        condition: item.condition,
        category: item.category,
        price: item.price,
        dateAdded: Date.now(),
        lastChecked: Date.now(),
        checkFrequency: 2,
        isActive: true,
      });

      Alert.alert('Success', 'Item added to price tracking!');
    } catch (error) {
      console.error('Error adding to price tracking:', error);
      Alert.alert('Error', 'Failed to add item to price tracking');
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⭐</Text>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyText}>
        Items you save will appear here
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <FavoriteItemCard
      item={item}
      onRemove={handleRemoveFavorite}
      onTrackPrice={handleTrackPrice}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <Text style={styles.headerCount}>{favorites.length} items</Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadFavorites}
            colors={[Colors.light.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.light.text,
  },
  headerCount: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  listContent: {
    paddingVertical: Spacing.sm,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
