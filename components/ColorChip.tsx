import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing } from '../constants/theme';
import { ColorOption } from '../types';

interface ColorChipProps {
  color: ColorOption;
  isSelected: boolean;
  onSelect: (color: ColorOption) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ColorChip: React.FC<ColorChipProps> = ({
  color,
  isSelected,
  onSelect,
  size = 'md',
  showLabel = true,
}) => {
  const handlePress = () => {
    try {
      Haptics.selectionAsync();
    } catch {
      // safe fallback
    }
    onSelect(color);
  };

  const getDimensions = () => {
    switch (size) {
      case 'sm': return { circle: 32, icon: 14 };
      case 'lg': return { circle: 48, icon: 20 };
      case 'md':
      default: return { circle: 40, icon: 16 };
    }
  };

  const dim = getDimensions();
  const isLight = color.brightness === 'light' || color.id === 'white' || color.id === 'cream';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      style={[
        styles.container,
        isSelected && styles.containerSelected,
      ]}
    >
      <View
        style={[
          styles.circle,
          {
            width: dim.circle,
            height: dim.circle,
            borderRadius: dim.circle / 2,
            backgroundColor: color.hex,
            borderColor: isLight ? '#DCD6CB' : 'transparent',
          },
          isSelected && styles.circleSelected,
        ]}
      >
        {isSelected && (
          <Ionicons
            name="checkmark"
            size={dim.icon}
            color={color.textHex}
          />
        )}
      </View>
      {showLabel && (
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            isSelected && styles.labelSelected,
          ]}
        >
          {color.name}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.md,
  },
  containerSelected: {
    backgroundColor: 'rgba(197, 160, 89, 0.08)',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginVertical: 2,
  },
  circleSelected: {
    borderWidth: 2.5,
    borderColor: Colors.primary,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  labelSelected: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
