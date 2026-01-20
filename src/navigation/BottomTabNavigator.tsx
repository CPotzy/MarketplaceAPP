import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import {
  HomeScreen,
  SearchScreen,
  FavoritesScreen,
  MessagesScreen,
} from '../screens';
import { SavedSearchesScreen } from '../screens/SavedSearchesScreen';
import { BottomTabParamList } from '../types';
import { Colors } from '../theme';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// Simple icon component (we'll enhance later)
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const iconMap: Record<string, string> = {
    Home: '🏠',
    Search: '🔍',
    Favorites: '⭐',
    Track: '📊',
    Messages: '💬',
  };
  
  return (
    <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
      {iconMap[name] || ''}
    </Text>
  );
};

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopColor: Colors.light.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Search" focused={focused} />,
          tabBarLabel: 'Search',
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Favorites" focused={focused} />,
          tabBarLabel: 'Favorites',
        }}
      />
      <Tab.Screen
        name="Track"
        component={SavedSearchesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Track" focused={focused} />,
          tabBarLabel: 'Alerts',
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Messages" focused={focused} />,
          tabBarLabel: 'Messages',
        }}
      />
    </Tab.Navigator>
  );
};
