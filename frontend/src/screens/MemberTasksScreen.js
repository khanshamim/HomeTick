/**
 * MemberTasksScreen — read-only view of a family member's daily tasks.
 *
 * Pushed from FamilyOverviewScreen when an admin taps a member card.
 * Route params: { member: User }
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTasks } from '../hooks/useTasks';
import { colors, spacing, radius, typography, shadow } from '../theme';

export default function MemberTasksScreen() {
  const navigation = useNavigation();
  const { params: { member } } = useRoute();
  const { tasks, loading, refresh } = useTasks(member.id);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{member.name}</Text>
          <Text style={styles.headerSubtitle}>
            {completed} / {total} completed today
          </Text>
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No tasks assigned for today.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.taskCard, shadow.card]}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.completed ? colors.secondary : colors.border },
              ]}
            >
              {item.completed && (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              )}
            </View>
            <View style={styles.taskInfo}>
              <Text
                style={[styles.taskTitle, item.completed && styles.taskTitleDone]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {item.due_time ? (
                <View style={styles.dueRow}>
                  <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.dueText}>{item.due_time}</Text>
                </View>
              ) : null}
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: item.completed ? colors.secondary + '22' : colors.warning + '22' },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: item.completed ? colors.secondary : colors.warning },
                ]}
              >
                {item.completed ? 'Done' : 'Pending'}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerText: { flex: 1 },
  headerTitle: { ...typography.h2, color: colors.white },
  headerSubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  list: { padding: spacing.md },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  statusDot: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: { flex: 1 },
  taskTitle: { ...typography.body, fontWeight: '500' },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.textSecondary },
  dueRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  dueText: { ...typography.bodySmall },

  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },

  empty: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.sm },
  emptyText: { ...typography.body, color: colors.textSecondary },
});
