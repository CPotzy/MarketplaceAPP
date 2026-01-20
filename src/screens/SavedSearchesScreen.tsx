import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DatabaseService from '../services/DatabaseService';
import { Colors } from '../theme';
import type { SearchAlert } from '../types';

export const SavedSearchesScreen: React.FC = () => {
  const [searches, setSearches] = useState<SearchAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSearches = async () => {
    try {
      const savedSearches = await DatabaseService.getSearchAlerts();
      setSearches(savedSearches);
    } catch (error) {
      console.error('Error loading saved searches:', error);
      Alert.alert('Error', 'Failed to load saved searches');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSearches();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSearches();
    setRefreshing(false);
  };

  const handleToggleAlert = async (id: string, currentState: boolean) => {
    try {
      await DatabaseService.toggleAlert(id, !currentState);
      await loadSearches();
    } catch (error) {
      console.error('Error toggling alert:', error);
      Alert.alert('Error', 'Failed to update alert');
    }
  };

  const handleDeleteSearch = (id: string, name: string) => {
    Alert.alert(
      'Delete Search',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.removeSearchAlert(id);
              await loadSearches();
            } catch (error) {
              console.error('Error deleting search:', error);
              Alert.alert('Error', 'Failed to delete search');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Any';
    return `$${price.toFixed(0)}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderSearchItem = ({ item }: { item: SearchAlert }) => (
    <View style={styles.searchCard}>
      <View style={styles.searchHeader}>
        <View style={styles.searchHeaderLeft}>
          <Text style={styles.searchName}>{item.name}</Text>
          {item.newResultsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.newResultsCount} new</Text>
            </View>
          )}
        </View>
        <Switch
          value={item.isActive}
          onValueChange={() => handleToggleAlert(item.id, item.isActive)}
          trackColor={{ false: '#ccc', true: Colors.light.primary }}
        />
      </View>

      <View style={styles.searchDetails}>
        <Text style={styles.detailText}>
          🔍 <Text style={styles.detailValue}>{item.keywords || 'All items'}</Text>
        </Text>
        
        {item.category && (
          <Text style={styles.detailText}>
            📁 <Text style={styles.detailValue}>{item.category}</Text>
          </Text>
        )}
        
        <Text style={styles.detailText}>
          💰 <Text style={styles.detailValue}>
            {formatPrice(item.minPrice)} - {formatPrice(item.maxPrice)}
          </Text>
        </Text>

        {item.location && (
          <Text style={styles.detailText}>
            📍 <Text style={styles.detailValue}>
              {item.location} ({item.radius || 20} miles)
            </Text>
          </Text>
        )}

        <Text style={styles.detailText}>
          🔔 <Text style={styles.detailValue}>
            {item.frequency === 'realtime' ? 'Real-time' : 
             item.frequency === 'hourly' ? 'Every hour' :
             item.frequency === 'daily' ? 'Daily' : 'Weekly'}
          </Text>
        </Text>
      </View>

      <View style={styles.searchFooter}>
        <Text style={styles.dateText}>
          Created {formatDate(item.dateCreated)}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSearch(item.id, item.name)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No Saved Searches</Text>
      <Text style={styles.emptyText}>
        Save searches from the Search tab to get notified when new items are posted
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Searches</Text>
        <Text style={styles.headerSubtitle}>
          {searches.length} active {searches.length === 1 ? 'search' : 'searches'}
        </Text>
      </View>

      <FlatList
        data={searches}
        renderItem={renderSearchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={searches.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
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
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  badge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    color: Colors.light.text,
    fontWeight: '500',
  },
  searchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
