import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TrackedItemCard } from '../components/TrackedItemCard';
import { DatabaseService } from '../services';
import { TrackedItem, PriceHistory } from '../types';
import { Colors, Typography, Spacing } from '../theme';

export const TrackScreen: React.FC = () => {
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<TrackedItem | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTrackedItems();
    }, [])
  );

  const loadTrackedItems = async () => {
    try {
      setLoading(true);
      const items = await DatabaseService.getTrackedItems();
      setTrackedItems(items);
    } catch (error) {
      console.error('Error loading tracked items:', error);
      Alert.alert('Error', 'Failed to load tracked items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTrackedItem = async (id: string) => {
    Alert.alert(
      'Stop Tracking',
      'Are you sure you want to stop tracking this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.removeTrackedItem(id);
              setTrackedItems(prev => prev.filter(item => item.id !== id));
            } catch (error) {
              console.error('Error removing tracked item:', error);
              Alert.alert('Error', 'Failed to stop tracking');
            }
          },
        },
      ]
    );
  };

  const handleViewHistory = async (item: TrackedItem) => {
    try {
      const history = await DatabaseService.getPriceHistory(item.itemId);
      setPriceHistory(history);
      setSelectedItem(item);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error loading price history:', error);
      Alert.alert('Error', 'Failed to load price history');
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No Items Tracked</Text>
      <Text style={styles.emptyText}>
        Track items to monitor price changes
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: TrackedItem }) => (
    <TrackedItemCard
      item={item}
      onRemove={handleRemoveTrackedItem}
      onViewHistory={handleViewHistory}
    />
  );

  const renderHistoryItem = ({ item }: { item: PriceHistory }) => {
    const date = new Date(item.timestamp);
    return (
      <View style={styles.historyItem}>
        <Text style={styles.historyPrice}>
          ${item.price.toFixed(2)}
        </Text>
        <Text style={styles.historyDate}>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Price Tracking</Text>
        <Text style={styles.headerCount}>{trackedItems.length} items</Text>
      </View>

      <FlatList
        data={trackedItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadTrackedItems}
            colors={[Colors.light.primary]}
          />
        }
      />

      {/* Price History Modal */}
      <Modal
        visible={showHistoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Price History</Text>
              <TouchableOpacity
                onPress={() => setShowHistoryModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <Text style={styles.modalItemTitle} numberOfLines={2}>
                {selectedItem.title}
              </Text>
            )}

            <FlatList
              data={priceHistory}
              renderItem={renderHistoryItem}
              keyExtractor={item => item.id}
              style={styles.historyList}
              ListEmptyComponent={
                <Text style={styles.emptyHistoryText}>No price history yet</Text>
              }
            />
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.light.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.light.textSecondary,
  },
  modalItemTitle: {
    ...Typography.bodyBold,
    color: Colors.light.text,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  historyList: {
    paddingHorizontal: Spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  historyPrice: {
    ...Typography.h3,
    color: Colors.light.primary,
  },
  historyDate: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  emptyHistoryText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
