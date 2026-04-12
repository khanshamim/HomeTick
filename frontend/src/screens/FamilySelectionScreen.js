/**
 * FamilySelectionScreen — shown when no family is selected.
 *
 * Lets the user pick an existing family from the list or navigate to
 * FamilySetupScreen to create a brand-new one.
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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, radius, typography, shadow } from '../theme';

export default function FamilySelectionScreen() {
  const { families, loadingFamilies, hasLoadedFamilies, fetchFamilies, selectFamily } =
    useApp();
  const navigation = useNavigation();

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleJoin = async (family) => {
    await selectFamily(String(family.id));
    // AppContext.selectFamily also pre-fetches users — navigation handled by RootNavigator
  };

  const handleCreateNew = () => {
    navigation.navigate('FamilySetup');
  };

  const renderFamily = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, shadow.card]}
      onPress={() => handleJoin(item)}
      activeOpacity={0.8}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="home" size={24} color={colors.white} />
      </View>
      <View style={styles.info}>
        <Text style={styles.familyName}>{item.name}</Text>
        <Text style={styles.familyMeta}>Tap to join</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textDisabled} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Ionicons name="home" size={32} color={colors.white} />
        </View>
        <Text style={styles.appName}>HomeTick</Text>
        <Text style={styles.tagline}>Select your family</Text>
      </View>

      {loadingFamilies ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: spacing.xxl }}
        />
      ) : (
        <FlatList
          data={families}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderFamily}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            hasLoadedFamilies ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="people-outline"
                  size={48}
                  color={colors.textDisabled}
                />
                <Text style={styles.emptyText}>No families found.</Text>
                <Text style={styles.emptyHint}>
                  Create one to get started.
                </Text>
              </View>
            ) : null
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.createBtn} onPress={handleCreateNew} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>Create New Family</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  hero: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  appName: { fontSize: 32, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
  tagline: { ...typography.body, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs },

  list: { padding: spacing.lg, flexGrow: 1 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: { flex: 1 },
  familyName: { ...typography.h3 },
  familyMeta: { ...typography.bodySmall, marginTop: 2 },

  emptyState: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.sm },
  emptyText: { ...typography.h3, color: colors.textSecondary },
  emptyHint: { ...typography.body, color: colors.textDisabled },

  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  createBtnText: { ...typography.button, color: colors.white },
});
