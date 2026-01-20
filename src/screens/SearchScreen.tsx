import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

export const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleSearch = () => {
    // Build search URL
    let searchUrl = 'https://m.facebook.com/marketplace/search/?query=';
    
    if (searchQuery) {
      searchUrl += encodeURIComponent(searchQuery);
    }
    
    // Open in system browser or could update the WebView in HomeScreen
    Linking.openURL(searchUrl);
  };

  const quickSearches = [
    '🏠 Furniture',
    '📱 Electronics',
    '👕 Clothing',
    '🚗 Vehicles',
    '🏡 Home & Garden',
    '🎮 Gaming',
    '⚽ Sports',
    '📚 Books',
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Marketplace</Text>
      </View>

      <View style={styles.searchSection}>
        <Text style={styles.label}>What are you looking for?</Text>
        <TextInput
          style={styles.input}
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.light.textSecondary}
        />

        <Text style={styles.label}>Price Range</Text>
        <View style={styles.priceRow}>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="Min"
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
            placeholderTextColor={Colors.light.textSecondary}
          />
          <Text style={styles.priceSeparator}>to</Text>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="Max"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location..."
          value={selectedLocation}
          onChangeText={setSelectedLocation}
          placeholderTextColor={Colors.light.textSecondary}
        />

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍 Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickSearchSection}>
        <Text style={styles.sectionTitle}>Quick Searches</Text>
        <View style={styles.quickSearchGrid}>
          {quickSearches.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickSearchItem}
              onPress={() => {
                setSearchQuery(item.substring(2)); // Remove emoji
                handleSearch();
              }}
            >
              <Text style={styles.quickSearchText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.light.text,
  },
  searchSection: {
    padding: Spacing.md,
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 1,
  },
  priceSeparator: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginHorizontal: Spacing.sm,
  },
  searchButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  searchButtonText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 18,
  },
  quickSearchSection: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  quickSearchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  quickSearchItem: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    margin: Spacing.xs,
    minWidth: '45%',
    alignItems: 'center',
  },
  quickSearchText: {
    ...Typography.body,
    color: Colors.light.text,
  },
});
