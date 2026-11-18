import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BorderRadius, Colors, Spacing } from '../constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  icon,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available in some environments
    }
    onPress();
  };

  const getBackgroundColor = () => {
    if (disabled) return Colors.surfaceBorder;
    switch (variant) {
      case 'primary': return Colors.primary;
      case 'gold': return Colors.primaryGold;
      case 'secondary': return Colors.surfaceElevated;
      case 'outline': return 'transparent';
      case 'danger': return Colors.scorePoor;
      default: return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.textMuted;
    switch (variant) {
      case 'primary': return Colors.textLight;
      case 'gold': return '#FFFFFF';
      case 'secondary': return Colors.textPrimary;
      case 'outline': return Colors.primary;
      case 'danger': return '#FFFFFF';
      default: return Colors.textLight;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 14 };
      case 'lg': return { paddingVertical: 16, paddingHorizontal: 28 };
      case 'md':
      default: return { paddingVertical: 13, paddingHorizontal: 22 };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getPadding(),
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outlineBorder,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              { color: getTextColor() },
              size === 'sm' && styles.smText,
              size === 'lg' && styles.lgText,
              icon ? { marginLeft: 8 } : null,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBorder: {
    borderWidth: 1.2,
    borderColor: Colors.primary,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  smText: {
    fontSize: 13,
    fontWeight: '500',
  },
  lgText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
