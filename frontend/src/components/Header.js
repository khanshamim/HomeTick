import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

/**
 * Header
 *
 * Props:
 *   title      — primary heading (e.g. "Hi, Shamim 👋")
 *   subtitle   — secondary line (e.g. today's date)
 *   familyName — when provided, renders a small "🏠 Khan Family" badge
 *                above the title so users always know which family they're in
 *   onLogout   — tap handler for the logout icon (omit to hide icon)
 */
export default function Header({ title, subtitle, familyName, onLogout }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.textBlock}>
        {familyName ? (
          <View style={styles.familyBadge}>
            <Ionicons name="home" size={11} color="rgba(255,255,255,0.85)" />
            <Text style={styles.familyBadgeText}>{familyName}</Text>
          </View>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onLogout && (
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} hitSlop={8}>
          <Ionicons name="log-out-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  textBlock: { flex: 1 },

  familyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  familyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.3,
  },

  title: { ...typography.h2, color: colors.white },
  subtitle: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  logoutBtn: { marginLeft: spacing.md, marginBottom: 2 },
});
