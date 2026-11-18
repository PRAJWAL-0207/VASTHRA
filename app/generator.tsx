import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '../components/BrandHeader';
import { ColorChip } from '../components/ColorChip';
import { OutfitCard } from '../components/OutfitCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { FASHION_COLORS, OCCASIONS, STYLES } from '../constants/colors';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import { generateOutfits } from '../services/outfitGenerator';
import {
  getUserProfile,
  getWardrobeItems,
  removeSavedOutfit,
  saveOutfit,
} from '../services/storage';
import {
  GenderPreference,
  OccasionType,
  OutfitSuggestion,
  StyleType,
  WardrobeItem,
} from '../types';

export default function OutfitGeneratorScreen() {
  const router = useRouter();
  const [gender, setGender] = useState<GenderPreference>('men');
  const [occasion, setOccasion] = useState<OccasionType>('Office');
  const [style, setStyle] = useState<StyleType>('Smart Casual');
  const [selectedColors, setSelectedColors] = useState<string[]>(['navy', 'cream', 'olive']);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [seedOffset, setSeedOffset] = useState(0);

  // Filter tab: 'all' | 'wardrobe' | 'inspirational'
  const [filterType, setFilterType] = useState<'all' | 'wardrobe' | 'inspirational'>('all');

  const [generatedOutfits, setGeneratedOutfits] = useState<OutfitSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load user profile & wardrobe items on mount
  useEffect(() => {
    async function init() {
      const profile = await getUserProfile();
      const items = await getWardrobeItems();
      setWardrobeItems(items);

      if (profile.gender) setGender(profile.gender);
      if (profile.favoriteColors?.length > 0) setSelectedColors(profile.favoriteColors);
      if (profile.preferredStyles?.length > 0) setStyle(profile.preferredStyles[0]);

      const initialResults = generateOutfits({
        gender: profile.gender || 'men',
        occasion: 'Office',
        style: profile.preferredStyles?.[0] || 'Smart Casual',
        availableColors: profile.favoriteColors || ['navy', 'cream', 'olive'],
        wardrobeItems: items,
        seedOffset: 0,
      });
      setGeneratedOutfits(initialResults);
    }
    init();
  }, []);

  const toggleColor = (id: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    if (selectedColors.includes(id)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter((c) => c !== id));
      }
    } else {
      setSelectedColors([...selectedColors, id]);
    }
  };

  const runGeneration = (offset = seedOffset) => {
    setIsGenerating(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setTimeout(() => {
      const results = generateOutfits({
        gender,
        occasion,
        style,
        availableColors: selectedColors,
        wardrobeItems,
        seedOffset: offset,
      });
      setGeneratedOutfits(results);
      setIsGenerating(false);
    }, 350);
  };

  const handleGenerate = () => {
    runGeneration(0);
  };

  const handleTryAnother = () => {
    const nextOffset = seedOffset + 1;
    setSeedOffset(nextOffset);
    runGeneration(nextOffset);
  };

  const handleSaveToggle = async (outfit: OutfitSuggestion, isSaved: boolean) => {
    if (isSaved) {
      await saveOutfit(outfit);
    } else {
      await removeSavedOutfit(outfit.id);
    }
  };

  // Filter list by selected filter tab
  const displayedOutfits = generatedOutfits.filter((item) => {
    if (filterType === 'wardrobe') return item.isFromWardrobe;
    if (filterType === 'inspirational') return !item.isFromWardrobe;
    return true;
  });

  const wardrobeOutfitsCount = generatedOutfits.filter((o) => o.isFromWardrobe).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader
        title="VASTHRA"
        subtitle="AI Outfit Recommendations"
        showBack={true}
        rightAction="saved"
      />

      <FlatList
        data={displayedOutfits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.controlsContainer}>
            {/* WARDROBE POWER BADGE */}
            <View style={styles.wardrobePowerCard}>
              <View style={styles.wardrobePowerIcon}>
                <Ionicons name="shirt" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.wardrobePowerTitle}>
                  Personalized to Your Wardrobe
                </Text>
                <Text style={styles.wardrobePowerDesc}>
                  Combining your {wardrobeItems.length} real clothing pieces with color harmony algorithms.
                </Text>
              </View>
            </View>

            {/* GENDER PICKER */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Styling Silhouette</Text>
              <View style={styles.genderRow}>
                {(['men', 'women', 'unisex'] as GenderPreference[]).map((g) => {
                  const isSelected = gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGender(g)}
                      style={[
                        styles.genderBtn,
                        isSelected && styles.genderBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.genderBtnText,
                          isSelected && styles.genderBtnTextActive,
                        ]}
                      >
                        {g.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* OCCASION PICKER */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Target Occasion</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {OCCASIONS.map((occ) => {
                  const isSelected = occasion === occ;
                  return (
                    <TouchableOpacity
                      key={occ}
                      onPress={() => setOccasion(occ)}
                      style={[
                        styles.pillOption,
                        isSelected && styles.pillOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          isSelected && styles.pillTextActive,
                        ]}
                      >
                        {occ}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* STYLE PICKER */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Style Aesthetic</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {STYLES.map((st) => {
                  const isSelected = style === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setStyle(st)}
                      style={[
                        styles.pillOption,
                        isSelected && styles.pillOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          isSelected && styles.pillTextActive,
                        ]}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* AVAILABLE / PREFERRED COLOURS */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Preferred Outfit Colors</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.colorsScroll}
              >
                {FASHION_COLORS.map((col) => {
                  const isSelected = selectedColors.includes(col.id);
                  return (
                    <View key={col.id} style={{ marginRight: 6 }}>
                      <ColorChip
                        color={col}
                        isSelected={isSelected}
                        onSelect={() => toggleColor(col.id)}
                        size="sm"
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {/* GENERATE & TRY ANOTHER BUTTONS */}
            <View style={styles.actionButtonsRow}>
              <PrimaryButton
                title="Generate Combinations"
                onPress={handleGenerate}
                loading={isGenerating}
                size="md"
                variant="primary"
                icon={<Ionicons name="sparkles" size={16} color={Colors.primaryGold} />}
                style={{ flex: 1 }}
              />

              <TouchableOpacity
                style={styles.tryAnotherBtn}
                onPress={handleTryAnother}
                activeOpacity={0.8}
              >
                <Ionicons name="shuffle-outline" size={16} color={Colors.primary} />
                <Text style={styles.tryAnotherText}>Try Another</Text>
              </TouchableOpacity>
            </View>

            {/* FILTER TABS: All, Real Wardrobe, Inspiration */}
            <View style={styles.outfitFilterRow}>
              <TouchableOpacity
                onPress={() => setFilterType('all')}
                style={[
                  styles.filterTabPill,
                  filterType === 'all' && styles.filterTabPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterTabPillText,
                    filterType === 'all' && styles.filterTabPillTextActive,
                  ]}
                >
                  All ({generatedOutfits.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilterType('wardrobe')}
                style={[
                  styles.filterTabPill,
                  filterType === 'wardrobe' && styles.filterTabPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterTabPillText,
                    filterType === 'wardrobe' && styles.filterTabPillTextActive,
                  ]}
                >
                  My Wardrobe ({wardrobeOutfitsCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilterType('inspirational')}
                style={[
                  styles.filterTabPill,
                  filterType === 'inspirational' && styles.filterTabPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterTabPillText,
                    filterType === 'inspirational' && styles.filterTabPillTextActive,
                  ]}
                >
                  Inspiration
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <OutfitCard
            outfit={item}
            onSaveToggle={handleSaveToggle}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  controlsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  wardrobePowerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 10,
    marginBottom: Spacing.md,
  },
  wardrobePowerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wardrobePowerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  wardrobePowerDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
    lineHeight: 15,
  },
  section: {
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  genderBtnTextActive: {
    color: '#FFFFFF',
  },
  pillOption: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: 6,
  },
  pillOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  colorsScroll: {
    paddingVertical: 2,
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tryAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  tryAnotherText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  outfitFilterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  filterTabPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
  },
  filterTabPillActive: {
    backgroundColor: Colors.primaryGold,
  },
  filterTabPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTabPillTextActive: {
    color: '#FFFFFF',
  },
});
