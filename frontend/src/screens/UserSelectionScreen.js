/**
 * UserSelectionScreen — shown after a family is selected but before a user is picked.
 *
 * Fetches the list of family members and lets the user tap their name to begin.
 * Shows the family name prominently so users always know which family they're in.
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

const ROLE_ICON  = { admin: 'shield-checkmark', member: 'person-circle' };
const ROLE_COLOR = { admin: colors.primary, member: colors.success };

export default function UserSelectionScreen() {
  const {
    users,
    loadingUsers,
    fetchUsersForFamily,
    currentFamilyId,
    familyName,
    selectUser,
    logoutFamily,
  } = useApp();

  // Reload users when this screen mounts (covers back-navigation and fresh launch)
  useEffect(() => {
    if (currentFamilyId) fetchUsersForFamily(currentFamilyId);
  }, [currentFamilyId]);

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
        <View style={styles.familyBadge}>
          <Ionicons name="home" size={14} color="rgba(255,255,255,0.9)" />
          <Text style={styles.familyBadgeText}>{familyName || 'My Family'}</Text>
        </View>
        <Text style={styles.appName}>HomeTick</Text>
        <Text style={styles.tagline}>Who's checking in today?</Text>
        <TouchableOpacity style={styles.changeFamily} onPress={logoutFamily}>
          <Ionicons name="swap-horizontal-outline" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.changeFamilyText}>Change family</Text>
        </TouchableOpacity>
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

  familyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  familyBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },

  appName: { fontSize: 36, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
  tagline: { ...typography.body, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs },
  changeFamily: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  changeFamilyText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },

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
