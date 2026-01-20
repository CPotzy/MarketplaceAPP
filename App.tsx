import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { BottomTabNavigator } from './src/navigation';
import { Colors } from './src/theme';
import { DatabaseService } from './src/services';
import UpdateService from './src/services/UpdateService';

function App(): React.JSX.Element {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await DatabaseService.initialize();
      console.log('App initialized successfully');
      
      // Check for updates (silently, don't show "no update" message)
      setTimeout(() => {
        UpdateService.checkForUpdates(false);
      }, 2000); // Wait 2 seconds after app starts
      
      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      // Still allow the app to continue even if DB fails
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.light.background}
      />
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});

export default App;
