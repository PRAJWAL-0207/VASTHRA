import React, { useState } from 'react';
import {
  Image,
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
import { ColorChip } from '../components/ColorChip';
import { PrimaryButton } from '../components/PrimaryButton';
import { FASHION_COLORS, STYLES } from '../constants/colors';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import { getUserProfile, saveUserProfile } from '../services/storage';
import { GenderPreference, StyleType } from '../types';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // User selections
  const [gender, setGender] = useState<GenderPreference>('men');
  const [selectedColors, setSelectedColors] = useState<string[]>([
    'navy',
    'olive',
    'cream',
    'beige',
    'black',
  ]);
  const [selectedStyles, setSelectedStyles] = useState<StyleType[]>([
    'Minimal',
    'Smart Casual',
  ]);
  const [saving, setSaving] = useState(false);

  const toggleColor = (colorId: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    if (selectedColors.includes(colorId)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter((c) => c !== colorId));
      }
    } else {
      setSelectedColors([...selectedColors, colorId]);
    }
  };

  const toggleStyle = (style: StyleType) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    if (selectedStyles.includes(style)) {
      if (selectedStyles.length > 1) {
        setSelectedStyles(selectedStyles.filter((s) => s !== style));
      }
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const existing = await getUserProfile();
      await saveUserProfile({
        ...existing,
        gender,
        favoriteColors: selectedColors,
        preferredStyles: selectedStyles,
        onboardingCompleted: true,
      });
      router.replace('/(tabs)');
    } catch (e) {
      console.warn('Onboarding save error:', e);
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Step Indicator Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>VASTHRA</Text>
          <View style={styles.stepDotsRow}>
            {[1, 2, 3, 4].map((s) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  step === s && styles.stepDotActive,
                  step > s && styles.stepDotCompleted,
                ]}
              />
            ))}
          </View>
        </View>

        {/* STEP 1: WELCOME & BRAND VISION */}
        {step === 1 && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.welcomeHero}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
                }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={14} color={Colors.primaryGold} />
                <Text style={styles.heroBadgeText}>AI Sartorial Precision</Text>
              </View>
            </View>

            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeHeadline}>Wear Your Confidence.</Text>
              <Text style={styles.welcomeSubhead}>
                Your personal fashion and color harmony concierge. Match your wardrobe pieces, generate curated ensembles, and elevate your personal aesthetic with timeless color theory.
              </Text>
            </View>

            <PrimaryButton
              title="Begin Your Styling Journey"
              onPress={() => setStep(2)}
              size="lg"
              variant="primary"
              style={styles.actionBtn}
            />
          </ScrollView>
        )}

        {/* STEP 2: GENDER & STYLING PREFERENCE */}
        {step === 2 && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.stepTitle}>Styling Focus</Text>
            <Text style={styles.stepSubtitle}>
              Select your wardrobe tailoring and styling preference.
            </Text>

            <View style={styles.optionsList}>
              {[
                {
                  id: 'men' as GenderPreference,
                  title: 'Men’s Fashion',
                  desc: 'Tailored shirts, trousers, chinos, blazers & footwear',
                  icon: 'man-outline' as const,
                },
                {
                  id: 'women' as GenderPreference,
                  title: 'Women’s Fashion',
                  desc: 'Tops, dresses, skirts, palazzos, heels & styling',
                  icon: 'woman-outline' as const,
                },
                {
                  id: 'unisex' as GenderPreference,
                  title: 'Unisex & Contemporary',
                  desc: 'Minimalist, streetwear & gender-fluid silhouettes',
                  icon: 'people-outline' as const,
                },
              ].map((opt) => {
                const isSelected = gender === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      setGender(opt.id);
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                    }}
                    style={[
                      styles.preferenceCard,
                      isSelected && styles.preferenceCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.prefIconCircle,
                        isSelected && styles.prefIconCircleSelected,
                      ]}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={22}
                        color={isSelected ? '#FFFFFF' : Colors.textPrimary}
                      />
                    </View>
                    <View style={styles.prefTextCol}>
                      <Text
                        style={[
                          styles.prefTitle,
                          isSelected && styles.prefTitleSelected,
                        ]}
                      >
                        {opt.title}
                      </Text>
                      <Text style={styles.prefDesc}>{opt.desc}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <PrimaryButton
              title="Continue"
              onPress={() => setStep(3)}
              size="lg"
              variant="primary"
              style={styles.actionBtn}
            />
          </ScrollView>
        )}

        {/* STEP 3: FAVORITE COLOURS */}
        {step === 3 && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.stepTitle}>Your Palette</Text>
            <Text style={styles.stepSubtitle}>
              Tap the colours you love wearing or want to experiment with.
            </Text>

            <View style={styles.colorPaletteGrid}>
              {FASHION_COLORS.map((col) => {
                const isSelected = selectedColors.includes(col.id);
                return (
                  <View key={col.id} style={styles.colorChipWrapper}>
                    <ColorChip
                      color={col}
                      isSelected={isSelected}
                      onSelect={() => toggleColor(col.id)}
                      size="md"
                    />
                  </View>
                );
              })}
            </View>

            <PrimaryButton
              title="Continue to Styles"
              onPress={() => setStep(4)}
              size="lg"
              variant="primary"
              style={styles.actionBtn}
            />
          </ScrollView>
        )}

        {/* STEP 4: PREFERRED FASHION STYLES */}
        {step === 4 && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.stepTitle}>Style Personas</Text>
            <Text style={styles.stepSubtitle}>
              Which aesthetics describe your day-to-day fashion vibe? (Pick 1 or more)
            </Text>

            <View style={styles.stylePillsGrid}>
              {STYLES.map((st) => {
                const isSelected = selectedStyles.includes(st);
                return (
                  <TouchableOpacity
                    key={st}
                    activeOpacity={0.8}
                    onPress={() => toggleStyle(st)}
                    style={[
                      styles.stylePersonaCard,
                      isSelected && styles.stylePersonaSelected,
                    ]}
                  >
                    <Ionicons
                      name={
                        st === 'Minimal'
                          ? 'crop-outline'
                          : st === 'Formal'
                          ? 'briefcase-outline'
                          : st === 'Streetwear'
                          ? 'flame-outline'
                          : st === 'Traditional'
                          ? 'flower-outline'
                          : 'sparkles-outline'
                      }
                      size={20}
                      color={isSelected ? Colors.primaryGold : Colors.textPrimary}
                    />
                    <Text
                      style={[
                        styles.stylePersonaText,
                        isSelected && styles.stylePersonaTextSelected,
                      ]}
                    >
                      {st}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={Colors.primaryGold}
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <PrimaryButton
              title="Enter VASTHRA"
              onPress={handleFinish}
              loading={saving}
              size="lg"
              variant="primary"
              style={styles.actionBtn}
            />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 2.5,
  },
  stepDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceBorder,
    marginLeft: 6,
  },
  stepDotActive: {
    width: 22,
    backgroundColor: Colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: Colors.primaryGold,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  welcomeHero: {
    height: 360,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.surfaceElevated,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.4,
  },
  welcomeTextContainer: {
    marginBottom: Spacing.lg,
  },
  welcomeHeadline: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  welcomeSubhead: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  optionsList: {
    marginBottom: Spacing.lg,
  },
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  preferenceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
  },
  prefIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  prefIconCircleSelected: {
    backgroundColor: Colors.primary,
  },
  prefTextCol: {
    flex: 1,
  },
  prefTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  prefTitleSelected: {
    color: Colors.primary,
  },
  prefDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  colorPaletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  colorChipWrapper: {
    width: '23%',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stylePillsGrid: {
    marginBottom: Spacing.lg,
  },
  stylePersonaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
  },
  stylePersonaSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
  },
  stylePersonaText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  stylePersonaTextSelected: {
    color: Colors.primary,
  },
  checkIcon: {
    marginLeft: 8,
  },
  actionBtn: {
    marginTop: Spacing.md,
  },
});
