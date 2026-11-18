import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import { OutfitSuggestion } from '../types';

interface OutfitCardProps {
  outfit: OutfitSuggestion;
  onSaveToggle?: (outfit: OutfitSuggestion, isSaved: boolean) => void;
  initiallySaved?: boolean;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  onSaveToggle,
  initiallySaved = false,
}) => {
  const [saved, setSaved] = useState(initiallySaved || !!outfit.isSaved);
  const [expanded, setExpanded] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const handleSave = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // safe fallback
    }
    const next = !saved;
    setSaved(next);
    onSaveToggle?.(outfit, next);
  };

  return (
    <View style={styles.card}>
      {/* Fashion Image Header */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: outfit.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />

        {/* Top Badges */}
        <View style={styles.topBadgesRow}>
          <View style={styles.scorePill}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            <Text style={styles.scorePillText}>{outfit.compatibilityScore}% Match</Text>
          </View>
          <TouchableOpacity
            style={styles.saveIconButton}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={saved ? Colors.primaryGold : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Wardrobe Indicator Badge if created from real clothes */}
        {outfit.isFromWardrobe && (
          <View style={styles.wardrobeBadge}>
            <Ionicons name="shirt" size={11} color="#FFFFFF" />
            <Text style={styles.wardrobeBadgeText}>From Your Wardrobe</Text>
          </View>
        )}

        {/* Bottom tags on image */}
        <View style={styles.bottomOverlayTags}>
          <View style={styles.tagPill}>
            <Text style={styles.tagPillText}>{outfit.occasion}</Text>
          </View>
          <View style={[styles.tagPill, styles.styleTagPill]}>
            <Text style={styles.tagPillText}>{outfit.style}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{outfit.title}</Text>
        <Text style={styles.subtitle}>{outfit.subtitle}</Text>
        <Text style={styles.description}>{outfit.description}</Text>

        {/* Pieces Swatches & Real Clothing Photos */}
        <View style={styles.piecesContainer}>
          <Text style={styles.piecesHeader}>Ensemble Breakdown</Text>
          {outfit.pieces.map((piece, index) => (
            <View key={index} style={styles.pieceRow}>
              {piece.imageUri ? (
                <Image
                  source={{ uri: piece.imageUri }}
                  style={styles.pieceThumbImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.pieceSwatch,
                    { backgroundColor: piece.colorHex },
                    (piece.colorHex === '#FFFFFF' || piece.colorHex === '#F5EFE6') && styles.lightBorder,
                  ]}
                />
              )}
              <View style={styles.pieceInfo}>
                <Text style={styles.pieceType}>{piece.type}</Text>
                <Text numberOfLines={1} style={styles.pieceName}>{piece.name}</Text>
              </View>
              <Text style={styles.pieceColorName}>{piece.colorName}</Text>
            </View>
          ))}
        </View>

        {/* Action buttons: Details & Footwear Guide */}
        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={styles.viewDetailsBtn}
            onPress={() => setDetailsModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="eye-outline" size={14} color={Colors.primary} />
            <Text style={styles.viewDetailsText}>View Outfit Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setExpanded(!expanded)}
            style={styles.expandToggle}
          >
            <Text style={styles.expandToggleText}>
              {expanded ? 'Less' : 'Footwear Guide'}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Footwear & Accessory Advice (Expanded) */}
        {expanded && (
          <View style={styles.expandedSection}>
            <View style={styles.adviceBlock}>
              <View style={styles.adviceTitleRow}>
                <Ionicons name="footsteps-outline" size={16} color={Colors.textPrimary} />
                <Text style={styles.adviceTitle}>Footwear Guidance</Text>
              </View>
              <Text style={styles.adviceText}>{outfit.shoesAdvice}</Text>
            </View>

            <View style={styles.adviceBlock}>
              <View style={styles.adviceTitleRow}>
                <Ionicons name="watch-outline" size={16} color={Colors.textPrimary} />
                <Text style={styles.adviceTitle}>Accessories</Text>
              </View>
              <Text style={styles.adviceText}>{outfit.accessoriesAdvice}</Text>
            </View>

            {outfit.stylingTips && outfit.stylingTips.length > 0 && (
              <View style={styles.adviceBlock}>
                <View style={styles.adviceTitleRow}>
                  <Ionicons name="bulb-outline" size={16} color={Colors.primaryGold} />
                  <Text style={styles.adviceTitle}>Styling Pro-Tips</Text>
                </View>
                {outfit.stylingTips.map((tip, idx) => (
                  <Text key={idx} style={styles.bulletTip}>
                    • {tip}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* FULL OUTFIT DETAILS MODAL */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Outfit Details</Text>
            <TouchableOpacity
              onPress={() => setDetailsModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalImageContainer}>
              <Image source={{ uri: outfit.imageUrl }} style={styles.modalImage} resizeMode="cover" />
              <View style={styles.modalScoreBadge}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                <Text style={styles.modalScoreText}>{outfit.compatibilityScore}% Compatibility</Text>
              </View>
            </View>

            <Text style={styles.modalOutfitTitle}>{outfit.title}</Text>
            <Text style={styles.modalOutfitSub}>{outfit.subtitle}</Text>
            <Text style={styles.modalOutfitDesc}>{outfit.description}</Text>

            {/* Pieces Breakdown with real photos */}
            <View style={styles.modalPiecesSection}>
              <Text style={styles.modalSectionTitle}>Ensemble Garments</Text>
              {outfit.pieces.map((p, idx) => (
                <View key={idx} style={styles.modalPieceCard}>
                  {p.imageUri ? (
                    <Image source={{ uri: p.imageUri }} style={styles.modalPiecePhoto} resizeMode="cover" />
                  ) : (
                    <View style={[styles.modalPieceColorBox, { backgroundColor: p.colorHex }]} />
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.modalPieceType}>{p.type}</Text>
                    <Text style={styles.modalPieceName}>{p.name}</Text>
                    <Text style={styles.modalPieceColor}>Color: {p.colorName}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Footwear & Styling Tips */}
            <View style={styles.modalAdviceCard}>
              <Text style={styles.modalAdviceTitle}>Shoes Guidance</Text>
              <Text style={styles.modalAdviceBody}>{outfit.shoesAdvice}</Text>

              <Text style={[styles.modalAdviceTitle, { marginTop: 12 }]}>Accessories</Text>
              <Text style={styles.modalAdviceBody}>{outfit.accessoriesAdvice}</Text>

              <Text style={[styles.modalAdviceTitle, { marginTop: 12 }]}>Styling Tips</Text>
              {outfit.stylingTips.map((tip, i) => (
                <Text key={i} style={styles.modalTipText}>• {tip}</Text>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.card,
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
    backgroundColor: Colors.surfaceElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 18, 16, 0.25)',
  },
  topBadgesRow: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  scorePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  saveIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(20, 20, 20, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wardrobeBadge: {
    position: 'absolute',
    top: Spacing.sm + 38,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryGold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  wardrobeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  bottomOverlayTags: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    gap: 6,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  styleTagPill: {
    backgroundColor: 'rgba(20, 18, 16, 0.82)',
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.primaryGold,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  piecesContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  piecesHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  pieceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pieceThumbImage: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 8,
  },
  pieceSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  lightBorder: {
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  pieceInfo: {
    flex: 1,
  },
  pieceType: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  pieceName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pieceColorName: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandToggleText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.primary,
  },
  expandedSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: Spacing.sm,
  },
  adviceBlock: {
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  adviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  adviceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  adviceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  bulletTip: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  modalImageContainer: {
    height: 240,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.surfaceElevated,
    marginBottom: Spacing.md,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalScoreBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  modalScoreText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  modalOutfitTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalOutfitSub: {
    fontSize: 13,
    color: Colors.primaryGold,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 8,
  },
  modalOutfitDesc: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  modalPiecesSection: {
    marginBottom: Spacing.md,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  modalPieceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 6,
  },
  modalPiecePhoto: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
  },
  modalPieceColorBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  modalPieceType: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  modalPieceName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalPieceColor: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  modalAdviceCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.xl,
  },
  modalAdviceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalAdviceBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginTop: 2,
  },
  modalTipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
