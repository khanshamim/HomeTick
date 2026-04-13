/**
 * HomeScreen — daily checklist for the current user.
 *
 * Shows:
 *   • Family name badge in the header (🏠 Khan Family)
 *   • Personal greeting ("Hello, Shamim 👋")
 *   • Progress bar (X / N completed)
 *   • Task list with "Assigned by <name>" on each card
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';

import Header from '../components/Header';
import TaskItem from '../components/TaskItem';
import { useApp } from '../context/AppContext';
import { useTasks } from '../hooks/useTasks';
import { useNotifications } from '../hooks/useNotifications';
import { colors, spacing, typography } from '../theme';

function todayLabel() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function HomeScreen() {
  const { currentUser, familyName, logout } = useApp();
  const { tasks, loading, error, refresh, toggleTask } = useTasks(currentUser?.id);

  // Register for push notifications on first render
  useNotifications(currentUser?.id);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (error) Alert.alert('Error', error);
  }, [error]);

  const completed = tasks.filter((t) => t.completed).length;
  const total     = tasks.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  const renderEmpty = () =>
    !loading ? (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🎉</Text>
        <Text style={styles.emptyTitle}>All clear!</Text>
        <Text style={styles.emptyBody}>No tasks assigned for today.</Text>
      </View>
    ) : null;

  return (
    <View style={styles.screen}>
      <Header
        familyName={familyName}
        title={`Hello, ${currentUser?.name} 👋`}
        subtitle={todayLabel()}
        onLogout={logout}
      />

      {/* Progress summary */}
      <View style={styles.progressBar}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {completed} / {total} completed
          </Text>
          <Text style={styles.progressPct}>{pct}%</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem task={item} onToggle={toggleTask} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  progressBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressText: { ...typography.bodySmall },
  progressPct: { ...typography.bodySmall, color: colors.primary, fontWeight: '700' },
  barTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 99,
    overflow: 'hidden',
  },
  barFill: { height: 4, backgroundColor: colors.success, borderRadius: 99 },

  list: { padding: spacing.md },

  emptyState: { alignItems: 'center', marginTop: spacing.xxl },
  emptyIcon:  { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.h2, marginBottom: spacing.xs },
  emptyBody:  { ...typography.body, color: colors.textSecondary },
});
