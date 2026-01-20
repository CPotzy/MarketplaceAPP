import { Alert, Linking, Platform, ToastAndroid } from 'react-native';
import RNFS from 'react-native-fs';

// GitHub repository details
const GITHUB_OWNER = 'CPotzy'; // Your GitHub username
const GITHUB_REPO = 'MarketplaceAPP'; // Your repository name
const CURRENT_VERSION = '1.0.1'; // Update this with each release

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

export class UpdateService {
  private static instance: UpdateService;

  private constructor() {}

  public static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  /**
   * Check if a new version is available on GitHub Releases
   */
  async checkForUpdates(showNoUpdateMessage = false): Promise<void> {
    try {
      const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check for updates');
      }

      const release: GitHubRelease = await response.json();
      const latestVersion = release.tag_name.replace('v', '');
      const currentVersion = CURRENT_VERSION;

      console.log('Current version:', currentVersion);
      console.log('Latest version:', latestVersion);

      if (this.isNewerVersion(latestVersion, currentVersion)) {
        // Find the APK asset for the current architecture
        const apkAsset = release.assets.find(
          asset => asset.name.endsWith('.apk') && 
          (asset.name.includes('universal') || asset.name.includes('arm64'))
        );

        if (apkAsset) {
          this.showUpdateDialog(release, apkAsset);
        } else {
          console.log('No compatible APK found in release');
        }
      } else if (showNoUpdateMessage) {
        ToastAndroid.show('You are on the latest version', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      if (showNoUpdateMessage) {
        Alert.alert('Update Check Failed', 'Could not check for updates. Please try again later.');
      }
    }
  }

  /**
   * Compare version strings (e.g., "1.0.1" vs "1.0.0")
   */
  private isNewerVersion(latest: string, current: string): boolean {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const latestPart = latestParts[i] || 0;
      const currentPart = currentParts[i] || 0;

      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }

    return false;
  }

  /**
   * Show update available dialog
   */
  private showUpdateDialog(release: GitHubRelease, apkAsset: any): void {
    const versionName = release.tag_name;
    const releaseNotes = release.body || 'Bug fixes and improvements';
    const apkSize = (apkAsset.size / (1024 * 1024)).toFixed(1); // Convert to MB

    Alert.alert(
      'Update Available',
      `Version ${versionName} is available (${apkSize} MB)\n\n${releaseNotes}\n\nWould you like to download and install it?`,
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Update', onPress: () => this.downloadAndInstall(apkAsset) },
      ],
      { cancelable: true }
    );
  }

  /**
   * Download APK and install
   */
  private async downloadAndInstall(apkAsset: any): Promise<void> {
    try {
      const downloadUrl = apkAsset.browser_download_url;
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${apkAsset.name}`;

      ToastAndroid.show('Downloading update...', ToastAndroid.LONG);

      // Download the APK
      const downloadResult = await RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: downloadDest,
        background: true,
        discretionary: true,
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log('Download progress:', progress.toFixed(0) + '%');
          
          // Show progress every 25%
          if (progress % 25 < 1) {
            ToastAndroid.show(`Downloading: ${progress.toFixed(0)}%`, ToastAndroid.SHORT);
          }
        },
      }).promise;

      if (downloadResult.statusCode === 200) {
        ToastAndroid.show('Download complete! Opening installer...', ToastAndroid.SHORT);
        
        // Install the APK
        await this.installAPK(downloadDest, apkAsset.name);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading update:', error);
      Alert.alert(
        'Download Failed',
        'Could not download the update. Please try again later or download manually from GitHub.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open GitHub', 
            onPress: () => Linking.openURL(`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`)
          },
        ]
      );
    }
  }

  /**
   * Install APK (Android only)
   */
  private async installAPK(filePath: string, fileName: string): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      // Try different methods to install
      const fileUri = `file://${filePath}`;
      
      // Method 1: Try direct file URI (works on older Android)
      try {
        const canOpen = await Linking.canOpenURL(fileUri);
        if (canOpen) {
          await Linking.openURL(fileUri);
          return;
        }
      } catch (e) {
        console.log('Method 1 failed, trying content URI...');
      }

      // Method 2: Use content:// URI (for Android 10+)
      try {
        const contentUri = `content://com.marketplaceapp.fileprovider/${filePath}`;
        await Linking.openURL(contentUri);
        return;
      } catch (e) {
        console.log('Method 2 failed, showing manual instructions...');
      }

      // Fallback: Show manual installation instructions
      Alert.alert(
        'Installation Ready',
        `The update has been downloaded to your Downloads folder.\n\nTo install:\n1. Open your Downloads folder\n2. Tap on "${fileName}"\n3. Follow the installation prompts`,
        [
          { text: 'OK' },
          {
            text: 'Open Downloads',
            onPress: () => {
              // Try to open Downloads folder
              Linking.openURL('content://com.android.externalstorage.documents/document/primary:Download');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error installing APK:', error);
      Alert.alert(
        'Installation',
        `Please open your Downloads folder and tap "${fileName}" to install the update.`,
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Open GitHub releases page in browser
   */
  async openReleasesPage(): Promise<void> {
    const url = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening releases page:', error);
    }
  }

  /**
   * Get current app version
   */
  getCurrentVersion(): string {
    return CURRENT_VERSION;
  }
}

export default UpdateService.getInstance();
