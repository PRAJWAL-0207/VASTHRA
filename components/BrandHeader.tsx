import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing } from '../constants/theme';

interface BrandHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: 'stylist' | 'saved' | 'none';
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  title = 'VASTHRA',
  subtitle = 'Wear Your Confidence',
  showBack = false,
  rightAction = 'stylist',
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.brandTitle}>{title}</Text>
          {subtitle ? <Text style={styles.tagline}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        {rightAction === 'stylist' && (
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => router.push('/stylist')}
          >
            <Ionicons name="sparkles" size={18} color={Colors.primaryGold} />
            <Text style={styles.iconButtonText}>AI Stylist</Text>
          </TouchableOpacity>
        )}
        {rightAction === 'saved' && (
          <TouchableOpacity
            style={styles.circleIconButton}
            activeOpacity={0.7}
            onPress={() => router.push('/saved')}
          >
            <Ionicons name="bookmark-outline" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 2.5,
    fontFamily: 'System',
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 2,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  iconButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 5,
    letterSpacing: 0.3,
  },
  circleIconButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
