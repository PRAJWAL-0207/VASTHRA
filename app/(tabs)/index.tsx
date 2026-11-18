import React, { useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
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
import { BrandHeader } from '../../components/BrandHeader';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';
import { getUserProfile, isOutfitSaved, saveOutfit } from '../../services/storage';
import { OutfitSuggestion, UserProfile } from '../../types';

const DAILY_INSPIRATION: OutfitSuggestion = {
  id: 'daily-curated-1',
  title: 'The Tonal Olive Sartorial',
  subtitle: 'Effortless earth tone dialogue with Italian drape',
  occasion: 'Casual',
  style: 'Smart Casual',
  gender: 'men',
  compatibilityScore: 98,
  harmonyTitle: 'Botanical Earth Resonance',
  description: 'A camp-collar olive utility overshirt balanced with crisp pleated beige linen chinos and warm chocolate loafers.',
  pieces: [
    { type: 'Top', name: 'Olive Utility Overshirt', colorName: 'Olive', colorHex: '#5B6846' },
    { type: 'Bottom', name: 'Pleated Chino Trousers', colorName: 'Beige', colorHex: '#D7C4B7' },
    { type: 'Shoes', name: 'Chocolate Suede Loafers', colorName: 'Brown', colorHex: '#5C3E2A' },
    { type: 'Accessory', name: 'Vintage Chrono & Belt', colorName: 'Brown', colorHex: '#5C3E2A' },
  ],
  shoesAdvice: 'Wear barefoot or with invisible moisture-wicking bamboo liners.',
  accessoriesAdvice: 'Warm horn-rim or tortoiseshell sunglasses and a braided suede belt.',
  stylingTips: [
    'Layer over an unbuttoned ribbed white undershirt.',
    'Keep trouser break clean with zero stacking over the shoe vamp.',
  ],
  imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80',
};

const TRENDING_COMBOS = [
  {
    id: 'trend-1',
    title: 'The Riviera Classic',
    pieces: ['Navy', 'Cream', 'Brown'],
    colors: ['#1B2A4A', '#F5EFE6', '#5C3E2A'],
    vibe: 'Quiet Luxury',
    score: 97,
  },
  {
    id: 'trend-2',
    title: 'Botanical Warmth',
    pieces: ['Olive', 'Beige', 'White'],
    colors: ['#5B6846', '#D7C4B7', '#FFFFFF'],
    vibe: 'Natural Elegance',
    score: 98,
  },
  {
    id: 'trend-3',
    title: 'Nocturnal Contrast',
    pieces: ['Black', 'Grey', 'White'],
    colors: ['#141414', '#8E9196', '#FFFFFF'],
    vibe: 'Modern Minimal',
    score: 95,
  },
  {
    id: 'trend-4',
    title: 'Ceremonial Majesty',
    pieces: ['Maroon', 'Cream', 'Gold'],
    colors: ['#6B1D2F', '#F5EFE6', '#C5A059'],
    vibe: 'Festive Grandeur',
    score: 99,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dailySaved, setDailySaved] = useState(false);

  const loadData = async () => {
    try {
      const p = await getUserProfile();
      setProfile(p);
      const saved = await isOutfitSaved(DAILY_INSPIRATION.id);
      setDailySaved(saved);
    } catch (e) {
      console.warn('Home data load error:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleDailySave = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await saveOutfit(DAILY_INSPIRATION);
    setDailySaved(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader
        title="VASTHRA"
        subtitle="Wear Your Confidence"
        rightAction="stylist"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* PERSONALIZED WELCOME */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.greetingText}>
            {getGreeting()},{' '}
            <Text style={styles.userNameText}>
              {profile?.name || 'Style Enthusiast'}
            </Text>
          </Text>
          <Text style={styles.greetingSubtext}>
            Curating your personal silhouette with intelligent color theory.
          </Text>
        </View>

        {/* QUICK ACTION CARDS */}
        <View style={styles.quickActionsGrid}>
          {/* Action 1: MATCH MY OUTFIT (Featured) */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push('/(tabs)/match')}
            style={[styles.actionCard, styles.actionCardFeatured]}
          >
            <View style={styles.actionCardHeader}>
              <View style={styles.featuredIconBox}>
                <Ionicons name="color-filter" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.badgePopular}>
                <Text style={styles.badgePopularText}>Core Engine</Text>
              </View>
            </View>
            <Text style={styles.actionTitleFeatured}>Match My Outfit</Text>
            <Text style={styles.actionDescFeatured}>
              Calculate real color harmony, occasion score & item synergy
            </Text>
          </TouchableOpacity>

          {/* Action 2: AI OUTFIT GENERATOR */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push('/generator')}
            style={styles.actionCard}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="sparkles-outline" size={20} color={Colors.primaryGold} />
            </View>
            <Text style={styles.actionTitle}>AI Generator</Text>
            <Text style={styles.actionDesc}>
              Full ensembles tailored to your dress code
            </Text>
          </TouchableOpacity>

          {/* Action 3: DIGITAL WARDROBE */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push('/(tabs)/wardrobe')}
            style={styles.actionCard}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="shirt-outline" size={20} color={Colors.accentTerracotta} />
            </View>
            <Text style={styles.actionTitle}>My Wardrobe</Text>
            <Text style={styles.actionDesc}>
              Upload, tag and organize your garments
            </Text>
          </TouchableOpacity>

          {/* Action 4: AI FASHION STYLIST */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push('/stylist')}
            style={styles.actionCard}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="chatbubbles-outline" size={20} color={Colors.accentOlive} />
            </View>
            <Text style={styles.actionTitle}>AI Stylist</Text>
            <Text style={styles.actionDesc}>
              Ask fashion advice & pairing answers
            </Text>
          </TouchableOpacity>
        </View>

        {/* DAILY INSPIRATION CARD */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Daily Inspiration</Text>
            <Text style={styles.sectionSubtitle}>
              Curated masterclass look of the day
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/explore')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>Explore All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inspirationCard}>
          <Image
            source={{ uri: DAILY_INSPIRATION.imageUrl }}
            style={styles.inspImage}
            resizeMode="cover"
          />
          <View style={styles.inspOverlay} />

          <View style={styles.inspTopRow}>
            <View style={styles.inspScoreBadge}>
              <Ionicons name="star" size={12} color={Colors.primaryGold} />
              <Text style={styles.inspScoreText}>
                {DAILY_INSPIRATION.compatibilityScore}% Compatibility
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleToggleDailySave}
              style={styles.inspSaveBtn}
            >
              <Ionicons
                name={dailySaved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={dailySaved ? Colors.primaryGold : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inspBottomContent}>
            <Text style={styles.inspTitle}>{DAILY_INSPIRATION.title}</Text>
            <Text style={styles.inspSubtitle}>{DAILY_INSPIRATION.subtitle}</Text>

            {/* Micro swatch row */}
            <View style={styles.swatchRow}>
              {DAILY_INSPIRATION.pieces.map((p, i) => (
                <View key={i} style={styles.swatchItem}>
                  <View
                    style={[
                      styles.swatchDot,
                      { backgroundColor: p.colorHex },
                      (p.colorHex === '#FFFFFF' || p.colorHex === '#F5EFE6') &&
                        styles.lightDotBorder,
                    ]}
                  />
                  <Text style={styles.swatchText}>{p.colorName}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* TRENDING COMBINATIONS */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Trending Color Combos</Text>
            <Text style={styles.sectionSubtitle}>
              Sartorially proven color triads
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingScroll}
        >
          {TRENDING_COMBOS.map((combo) => (
            <TouchableOpacity
              key={combo.id}
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/match')}
              style={styles.comboCard}
            >
              <View style={styles.comboSwatches}>
                {combo.colors.map((c, i) => (
                  <View
                    key={i}
                    style={[
                      styles.comboColorBlock,
                      { backgroundColor: c },
                      (c === '#FFFFFF' || c === '#F5EFE6') && styles.lightDotBorder,
                    ]}
                  />
                ))}
              </View>
              <View style={styles.comboInfo}>
                <Text style={styles.comboTitle}>{combo.title}</Text>
                <Text style={styles.comboPieces}>{combo.pieces.join(' + ')}</Text>
                <View style={styles.comboFooter}>
                  <Text style={styles.comboVibe}>{combo.vibe}</Text>
                  <Text style={styles.comboScore}>{combo.score}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
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
  welcomeBanner: {
    marginBottom: Spacing.md,
    marginTop: 4,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  userNameText: {
    color: Colors.accentTaupe,
  },
  greetingSubtext: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  actionCard: {
    width: '48.5%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
    ...Shadows.subtle,
  },
  actionCardFeatured: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    paddingVertical: 18,
    marginBottom: Spacing.sm,
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featuredIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePopular: {
    backgroundColor: Colors.primaryGold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  badgePopularText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionTitleFeatured: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  actionDescFeatured: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
    lineHeight: 16,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  inspirationCard: {
    height: 250,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.surfaceElevated,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  inspImage: {
    width: '100%',
    height: '100%',
  },
  inspOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 18, 16, 0.4)',
  },
  inspTopRow: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inspScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  inspScoreText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
  },
  inspSaveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 20, 20, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspBottomContent: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  inspTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  inspSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    marginBottom: 8,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginRight: 6,
  },
  swatchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  lightDotBorder: {
    borderWidth: 1,
    borderColor: '#D4C3B3',
  },
  swatchText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  trendingScroll: {
    paddingVertical: 4,
  },
  comboCard: {
    width: 180,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: Spacing.md,
    ...Shadows.subtle,
  },
  comboSwatches: {
    height: 60,
    flexDirection: 'row',
  },
  comboColorBlock: {
    flex: 1,
    height: '100%',
  },
  comboInfo: {
    padding: Spacing.sm,
  },
  comboTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  comboPieces: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  comboFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  comboVibe: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryGold,
    textTransform: 'uppercase',
  },
  comboScore: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.scoreExcellent,
  },
});
