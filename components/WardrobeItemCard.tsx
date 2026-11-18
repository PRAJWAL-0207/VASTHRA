import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import { WardrobeItem } from '../types';

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMatchShortcut?: () => void;
}

export const WardrobeItemCard: React.FC<WardrobeItemCardProps> = ({
  item,
  onPress,
  onEdit,
  onDelete,
  onMatchShortcut,
}) => {
  const handleDelete = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // safe fallback
    }
    onDelete?.();
  };

  const handleEdit = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onEdit?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        {/* Quick action top icons */}
        <View style={styles.topActionsRow}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={handleEdit}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionIconBtn, styles.deleteBtn]}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>
          {item.name}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.colorDotsGroup}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: item.colorHex },
                (item.colorHex === '#FFFFFF' || item.colorHex === '#F5EFE6') && styles.colorDotBorder,
              ]}
            />
            {item.secondaryColorHex && (
              <View
                style={[
                  styles.colorDot,
                  styles.secondaryDot,
                  { backgroundColor: item.secondaryColorHex },
                  (item.secondaryColorHex === '#FFFFFF' || item.secondaryColorHex === '#F5EFE6') && styles.colorDotBorder,
                ]}
              />
            )}
          </View>
          <Text numberOfLines={1} style={styles.colorText}>
            {item.color}
            {item.secondaryColor ? ` / ${item.secondaryColor}` : ''}
          </Text>
        </View>

        {item.pattern && (
          <View style={styles.tagRow}>
            <Text style={styles.patternPill}>{item.pattern}</Text>
            <Text style={styles.occasionPill}>{item.occasion}</Text>
          </View>
        )}

        {onMatchShortcut && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onMatchShortcut}
            style={styles.matchShortcutButton}
          >
            <Ionicons name="color-palette-outline" size={12} color={Colors.primary} />
            <Text style={styles.matchShortcutText}>Match Outfit</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.subtle,
    marginBottom: Spacing.md,
    flex: 1,
    marginHorizontal: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 154,
    backgroundColor: Colors.surfaceElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(20, 20, 20, 0.72)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  topActionsRow: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: 4,
  },
  actionIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(20, 20, 20, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: 'rgba(193, 41, 46, 0.75)',
  },
  content: {
    padding: Spacing.sm,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorDotsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  colorDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  secondaryDot: {
    marginLeft: -3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  colorDotBorder: {
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  colorText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  patternPill: {
    fontSize: 9.5,
    color: Colors.accentTaupe,
    fontWeight: '600',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.sm,
  },
  occasionPill: {
    fontSize: 9.5,
    color: Colors.primaryGold,
    fontWeight: '600',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.sm,
  },
  matchShortcutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginTop: 2,
    gap: 4,
  },
  matchShortcutText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.primary,
  },
});
