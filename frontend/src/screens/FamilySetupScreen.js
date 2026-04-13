/**
 * FamilySetupScreen — create a new family + initial members.
 *
 * Flow:
 *   1. POST /families/  → get family_id
 *   2. POST /users/ for each member (passing family_id)
 *   3. selectFamily(family_id) → triggers fetchUsersForFamily + navigation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createFamily, createUser } from '../services/api';
import { useApp } from '../context/AppContext';
import { colors, spacing, radius, typography, shadow } from '../theme';

export default function FamilySetupScreen() {
  const { selectFamily } = useApp();
  const [familyName, setFamilyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [members, setMembers] = useState([{ id: Date.now(), name: '' }]);
  const [saving, setSaving] = useState(false);

  const addMember = () =>
    setMembers((prev) => [...prev, { id: Date.now(), name: '' }]);

  const removeMember = (id) =>
    setMembers((prev) => prev.filter((m) => m.id !== id));

  const updateMember = (id, name) =>
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));

  const handleSubmit = async () => {
    const trimmedFamily = familyName.trim();
    const trimmedAdmin = adminName.trim();
    if (!trimmedFamily) {
      Alert.alert('Required', 'Please enter a family name.');
      return;
    }
    if (!trimmedAdmin) {
      Alert.alert('Required', 'Please enter the admin name.');
      return;
    }

    const validMembers = members.map((m) => m.name.trim()).filter(Boolean);

    setSaving(true);
    try {
      // 1. Create the family
      const family = await createFamily(trimmedFamily);
      const familyId = family.id;

      // 2. Create admin user in that family
      await createUser(trimmedAdmin, 'admin', familyId);

      // 3. Create remaining members
      for (const name of validMembers) {
        await createUser(name, 'member', familyId);
      }

      // 4. Select the family → fetches users → RootNavigator switches to UserSelectionScreen
      await selectFamily(String(familyId), family.name);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.detail || 'Could not create family. Check the backend is running.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Ionicons name="home" size={36} color={colors.white} />
            </View>
            <Text style={styles.appName}>HomeTick</Text>
            <Text style={styles.tagline}>Let's set up your family</Text>
          </View>

          {/* Family name section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Family Name</Text>
            <View style={[styles.inputRow, shadow.card]}>
              <View style={[styles.roleChip, { backgroundColor: colors.warning }]}>
                <Ionicons name="home" size={16} color={colors.white} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g. The Smiths"
                placeholderTextColor={colors.textDisabled}
                value={familyName}
                onChangeText={setFamilyName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Admin section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Admin (You)</Text>
            <View style={[styles.inputRow, shadow.card]}>
              <View style={[styles.roleChip, { backgroundColor: colors.primary }]}>
                <Ionicons name="shield-checkmark" size={16} color={colors.white} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={colors.textDisabled}
                value={adminName}
                onChangeText={setAdminName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Family members section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Family Members</Text>

            {members.map((member, index) => (
              <View key={member.id} style={[styles.inputRow, shadow.card]}>
                <View style={[styles.roleChip, { backgroundColor: colors.success }]}>
                  <Ionicons name="person" size={16} color={colors.white} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={`Member ${index + 1} name`}
                  placeholderTextColor={colors.textDisabled}
                  value={member.name}
                  onChangeText={(text) => updateMember(member.id, text)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {members.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeMember(member.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={22} color={colors.destructive} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addMemberBtn} onPress={addMember}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addMemberText}>Add another member</Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="rocket-outline" size={20} color={colors.white} />
                <Text style={styles.submitText}>Get Started</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },

  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  tagline: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },

  section: { marginBottom: spacing.lg },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  roleChip: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 6,
  },

  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  addMemberText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
  },
});
