/**
 * FamilySelectionScreen — the first screen shown to a new user.
 *
 * Presents two primary paths:
 *   A) Join with an invite code  → JoinFamilyScreen
 *   B) Create a new family       → FamilySetupScreen
 *
 * Also shows the list of existing families so admins on a new device
 * can tap to re-enter their family without needing to recreate it.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, radius, typography, shadow } from '../theme';

export default function FamilySelectionScreen() {
  const { families, fetchFamilies, selectFamily } = useApp();
  const navigation = useNavigation();

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleJoin = async (family) => {
    await selectFamily(String(family.id), family.name);
  };

  const renderFamily = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, shadow.card]}
      onPress={() => handleJoin(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardIcon}>
        <Ionicons name="home" size={18} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.familyName}>{item.name}</Text>
        <Text style={styles.familyMeta}>Tap to sign in</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.hero}>
      {/* Logo icon */}
      <View style={styles.logoBox}>
        <Ionicons name="home" size={32} color={colors.primaryForeground} />
      </View>

      {/* App name */}
      <Text style={styles.appName}>HomeTick</Text>

      {/* Primary CTA buttons */}
      <View style={styles.btnGroup}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('FamilySetup')}
          activeOpacity={0.88}
        >
          <Text style={styles.btnPrimaryText}>Create Family</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate('JoinFamily')}
          activeOpacity={0.88}
        >
          <Text style={styles.btnOutlineText}>Join Family</Text>
        </TouchableOpacity>
      </View>

      {/* Divider + spinner — only shown once we know families exist */}
      {families.length > 0 && (
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>existing families</Text>
          <View style={styles.dividerLine} />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={families}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderFamily}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.list}
        ListEmptyComponent={null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  list: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },

  // ── Hero (logo + title + buttons) ─────────────────────────────────
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xxl + spacing.xl,
    paddingBottom: spacing.lg,
  },

  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,                 // rounded-2xl
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  appName: {
    fontSize: 36,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.xxl,
  },

  // ── Buttons ───────────────────────────────────────────────────────
  btnGroup: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  btnPrimary: {
    width: '100%',
    height: 56,                       // h-14
    borderRadius: radius.xl,          // rounded-xl
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primaryForeground,
  },

  btnOutline: {
    width: '100%',
    height: 56,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  btnOutlineText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },

  // ── Divider ───────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: { ...typography.label, color: colors.textDisabled },

  // ── Family list cards ─────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: { flex: 1 },
  familyName: { ...typography.h4, color: colors.text },
  familyMeta: { ...typography.bodySmall, marginTop: 2 },

});
