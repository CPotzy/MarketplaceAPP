import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Text } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';

interface FABProps {
  onSaveFavorite: () => void;
  onTrackPrice: () => void;
  onShare: () => void;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  onSaveFavorite,
  onTrackPrice,
  onShare,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      {isOpen && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={[styles.menuItem, styles.saveButton]}
            onPress={() => {
              setIsOpen(false);
              onSaveFavorite();
            }}
          >
            <Text style={styles.menuIcon}>⭐</Text>
            <Text style={styles.menuText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.trackButton]}
            onPress={() => {
              setIsOpen(false);
              onTrackPrice();
            }}
          >
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={styles.menuText}>Track</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.shareButton]}
            onPress={() => {
              setIsOpen(false);
              onShare();
            }}
          >
            <Text style={styles.menuIcon}>📤</Text>
            <Text style={styles.menuText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, isOpen && styles.fabOpen]}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>{isOpen ? '✕' : '+'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.md,
    alignItems: 'flex-end',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  fabOpen: {
    backgroundColor: Colors.light.error,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600' as '600',
  },
  menu: {
    marginBottom: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.xs,
    ...Shadows.md,
  },
  saveButton: {
    backgroundColor: '#FFF9E6',
  },
  trackButton: {
    backgroundColor: '#E6F7FF',
  },
  shareButton: {
    backgroundColor: '#F0F0F0',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600' as '600',
    color: Colors.light.text,
  },
});
