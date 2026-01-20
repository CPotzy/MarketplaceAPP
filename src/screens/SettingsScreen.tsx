import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../theme';
import UpdateService from '../services/UpdateService';

export const SettingsScreen: React.FC = () => {
  const handleCheckUpdates = async () => {
    await UpdateService.checkForUpdates(true); // Show "no update" message
  };

  const handleViewReleases = async () => {
    await UpdateService.openReleasesPage();
  };

  const handleAbout = () => {
    Alert.alert(
      'About FB Marketplace',
      `Version: ${UpdateService.getCurrentVersion()}\n\nA focused marketplace experience without distractions.\n\nFeatures:\n• Browse and search marketplace\n• Save favorite items\n• Save searches with alerts\n• Track messaged items\n• Stay focused, no feed/stories`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Updates</Text>
        
        <TouchableOpacity style={styles.option} onPress={handleCheckUpdates}>
          <View style={styles.optionContent}>
            <Text style={styles.optionIcon}>🔄</Text>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Check for Updates</Text>
              <Text style={styles.optionDescription}>
                Check if a new version is available
              </Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleViewReleases}>
          <View style={styles.optionContent}>
            <Text style={styles.optionIcon}>📦</Text>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>View All Releases</Text>
              <Text style={styles.optionDescription}>
                See release history on GitHub
              </Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.option} onPress={handleAbout}>
          <View style={styles.optionContent}>
            <Text style={styles.optionIcon}>ℹ️</Text>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>About This App</Text>
              <Text style={styles.optionDescription}>
                Version {UpdateService.getCurrentVersion()}
              </Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made for focused marketplace browsing
        </Text>
        <Text style={styles.footerTextSmall}>
          No distractions, just marketplace
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
  },
  arrow: {
    fontSize: 24,
    color: '#ccc',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footerTextSmall: {
    fontSize: 12,
    color: '#999',
  },
});
