import React, { useRef, useState } from 'react';
import { View, StyleSheet, Alert, Share } from 'react-native';
import { WebView } from 'react-native-webview';
import { MarketplaceWebView, FloatingActionButton } from '../components';
import { DatabaseService } from '../services';
import { Colors } from '../theme';

export const HomeScreen: React.FC = () => {
  const [currentItemData, setCurrentItemData] = useState<any>(null);

  const handleItemDataExtracted = (data: any) => {
    console.log('Item data received in HomeScreen:', data);
    setCurrentItemData(data);
  };

  const handleSaveFavorite = async () => {
    if (!currentItemData || !currentItemData.itemId) {
      Alert.alert('No Item', 'Please navigate to an item page first');
      return;
    }

    try {
      const isAlreadyFavorite = await DatabaseService.isFavorite(currentItemData.itemId);
      
      if (isAlreadyFavorite) {
        Alert.alert('Already Saved', 'This item is already in your favorites');
        return;
      }

      await DatabaseService.addFavorite({
        itemId: currentItemData.itemId,
        title: currentItemData.title || 'Untitled',
        price: parseFloat(currentItemData.priceText?.replace(/[^0-9.]/g, '') || '0'),
        currency: '$',
        sellerName: '',
        sellerId: '',
        imageUrl: '',
        itemUrl: currentItemData.url,
        location: '',
        condition: '',
        category: '',
        folder: 'All',
        tags: [],
        dateSaved: Date.now(),
        lastChecked: Date.now(),
        isAvailable: true,
      });

      Alert.alert('Success', 'Item saved to favorites!');
    } catch (error) {
      console.error('Error saving favorite:', error);
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const handleTrackPrice = async () => {
    if (!currentItemData || !currentItemData.itemId) {
      Alert.alert('No Item', 'Please navigate to an item page first');
      return;
    }

    try {
      const isAlreadyTracking = await DatabaseService.isTracking(currentItemData.itemId);
      
      if (isAlreadyTracking) {
        Alert.alert('Already Tracking', 'This item is already being tracked');
        return;
      }

      const price = parseFloat(currentItemData.priceText?.replace(/[^0-9.]/g, '') || '0');

      await DatabaseService.addTrackedItem({
        itemId: currentItemData.itemId,
        title: currentItemData.title || 'Untitled',
        originalPrice: price,
        currentPrice: price,
        currency: '$',
        sellerName: '',
        sellerId: '',
        imageUrl: '',
        itemUrl: currentItemData.url,
        location: '',
        condition: '',
        category: '',
        price: price,
        dateAdded: Date.now(),
        lastChecked: Date.now(),
        checkFrequency: 2,
        isActive: true,
      });

      Alert.alert('Success', 'Item added to price tracking!');
    } catch (error) {
      console.error('Error adding to price tracking:', error);
      Alert.alert('Error', 'Failed to track price');
    }
  };

  const handleShare = async () => {
    if (!currentItemData || !currentItemData.url) {
      Alert.alert('No Item', 'Please navigate to an item page first');
      return;
    }

    try {
      await Share.share({
        message: currentItemData.url,
        title: currentItemData.title || 'Check out this item',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MarketplaceWebView onItemDataExtracted={handleItemDataExtracted} />
      <FloatingActionButton
        onSaveFavorite={handleSaveFavorite}
        onTrackPrice={handleTrackPrice}
        onShare={handleShare}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});
