/**
 * UserSelectionScreen — shown on first launch (or after logout).
 *
 * Fetches the list of family members from the API and lets the user
 * tap their name to begin. The selection is persisted via AppContext.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, radius, typography, shadow } from '../theme';

const ROLE_ICON = { admin: 'shield-checkmark', member: 'person-circle' };
const ROLE_COLOR = { admin: colors.primary, member: colors.secondary };

export default function UserSelectionScreen() {
  const { users, loadingUsers, fetchUsers, selectUser } = useApp();

  // fetchUsers is triggered by RootNavigator on app start

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={[styles.userCard, shadow.card]}
      onPress={() => selectUser(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconCircle, { backgroundColor: ROLE_COLOR[item.role] ?? colors.primary }]}>
        <Ionicons
          name={ROLE_ICON[item.role] ?? 'person'}
          size={28}
          color={colors.white}
        />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userRole}>{item.role === 'admin' ? 'Admin' : 'Member'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textDisabled} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <Text style={styles.appName}>HomeTick</Text>
        <Text style={styles.tagline}>Who's checking in today?</Text>
      </View>

      {loadingUsers ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No family members found.{'\n'}Make sure the backend is running.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  appName: { fontSize: 36, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
  tagline: { ...typography.body, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs },
  list: { padding: spacing.lg },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userInfo: { flex: 1 },
  userName: { ...typography.h3 },
  userRole: { ...typography.bodySmall, marginTop: 2 },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 22,
  },
});
