import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { FavoriteItem, TrackedItem, PriceHistory, SearchAlert, AlertResult } from '../types';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

class DatabaseService {
  private db: SQLiteDatabase | null = null;
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: 'marketplace.db',
        location: 'default',
      });

      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      // Favorites table (saved items for later viewing)
      `CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        item_id TEXT UNIQUE,
        title TEXT,
        price REAL,
        currency TEXT,
        seller_name TEXT,
        seller_id TEXT,
        image_url TEXT,
        item_url TEXT,
        location TEXT,
        condition TEXT,
        category TEXT,
        folder TEXT DEFAULT 'All',
        tags TEXT,
        date_saved INTEGER,
        last_checked INTEGER,
        is_available INTEGER DEFAULT 1
      )`,

      // Messaged items table (items you've contacted sellers about)
      `CREATE TABLE IF NOT EXISTS messaged_items (
        id TEXT PRIMARY KEY,
        item_id TEXT UNIQUE,
        title TEXT,
        price REAL,
        currency TEXT,
        seller_name TEXT,
        seller_id TEXT,
        image_url TEXT,
        item_url TEXT,
        location TEXT,
        date_messaged INTEGER,
        last_message_sent INTEGER,
        conversation_url TEXT,
        notes TEXT
      )`,

      // Tracked items table (legacy - keeping for now)
      `CREATE TABLE IF NOT EXISTS tracked_items (
        id TEXT PRIMARY KEY,
        item_id TEXT UNIQUE,
        title TEXT,
        original_price REAL,
        current_price REAL,
        alert_price REAL,
        currency TEXT,
        seller_name TEXT,
        image_url TEXT,
        item_url TEXT,
        date_added INTEGER,
        last_checked INTEGER,
        check_frequency INTEGER DEFAULT 2,
        is_active INTEGER DEFAULT 1
      )`,

      // Price history table
      `CREATE TABLE IF NOT EXISTS price_history (
        id TEXT PRIMARY KEY,
        item_id TEXT,
        price REAL,
        timestamp INTEGER,
        FOREIGN KEY (item_id) REFERENCES tracked_items(item_id)
      )`,

      // Search alerts table (saved searches with notifications)
      `CREATE TABLE IF NOT EXISTS search_alerts (
        id TEXT PRIMARY KEY,
        name TEXT,
        keywords TEXT,
        location TEXT,
        radius INTEGER,
        min_price REAL,
        max_price REAL,
        condition TEXT,
        category TEXT,
        frequency TEXT,
        is_active INTEGER DEFAULT 1,
        last_run INTEGER,
        date_created INTEGER,
        notification_enabled INTEGER DEFAULT 1,
        new_results_count INTEGER DEFAULT 0
      )`,

      // Alert results table
      `CREATE TABLE IF NOT EXISTS alert_results (
        id TEXT PRIMARY KEY,
        alert_id TEXT,
        item_id TEXT,
        title TEXT,
        price REAL,
        image_url TEXT,
        item_url TEXT,
        found_at INTEGER,
        is_read INTEGER DEFAULT 0,
        FOREIGN KEY (alert_id) REFERENCES search_alerts(id)
      )`,

      // Settings table
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )`,
    ];

    for (const tableSQL of tables) {
      await this.db.executeSql(tableSQL);
    }
  }

  // Favorites methods
  async addFavorite(item: Omit<FavoriteItem, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sql = `INSERT INTO favorites (
      id, item_id, title, price, currency, seller_name, seller_id, 
      image_url, item_url, location, condition, category, folder, 
      tags, date_saved, last_checked, is_available
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await this.db.executeSql(sql, [
      id,
      item.itemId,
      item.title,
      item.price,
      item.currency,
      item.sellerName,
      item.sellerId,
      item.imageUrl,
      item.itemUrl,
      item.location,
      item.condition,
      item.category,
      item.folder,
      JSON.stringify(item.tags),
      item.dateSaved,
      item.lastChecked,
      item.isAvailable ? 1 : 0,
    ]);

    return id;
  }

  async getFavorites(folder?: string): Promise<FavoriteItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const sql = folder
      ? 'SELECT * FROM favorites WHERE folder = ? ORDER BY date_saved DESC'
      : 'SELECT * FROM favorites ORDER BY date_saved DESC';

    const params = folder ? [folder] : [];
    const [results] = await this.db.executeSql(sql, params);

    const favorites: FavoriteItem[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      favorites.push({
        id: row.id,
        itemId: row.item_id,
        title: row.title,
        price: row.price,
        currency: row.currency,
        sellerName: row.seller_name,
        sellerId: row.seller_id,
        imageUrl: row.image_url,
        itemUrl: row.item_url,
        location: row.location,
        condition: row.condition,
        category: row.category,
        folder: row.folder,
        tags: JSON.parse(row.tags || '[]'),
        dateSaved: row.date_saved,
        lastChecked: row.last_checked,
        isAvailable: row.is_available === 1,
      });
    }

    return favorites;
  }

  async removeFavorite(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql('DELETE FROM favorites WHERE id = ?', [id]);
  }

  async isFavorite(itemId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    const [results] = await this.db.executeSql(
      'SELECT COUNT(*) as count FROM favorites WHERE item_id = ?',
      [itemId]
    );
    return results.rows.item(0).count > 0;
  }

  // Tracked items methods
  async addTrackedItem(item: Omit<TrackedItem, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sql = `INSERT INTO tracked_items (
      id, item_id, title, original_price, current_price, alert_price,
      currency, seller_name, image_url, item_url, date_added, last_checked,
      check_frequency, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await this.db.executeSql(sql, [
      id,
      item.itemId,
      item.title,
      item.originalPrice,
      item.currentPrice,
      item.alertPrice || null,
      item.currency,
      item.sellerName,
      item.imageUrl,
      item.itemUrl,
      item.dateAdded,
      item.lastChecked,
      item.checkFrequency,
      item.isActive ? 1 : 0,
    ]);

    // Add initial price history entry
    await this.addPriceHistory(item.itemId, item.currentPrice);

    return id;
  }

  async getTrackedItems(): Promise<TrackedItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(
      'SELECT * FROM tracked_items WHERE is_active = 1 ORDER BY date_added DESC'
    );

    const items: TrackedItem[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      items.push({
        id: row.id,
        itemId: row.item_id,
        title: row.title,
        price: row.current_price,
        currency: row.currency,
        sellerName: row.seller_name,
        sellerId: '',
        imageUrl: row.image_url,
        itemUrl: row.item_url,
        location: '',
        condition: '',
        category: '',
        originalPrice: row.original_price,
        currentPrice: row.current_price,
        alertPrice: row.alert_price,
        dateAdded: row.date_added,
        lastChecked: row.last_checked,
        checkFrequency: row.check_frequency,
        isActive: row.is_active === 1,
      });
    }

    return items;
  }

  async updateTrackedItemPrice(itemId: string, newPrice: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(
      'UPDATE tracked_items SET current_price = ?, last_checked = ? WHERE item_id = ?',
      [newPrice, Date.now(), itemId]
    );

    await this.addPriceHistory(itemId, newPrice);
  }

  async removeTrackedItem(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql('DELETE FROM tracked_items WHERE id = ?', [id]);
  }

  async isTracking(itemId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    const [results] = await this.db.executeSql(
      'SELECT COUNT(*) as count FROM tracked_items WHERE item_id = ? AND is_active = 1',
      [itemId]
    );
    return results.rows.item(0).count > 0;
  }

  // Price history methods
  async addPriceHistory(itemId: string, price: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.db.executeSql(
      'INSERT INTO price_history (id, item_id, price, timestamp) VALUES (?, ?, ?, ?)',
      [id, itemId, price, Date.now()]
    );
  }

  async getPriceHistory(itemId: string): Promise<PriceHistory[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(
      'SELECT * FROM price_history WHERE item_id = ? ORDER BY timestamp ASC',
      [itemId]
    );

    const history: PriceHistory[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      history.push({
        id: row.id,
        itemId: row.item_id,
        price: row.price,
        timestamp: row.timestamp,
      });
    }

    return history;
  }

  // Search alerts methods
  async addSearchAlert(alert: Omit<SearchAlert, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sql = `INSERT INTO search_alerts (
      id, name, keywords, location, radius, min_price, max_price,
      condition, category, frequency, is_active, last_run, date_created,
      notification_enabled
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await this.db.executeSql(sql, [
      id,
      alert.name,
      alert.keywords,
      alert.location,
      alert.radius,
      alert.minPrice || null,
      alert.maxPrice || null,
      JSON.stringify(alert.condition),
      alert.category,
      alert.frequency,
      alert.isActive ? 1 : 0,
      alert.lastRun,
      alert.dateCreated,
      alert.notificationEnabled ? 1 : 0,
    ]);

    return id;
  }

  async getSearchAlerts(): Promise<SearchAlert[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(
      'SELECT * FROM search_alerts ORDER BY date_created DESC'
    );

    const alerts: SearchAlert[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      alerts.push({
        id: row.id,
        name: row.name,
        keywords: row.keywords,
        location: row.location,
        radius: row.radius,
        minPrice: row.min_price,
        maxPrice: row.max_price,
        condition: JSON.parse(row.condition || '[]'),
        category: row.category,
        frequency: row.frequency,
        isActive: row.is_active === 1,
        lastRun: row.last_run,
        dateCreated: row.date_created,
        notificationEnabled: row.notification_enabled === 1,
      });
    }

    return alerts;
  }

  async removeSearchAlert(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql('DELETE FROM search_alerts WHERE id = ?', [id]);
    await this.db.executeSql('DELETE FROM alert_results WHERE alert_id = ?', [id]);
  }

  async toggleAlert(id: string, isActive: boolean): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql(
      'UPDATE search_alerts SET is_active = ? WHERE id = ?',
      [isActive ? 1 : 0, id]
    );
  }

  async updateAlertResultsCount(alertId: string, count: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql(
      'UPDATE search_alerts SET new_results_count = ? WHERE id = ?',
      [count, alertId]
    );
  }

  // Messaged items methods
  async addMessagedItem(item: {
    itemId: string;
    title: string;
    price?: number;
    currency?: string;
    sellerName?: string;
    sellerId?: string;
    imageUrl?: string;
    itemUrl: string;
    conversationUrl?: string;
    location?: string;
  }): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sql = `INSERT OR REPLACE INTO messaged_items (
      id, item_id, title, price, currency, seller_name, seller_id,
      image_url, item_url, location, date_messaged, last_message_sent,
      conversation_url, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await this.db.executeSql(sql, [
      id,
      item.itemId,
      item.title,
      item.price || null,
      item.currency || 'USD',
      item.sellerName || '',
      item.sellerId || '',
      item.imageUrl || '',
      item.itemUrl,
      item.location || '',
      Date.now(),
      Date.now(),
      item.conversationUrl || '',
      '',
    ]);

    return id;
  }

  async getMessagedItems(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(
      'SELECT * FROM messaged_items ORDER BY last_message_sent DESC'
    );

    const items: any[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      items.push({
        id: row.id,
        itemId: row.item_id,
        title: row.title,
        price: row.price,
        currency: row.currency,
        sellerName: row.seller_name,
        sellerId: row.seller_id,
        imageUrl: row.image_url,
        itemUrl: row.item_url,
        location: row.location,
        dateMessaged: row.date_messaged,
        lastMessageSent: row.last_message_sent,
        conversationUrl: row.conversation_url,
        notes: row.notes,
      });
    }

    return items;
  }

  async updateMessagedItem(itemId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql(
      'UPDATE messaged_items SET last_message_sent = ? WHERE item_id = ?',
      [Date.now(), itemId]
    );
  }

  async isMessaged(itemId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    const [results] = await this.db.executeSql(
      'SELECT COUNT(*) as count FROM messaged_items WHERE item_id = ?',
      [itemId]
    );
    return results.rows.item(0).count > 0;
  }

  // Clean up old data
  async cleanup(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

    // Remove old price history
    await this.db.executeSql(
      'DELETE FROM price_history WHERE timestamp < ?',
      [thirtyDaysAgo]
    );

    // Remove read alert results older than 14 days
    await this.db.executeSql(
      'DELETE FROM alert_results WHERE is_read = 1 AND found_at < ?',
      [fourteenDaysAgo]
    );
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export default DatabaseService.getInstance();
