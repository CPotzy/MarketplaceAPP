import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, ToastAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation, WebViewMessageEvent } from 'react-native-webview';
import { Colors } from '../theme';
import { SkeletonLoader } from './SkeletonLoader';
import DatabaseService from '../services/DatabaseService';

interface MarketplaceWebViewProps {
  onItemDataExtracted?: (data: any) => void;
}

const MARKETPLACE_URL = 'https://m.facebook.com/marketplace';

// Allowed URL patterns
const ALLOWED_PATTERNS = [
  '/marketplace',
  '/login',
  '/checkpoint',
  '/recover',
  '/reg',
];

// Blocked URL patterns (redirect back to marketplace)
const BLOCKED_PATTERNS = [
  '/stories',
  '/watch',
  '/groups',
  '/gaming',
  '/events',
  '/pages',
  '/fundraisers',
];

export const MarketplaceWebView: React.FC<MarketplaceWebViewProps> = ({
  onItemDataExtracted,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(MARKETPLACE_URL);

  // JavaScript code to inject into the WebView
  const injectedJavaScript = `
    (function() {
      // Hide Facebook navigation bar and other distracting elements
      function hideDistractions() {
        try {
          // Hide top navigation bar
          const topNav = document.querySelector('[role="banner"]');
          if (topNav) {
            topNav.style.display = 'none';
          }
          
          // Hide navigation tabs (Home, Watch, etc.)
          const navTabs = document.querySelectorAll('[role="navigation"], [role="tablist"]');
          navTabs.forEach(nav => {
            // Only hide if it contains non-marketplace links
            const text = nav.innerText || '';
            if (text.includes('Home') || text.includes('Watch') || text.includes('Groups')) {
              nav.style.display = 'none';
            }
          });
          
          // Hide bottom navigation bar on mobile
          const bottomNav = document.querySelector('[data-pagelet="MobileNavBar"]');
          if (bottomNav) {
            bottomNav.style.display = 'none';
          }
          
          // Add custom CSS to hide more elements
          const style = document.createElement('style');
          style.innerHTML = \`
            /* Hide Facebook app header */
            #header, [role="banner"] { display: none !important; }
            
            /* Hide bottom navigation */
            [data-pagelet="MobileNavBar"] { display: none !important; }
            
            /* Hide "Open in app" banner */
            [data-sigil="m-promo-jewel-header"] { display: none !important; }
            
            /* Hide stories */
            [data-sigil="m-story-tray"] { display: none !important; }
            
            /* Add padding to top since we removed header */
            body { padding-top: 0 !important; }
            #root { padding-top: 0 !important; }
          \`;
          document.head.appendChild(style);
        } catch (error) {
          console.error('Error hiding distractions:', error);
        }
      }
      
      // Function to extract item data from the page
      function extractItemData() {
        try {
          const url = window.location.href;
          
          // Check if we're on an item detail page
          if (!url.includes('/marketplace/item/')) {
            return null;
          }
          
          // Extract item ID from URL
          const itemIdMatch = url.match(/\\/marketplace\\/item\\/(\\d+)/);
          const itemId = itemIdMatch ? itemIdMatch[1] : null;
          
          // Try to extract item details from the page
          const data = {
            id: itemId,
            itemId: itemId,
            url: url,
            title: document.title || '',
            timestamp: Date.now(),
          };
          
          // Try to find price element (this may need adjustment based on FB's HTML structure)
          const priceElements = document.querySelectorAll('[data-testid*="price"], [aria-label*="$"], [aria-label*="price"]');
          if (priceElements.length > 0) {
            const priceText = priceElements[0].textContent || priceElements[0].getAttribute('aria-label') || '';
            data.priceText = priceText;
          }
          
          // Try to find title
          const titleElements = document.querySelectorAll('h1, [role="heading"]');
          if (titleElements.length > 0) {
            data.title = titleElements[0].textContent || '';
          }
          
          return data;
        } catch (error) {
          console.error('Error extracting data:', error);
          return null;
        }
      }
      
      // Detect when user clicks "Message" or "Send message" button
      function detectMessageButton() {
        document.addEventListener('click', function(e) {
          const target = e.target;
          const text = target.textContent || target.innerText || '';
          
          // Check if this is a message button
          if (text.toLowerCase().includes('message') || 
              text.toLowerCase().includes('send') ||
              target.getAttribute('aria-label')?.toLowerCase().includes('message')) {
            
            // Extract current item data
            const itemData = extractItemData();
            if (itemData) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MESSAGE_BUTTON_CLICKED',
                data: itemData
              }));
            }
          }
        }, true);
      }
      
      // Send data back to React Native
      function sendDataToApp() {
        const data = extractItemData();
        if (data) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ITEM_DATA',
            data: data
          }));
        }
      }
      
      // Initialize - hide distractions immediately
      hideDistractions();
      detectMessageButton();
      
      // Extract data on page load
      if (document.readyState === 'complete') {
        sendDataToApp();
      } else {
        window.addEventListener('load', function() {
          sendDataToApp();
          hideDistractions(); // Hide again after load
        });
      }
      
      // Also listen for URL changes (for SPAs)
      let lastUrl = location.href;
      new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          setTimeout(function() {
            sendDataToApp();
            hideDistractions(); // Hide distractions on page change
          }, 500);
        }
      }).observe(document, { subtree: true, childList: true });
      
      // Re-hide distractions periodically in case Facebook re-adds them
      setInterval(hideDistractions, 2000);
      
      true; // Required for Android
    })();
  `;

  // This handler prevents opening external browser
  const handleShouldStartLoad = (request: any) => {
    const { url } = request;
    console.log('Should start load:', url);

    // Always allow facebook.com, fbcdn.net, and related domains
    if (url.includes('facebook.com') || 
        url.includes('fbcdn.net') || 
        url.includes('fbsbx.com') ||
        url.includes('fb.com') ||
        url.startsWith('about:') ||
        url.startsWith('data:')) {
      
      // Check if URL should be blocked (non-marketplace FB features)
      const shouldBlock = BLOCKED_PATTERNS.some(pattern => url.includes(pattern));
      
      if (shouldBlock) {
        console.log('Blocking non-marketplace URL:', url);
        // Redirect back to marketplace
        setTimeout(() => {
          webViewRef.current?.injectJavaScript(`
            window.location.href = '${MARKETPLACE_URL}';
            true;
          `);
        }, 100);
        return false;
      }
      
      // Allow all marketplace URLs within the WebView
      return true;
    }

    // Block all external domains (would open in browser otherwise)
    console.log('Blocking external URL:', url);
    return false;
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url, loading: navLoading } = navState;
    console.log('Navigation state:', { url, loading: navLoading });
    setCurrentUrl(url);

    // Check if URL should be blocked
    const shouldBlock = BLOCKED_PATTERNS.some(pattern => url.includes(pattern));
    
    if (shouldBlock) {
      console.log('Blocking URL in nav state:', url);
      // Redirect back to marketplace
      webViewRef.current?.stopLoading();
      webViewRef.current?.injectJavaScript(`
        window.location.href = '${MARKETPLACE_URL}';
        true;
      `);
      return false;
    }

    // Check if it's a messenger URL
    if (url.includes('messenger.com') || url.includes('/messages')) {
      console.log('Messenger URL detected:', url);
      // We'll handle this later by opening the Messenger app
      Alert.alert(
        'Open in Messenger',
        'This will open the Messenger app',
        [
          { text: 'Cancel', onPress: () => {
            webViewRef.current?.goBack();
          }},
          { text: 'Open', onPress: () => {
            // TODO: Open Messenger app
            webViewRef.current?.goBack();
          }},
        ]
      );
      return false;
    }
  };

  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'ITEM_DATA' && message.data) {
        console.log('Item data extracted:', message.data);
        onItemDataExtracted?.(message.data);
      }
      
      if (message.type === 'MESSAGE_BUTTON_CLICKED' && message.data) {
        console.log('Message button clicked, auto-saving item:', message.data);
        
        // Auto-save item to messaged_items table
        try {
          await DatabaseService.addMessagedItem({
            itemId: message.data.itemId,
            title: message.data.title,
            itemUrl: message.data.url,
          });
          
          ToastAndroid.show('Item saved to Messages tab', ToastAndroid.SHORT);
        } catch (error) {
          console.error('Error saving messaged item:', error);
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    Alert.alert(
      'Connection Error',
      'Unable to load Facebook Marketplace. Please check your internet connection.',
      [
        { text: 'Retry', onPress: () => {
          webViewRef.current?.reload();
        }},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: MARKETPLACE_URL }}
        style={styles.webview}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onLoadStart={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('Load started:', nativeEvent.url);
          setLoading(true);
        }}
        onLoadEnd={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('Load ended:', nativeEvent.url);
          setLoading(false);
          
          // Re-inject JavaScript to hide elements after page loads
          webViewRef.current?.injectJavaScript(injectedJavaScript);
        }}
        onLoadProgress={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('Load progress:', nativeEvent.progress);
          
          // Hide loading overlay when 80% loaded
          if (nativeEvent.progress > 0.8) {
            setLoading(false);
          }
        }}
        onError={handleError}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('HTTP error:', nativeEvent);
        }}
        injectedJavaScriptBeforeContentLoaded={`
          // Inject early to hide elements before they render
          window.addEventListener('DOMContentLoaded', function() {
            const style = document.createElement('style');
            style.innerHTML = \`
              [role="banner"], #header { display: none !important; }
              [data-pagelet="MobileNavBar"] { display: none !important; }
            \`;
            document.head.appendChild(style);
          });
          true;
        `}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        userAgent="Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36"
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        allowsBackForwardNavigationGestures={true}
        startInLoadingState={false}
        mixedContentMode="always"
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        setSupportMultipleWindows={false}
        setBuiltInZoomControls={false}
        scalesPageToFit={true}
        androidLayerType="hardware"
        overScrollMode="never"
        nestedScrollEnabled={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        )}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <SkeletonLoader />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
