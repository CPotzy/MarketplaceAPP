import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    try {
      const settingsStr = await AsyncStorage.getItem('@settings');
      if (settingsStr) {
        return JSON.parse(settingsStr);
      }
      return this.getDefaultSettings();
    } catch (error) {
      console.error('Error getting settings:', error);
      return this.getDefaultSettings();
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem('@settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: 'auto',
      defaultHomeTab: 'Home',
      priceCheckFrequency: 2,
      batteryOptimization: 'normal',
      networkPreference: 'any',
      notificationsEnabled: true,
      priceDropNotifications: true,
      priceIncreaseNotifications: false,
      alertNotifications: true,
    };
  }

  // Generic key-value storage
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export default StorageService.getInstance();
