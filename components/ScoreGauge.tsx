import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import { MatchResult } from '../types';

interface ScoreGaugeProps {
  result: MatchResult;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ result }) => {
  const { score, rating, ratingLabel, ratingColor, harmonyType } = result;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: `${ratingColor}15` }]}>
          <View style={[styles.dot, { backgroundColor: ratingColor }]} />
          <Text style={[styles.badgeText, { color: ratingColor }]}>
            {rating} • {ratingLabel}
          </Text>
        </View>
        <Text style={styles.harmonyTitle}>{harmonyType}</Text>
      </View>

      <View style={styles.scoreRow}>
        <View style={[styles.scoreCircle, { borderColor: ratingColor }]}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreDenominator}>/ 100</Text>
        </View>

        <View style={styles.scoreMetrics}>
          <View style={styles.barContainer}>
            <View
              style={[
                styles.barFill,
                { width: `${score}%`, backgroundColor: ratingColor },
              ]}
            />
          </View>
          <Text style={styles.scoreSummary}>
            {score >= 88
              ? 'Flawless chromatic alignment according to fashion color theory.'
              : score >= 75
              ? 'Tastefully coordinated with balanced contrast.'
              : score >= 60
              ? 'Acceptable palette; can be elevated with neutral anchors.'
              : 'High visual conflict between competing saturated tones.'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.card,
    marginVertical: Spacing.sm,
  },
  headerRow: {
    marginBottom: Spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  harmonyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  scoreCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    marginRight: Spacing.md,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  scoreDenominator: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: -2,
  },
  scoreMetrics: {
    flex: 1,
  },
  barContainer: {
    height: 7,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  scoreSummary: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
