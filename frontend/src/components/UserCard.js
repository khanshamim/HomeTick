/**
 * UserCard — displays a user's progress on the Family Overview screen.
 *
 * Props:
 *   progress — UserProgress object from the API
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../theme';

const ROLE_LABELS = { admin: 'Admin', member: 'Member' };

const AVATAR_COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#D97706',
  '#059669', '#0284C7', '#DC2626', '#65A30D',
];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function UserCard({ progress, onPress }) {
  const { user, total_tasks, completed_tasks, pending_tasks, completion_percentage } =
    progress;

  const bgColor = avatarColor(user.name);
  const pct = Math.min(completion_percentage, 100);

  return (
    <TouchableOpacity
      style={[styles.card, shadow.card]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      {/* Avatar + name */}
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: bgColor }]}>
          <Text style={styles.avatarText}>{initials(user.name)}</Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.role}>{ROLE_LABELS[user.role] ?? user.role}</Text>
        </View>
        <Text style={styles.pctLabel}>{pct}%</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} style={{ marginLeft: spacing.xs }} />
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: bgColor }]} />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Stat label="Total" value={total_tasks} />
        <Stat label="Done" value={completed_tasks} color={colors.success} />
        <Stat label="Pending" value={pending_tasks} color={colors.warning} />
      </View>
    </TouchableOpacity>
  );
}

function Stat({ label, value, color }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  nameBlock: { flex: 1 },
  name: { ...typography.h3 },
  role: { ...typography.bodySmall },
  pctLabel: { ...typography.h3, color: colors.primary },

  barTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: radius.full },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { ...typography.h3, color: colors.text },
  statLabel: { ...typography.label, marginTop: 2 },
});
