export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  defaultHomeTab: string;
  priceCheckFrequency: number;
  batteryOptimization: 'normal' | 'power-saving' | 'ultra';
  networkPreference: 'any' | 'wifi-only';
  notificationsEnabled: boolean;
  priceDropNotifications: boolean;
  priceIncreaseNotifications: boolean;
  alertNotifications: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
