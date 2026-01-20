# FB Marketplace App - Android

A custom Android app for browsing Facebook Marketplace with advanced features like favorites, price tracking, and search functionality.

## ✅ Features Implemented

### Core Functionality
- ✅ **Marketplace WebView** - Browse Facebook Marketplace with full functionality
- ✅ **URL Filtering** - Blocks non-Marketplace Facebook content (Stories, Feed, etc.)
- ✅ **Messenger Integration** - Opens Messenger app for conversations
- ✅ **Bottom Tab Navigation** - 5 tabs: Home, Search, Favorites, Track, Messages

### Advanced Features
- ✅ **Favorites Management**
  - Save unlimited items
  - Organize in folders
  - View/remove saved items
  - Track availability status
  
- ✅ **Price Tracking**
  - Track up to 100 items
  - Price history tracking
  - Price change notifications (up/down indicators)
  - Set price alerts
  
- ✅ **Search** 
  - Quick search interface
  - Price range filtering
  - Location search
  - Quick search categories

- ✅ **Floating Action Button (FAB)**
  - Save current item to favorites
  - Add to price tracking
  - Share items

### Technical Implementation
- ✅ SQLite database for local storage
- ✅ AsyncStorage for app settings
- ✅ TypeScript throughout
- ✅ Galaxy S25 Ultra optimizations
- ✅ Material Design UI

## 🚀 Building the APK

### Prerequisites
- Node.js 18+
- Android SDK
- JDK 11+

### Run in Development Mode

```bash
# Start Metro bundler
npx react-native start

# In another terminal, run on device/emulator
npx react-native run-android
```

### Build APK

```bash
cd android
./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Install on Device

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 Usage

1. **Browse Marketplace**: App opens directly to Facebook Marketplace
2. **Save Favorites**: Tap + button → ⭐ Save
3. **Track Prices**: Tap + button → 📊 Track  
4. **Message Sellers**: Tap message → Opens Messenger app

## ⚙️ Configuration

Project location: `/Users/calebpotter/Facebook marketplace/Facebook Marketplace Android/MarketplaceApp`

## 🐛 Troubleshooting

If build fails:
```bash
cd android
./gradlew clean
npx react-native start --reset-cache
```

## ⚖️ Legal Notice

Unofficial app not affiliated with Facebook/Meta. For personal use only.

---

Built for Galaxy S25 Ultra
