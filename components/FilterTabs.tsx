import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BorderRadius, Colors, Spacing } from '../constants/theme';

interface FilterTabsProps<T extends string> {
  tabs: readonly T[] | T[];
  activeTab: T;
  onSelectTab: (tab: T) => void;
  allLabel?: string;
}

export function FilterTabs<T extends string>({
  tabs,
  activeTab,
  onSelectTab,
}: FilterTabsProps<T>) {
  const handleSelect = (tab: T) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // safe fallback
    }
    onSelectTab(tab);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.75}
              onPress={() => handleSelect(tab)}
              style={[
                styles.tab,
                isActive && styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: Colors.textLight,
  },
});
