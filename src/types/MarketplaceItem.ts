export interface MarketplaceItem {
  id: string;
  itemId: string;
  title: string;
  price: number;
  currency: string;
  sellerName: string;
  sellerId: string;
  imageUrl: string;
  itemUrl: string;
  location: string;
  condition: string;
  category: string;
  description?: string;
  datePosted?: number;
}

export interface FavoriteItem extends MarketplaceItem {
  folder: string;
  tags: string[];
  dateSaved: number;
  lastChecked: number;
  isAvailable: boolean;
}

export interface TrackedItem extends MarketplaceItem {
  originalPrice: number;
  currentPrice: number;
  alertPrice?: number;
  dateAdded: number;
  lastChecked: number;
  checkFrequency: number; // hours
  isActive: boolean;
}

export interface PriceHistory {
  id: string;
  itemId: string;
  price: number;
  timestamp: number;
}

export interface SearchAlert {
  id: string;
  name: string;
  keywords: string;
  location: string;
  radius: number;
  minPrice?: number;
  maxPrice?: number;
  condition: string[];
  category: string;
  frequency: 'realtime' | 'hourly' | 'daily';
  isActive: boolean;
  lastRun: number;
  dateCreated: number;
  notificationEnabled: boolean;
}

export interface AlertResult {
  id: string;
  alertId: string;
  itemId: string;
  title: string;
  price: number;
  imageUrl: string;
  itemUrl: string;
  foundAt: number;
  isRead: boolean;
}
