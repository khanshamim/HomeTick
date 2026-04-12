/**
 * TaskItem — single row in the daily checklist.
 *
 * Props:
 *   task        — TaskWithStatus object
 *   onToggle    — (taskId, currentCompleted) => void
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../theme';

export default function TaskItem({ task, onToggle }) {
  const { id, title, completed, due_time } = task;

  const formattedTime = due_time
    ? due_time.slice(0, 5) // "HH:MM:SS" → "HH:MM"
    : null;

  return (
    <View style={[styles.card, shadow.card]}>
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
        <Text style={[styles.title, completed && styles.titleDone]}>{title}</Text>
        {formattedTime && (
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
        )}
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
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  content: { flex: 1 },
  title: { ...typography.body, color: colors.text },
  titleDone: {
    color: colors.textDisabled,
    textDecorationLine: 'line-through',
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3 },
  timeText: { ...typography.bodySmall, color: colors.textSecondary },
  badge: {
    backgroundColor: colors.secondaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.primaryDark },
});
