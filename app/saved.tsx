import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrandHeader } from '../components/BrandHeader';
import { EmptyState } from '../components/EmptyState';
import { FilterTabs } from '../components/FilterTabs';
import { OutfitCard } from '../components/OutfitCard';
import { Colors, Spacing } from '../constants/theme';
import { getSavedOutfits, removeSavedOutfit } from '../services/storage';
import { OutfitSuggestion } from '../types';

export default function SavedOutfitsScreen() {
  const router = useRouter();
  const [savedOutfits, setSavedOutfits] = useState<OutfitSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    try {
      const data = await getSavedOutfits();
      setSavedOutfits(data);
    } catch (e) {
      console.warn('Failed to load saved outfits:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = async (outfit: OutfitSuggestion) => {
    await removeSavedOutfit(outfit.id);
    setSavedOutfits(savedOutfits.filter((o) => o.id !== outfit.id));
  };

  const tabs = ['All', 'Smart Casual', 'Minimal', 'Formal', 'Traditional'];

  const filtered = savedOutfits.filter((item) => {
    if (activeTab === 'All') return true;
    return item.style === activeTab;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader
        title="VASTHRA"
        subtitle="Saved Favorites"
        showBack={true}
        rightAction="none"
      />

      {savedOutfits.length > 0 && (
        <FilterTabs
          tabs={tabs}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          iconName="bookmark-outline"
          title="No Saved Outfits Yet"
          message="Tap the bookmark icon on any outfit suggestion or save your favorite matches to build your personal lookbook."
          buttonTitle="Match an Outfit Now"
          onButtonPress={() => router.push('/(tabs)/match')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <OutfitCard
              outfit={item}
              initiallySaved={true}
              onSaveToggle={(o, isSaved) => {
                if (!isSaved) handleRemove(o);
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});
