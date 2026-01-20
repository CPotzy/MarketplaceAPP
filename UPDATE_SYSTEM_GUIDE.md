# GitHub Releases Update System - Setup Guide

## Overview
Your app now has an automatic update system that checks GitHub Releases for new versions and allows users to download and install updates directly from within the app.

## How It Works

1. **Automatic Check**: App checks for updates 2 seconds after startup
2. **User Prompt**: If update found, shows dialog with version info and release notes
3. **Download**: User taps "Update" → APK downloads to Downloads folder with progress
4. **Install**: App attempts to open APK installer automatically

## Setup Steps

### 1. Create a GitHub Repository

1. Go to https://github.com and create a new repository
2. Name it something like `marketplace-app` or `facebook-marketplace-android`
3. Make it **Public** (required for GitHub API access)
4. Don't add any files yet

### 2. Update the App Configuration

Edit this file: `src/services/UpdateService.ts`

```typescript
// Line 4-6: UPDATE THESE VALUES
const GITHUB_OWNER = 'YOUR_USERNAME';  // Your GitHub username
const GITHUB_REPO = 'marketplace-app';  // Your repo name from step 1
const CURRENT_VERSION = '1.0.0';       // Current app version
```

**Example:**
```typescript
const GITHUB_OWNER = 'johnsmith';
const GITHUB_REPO = 'marketplace-app';
const CURRENT_VERSION = '1.0.0';
```

### 3. Build Your First Release (v1.0.0)

```bash
# Navigate to project
cd "/Users/calebpotter/Facebook marketplace/Facebook Marketplace Android/MarketplaceApp"

# Bundle JavaScript
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

# Build APK
cd android
./gradlew clean assembleDebug
cd ..
```

APK will be at: `android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk`

### 4. Create Your First GitHub Release

1. Go to your repo: `https://github.com/YOUR_USERNAME/YOUR_REPO`
2. Click "Releases" (right sidebar)
3. Click "Create a new release"
4. Fill in:
   - **Tag**: `v1.0.0` (must start with 'v')
   - **Release title**: `Version 1.0.0`
   - **Description**: Write release notes (e.g., "Initial release with marketplace browsing")
5. **Upload APK**: Drag and drop `app-arm64-v8a-debug.apk` to the upload area
6. Click "Publish release"

### 5. Releasing Updates (v1.0.1, v1.0.2, etc.)

When you want to release an update:

#### Step 1: Update Version Number
Edit `src/services/UpdateService.ts`:
```typescript
const CURRENT_VERSION = '1.0.1';  // Increment this
```

#### Step 2: Make Your Code Changes
- Fix bugs, add features, etc.

#### Step 3: Build New APK
```bash
# Bundle JS
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

# Build APK
cd android && ./gradlew clean assembleDebug && cd ..
```

#### Step 4: Create GitHub Release
1. Go to Releases → "Create a new release"
2. **Tag**: `v1.0.1` (increment version)
3. **Title**: `Version 1.0.1`
4. **Description**: Write what's new/fixed:
   ```
   ## What's New
   - Added skeleton loading animation
   - Fixed links opening in external browser
   - Auto-save messaged items
   - New saved searches feature
   
   ## Bug Fixes
   - Fixed WebView loading issues
   ```
5. Upload the new APK
6. Publish release

### 6. How Users Get Updates

**Automatic:**
- Users open the app
- After 2 seconds, app checks GitHub for updates
- If new version exists, shows dialog:
  ```
  Update Available
  Version v1.0.1 is available (47.2 MB)
  
  ## What's New
  - Added skeleton loading animation
  - Fixed links opening in external browser
  
  Would you like to download and install it?
  
  [Later]  [Update]
  ```
- User taps "Update" → downloads → installs

**Manual:**
- You can also add a Settings screen (already created!)
- Users can manually check for updates anytime

### 7. Testing the Update System

1. **Build and install v1.0.0** on your phone
2. **Create v1.0.1 release** on GitHub with new APK
3. **Open app** → should see update dialog after 2 seconds
4. **Tap Update** → should download and prompt to install

## Version Numbering

Use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.x.x): Breaking changes, major redesigns
- **MINOR** (x.1.x): New features, big improvements
- **PATCH** (x.x.1): Bug fixes, small tweaks

Examples:
- `1.0.0` → Initial release
- `1.0.1` → Bug fixes
- `1.1.0` → Added new saved searches feature
- `2.0.0` → Complete UI redesign

## Important Notes

### APK Naming
- Always upload the **arm64-v8a** APK (for Galaxy S25 Ultra)
- Or upload the **universal** APK (works on all devices but larger)
- Name format: `app-arm64-v8a-debug.apk` or `app-universal-debug.apk`

### Release Tags
- **Must** start with 'v' (e.g., `v1.0.1`, not `1.0.1`)
- Use exact version numbers (no extras like `v1.0.1-beta`)

### Repository Visibility
- **Must be Public** for API access without authentication
- If you want private repo, you'll need to add GitHub token authentication

### Update Frequency
- App checks for updates every time it starts
- Won't annoy users - only shows dialog if update exists
- Users can dismiss and update later

## Troubleshooting

### "Failed to check for updates"
- Check internet connection
- Verify GitHub repo is public
- Verify GITHUB_OWNER and GITHUB_REPO are correct

### "No compatible APK found"
- Make sure you uploaded an APK file (not a zip)
- APK name should contain "arm64" or "universal"
- APK extension must be `.apk`

### Update downloads but won't install
- User needs to enable "Install from Unknown Sources" in Android settings
- This is normal for apps not from Play Store
- App will show instructions if automatic install fails

### Version not detected as newer
- Check version format in UpdateService.ts
- Current version: `1.0.0`
- New version must be higher: `1.0.1`, `1.1.0`, or `2.0.0`
- Remove any 'v' prefix from CURRENT_VERSION (it's added automatically for tags)

## Example Workflow

```bash
# Day 1: Initial release
vim src/services/UpdateService.ts  # Set version to 1.0.0, add GitHub details
# Build APK, create v1.0.0 release on GitHub
# Share APK with friends

# Day 7: Fix some bugs
vim src/services/UpdateService.ts  # Change to 1.0.1
# Fix bugs in code
# Build new APK, create v1.0.1 release
# Friends open app → see update notification → update automatically

# Day 30: Add new feature
vim src/services/UpdateService.ts  # Change to 1.1.0
# Add new features
# Build APK, create v1.1.0 release
# Friends get new features automatically
```

## Next Steps

1. ✅ Create GitHub repo
2. ✅ Update GITHUB_OWNER and GITHUB_REPO in UpdateService.ts
3. ✅ Build APK with current changes
4. ✅ Create v1.0.0 release on GitHub
5. ✅ Install on your phone
6. ✅ Test by creating v1.0.1 release
7. ✅ Share with friends!

## File Locations

- **Update service**: `src/services/UpdateService.ts`
- **Settings screen**: `src/screens/SettingsScreen.tsx`
- **App initialization**: `App.tsx` (line 20)
- **APK output**: `android/app/build/outputs/apk/debug/`

## Support

If you have issues:
1. Check console logs: `adb logcat | grep -i update`
2. Verify GitHub repo is accessible
3. Test update URL manually: `https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/releases/latest`
