/**
 * TaskItem — single row in the daily checklist.
 *
 * Props:
 *   task        — TaskWithStatus object (includes assigned_by name from the API)
 *   onToggle    — (taskId, currentCompleted) => void
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../theme';

export default function TaskItem({ task, onToggle }) {
  const { id, title, completed, due_time, assigned_by } = task;

  const formattedTime = due_time
    ? due_time.slice(0, 5) // "HH:MM:SS" → "HH:MM"
    : null;

  return (
    <View style={[styles.card, shadow.card, completed && styles.cardDone]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(id, completed)}
        activeOpacity={0.7}
        hitSlop={8}
      >
        <View style={[styles.checkCircle, completed && styles.checkCircleActive]}>
          {completed && <Ionicons name="checkmark" size={14} color={colors.white} />}
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.titleDone]} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          {formattedTime ? (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.metaText}>{formattedTime}</Text>
            </View>
          ) : null}

          {assigned_by ? (
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.metaText}>Assigned by {assigned_by}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {completed && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Done</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardDone: {
    opacity: 0.72,
  },
  checkbox: { marginRight: spacing.md },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  checkCircleActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  content: { flex: 1 },
  title: { ...typography.body, color: colors.text },
  titleDone: {
    color: colors.textDisabled,
    textDecorationLine: 'line-through',
  },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 5 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { ...typography.bodySmall, color: colors.textSecondary },

  badge: {
    backgroundColor: colors.successLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.success },
});
