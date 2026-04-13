/**
 * JoinFamilyScreen — lets a new member join an existing family via invite code.
 *
 * Flow:
 *   1. Enter the 6-char invite code (shared by an admin)
 *   2. Enter your name
 *   3. POST /families/join → get user_id, family_id, family_name
 *   4. Store family + user in context → RootNavigator navigates to MainTabs
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { joinFamily } from '../services/api';
import { useApp } from '../context/AppContext';
import { colors, spacing, radius, typography, shadow } from '../theme';

export default function JoinFamilyScreen() {
  const navigation = useNavigation();
  const { selectFamily, selectUser } = useApp();

  const [inviteCode, setInviteCode] = useState('');
  const [name, setName]             = useState('');
  const [joining, setJoining]       = useState(false);

  const nameRef = useRef(null);

  const handleJoin = async () => {
    const code      = inviteCode.trim().toUpperCase();
    const cleanName = name.trim();

    if (!code) {
      Alert.alert('Required', 'Please enter the invite code.');
      return;
    }
    if (code.length < 4) {
      Alert.alert('Invalid Code', 'Invite codes are at least 4 characters.');
      return;
    }
    if (!cleanName) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }

    setJoining(true);
    try {
      // POST /families/join → { user_id, family_id, family_name, name, role }
      const data = await joinFamily(code, cleanName);

      // 1. Store family context (id + name)
      await selectFamily(String(data.family_id), data.family_name);

      // 2. Store user context — shape matches what UserSelectionScreen stores
      await selectUser({
        id:          data.user_id,
        name:        data.name,
        role:        data.role,
        family_id:   data.family_id,
        family_name: data.family_name,
      });

      // RootNavigator detects currentUser != null → switches to MainTabs automatically
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 404) {
        Alert.alert('Invalid Code', detail || 'No family found with that invite code.');
      } else if (err.response?.status === 409) {
        Alert.alert('Name Taken', detail || 'That name is already used in this family. Try a different name.');
      } else {
        Alert.alert('Error', detail || 'Could not join family. Check the backend is running.');
      }
    } finally {
      setJoining(false);
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
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.iconCircle}>
              <Ionicons name="key" size={36} color={colors.white} />
            </View>
            <Text style={styles.heroTitle}>Join a Family</Text>
            <Text style={styles.heroSub}>
              Enter the invite code shared by your family admin
            </Text>
          </View>

          {/* Invite Code */}
          <View style={styles.field}>
            <Text style={styles.label}>Invite Code</Text>
            <TextInput
              style={[styles.codeInput, shadow.card]}
              placeholder="e.g. ABC123"
              placeholderTextColor={colors.textDisabled}
              value={inviteCode}
              onChangeText={(t) => setInviteCode(t.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
              returnKeyType="next"
              onSubmitEditing={() => nameRef.current?.focus()}
            />
          </View>

          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              ref={nameRef}
              style={[styles.input, shadow.card]}
              placeholder="e.g. Alice"
              placeholderTextColor={colors.textDisabled}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={handleJoin}
            />
            <Text style={styles.hint}>
              This name will be visible to all family members.
            </Text>
          </View>

          {/* Join button */}
          <TouchableOpacity
            style={[styles.joinBtn, joining && styles.joinBtnDisabled]}
            onPress={handleJoin}
            disabled={joining}
            activeOpacity={0.85}
          >
            {joining ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="enter-outline" size={20} color={colors.white} />
                <Text style={styles.joinBtnText}>Join Family</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: spacing.lg,
  },
  backText: { ...typography.body, color: colors.primary, fontWeight: '600' },

  hero: { alignItems: 'center', marginBottom: spacing.xl },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: { ...typography.h1, textAlign: 'center' },
  heroSub:   {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 22,
  },

  field: { marginBottom: spacing.md },
  label: { ...typography.label, marginBottom: spacing.xs },
  hint:  { ...typography.bodySmall, color: colors.textDisabled, marginTop: spacing.xs },

  codeInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    borderWidth: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 6,
    color: colors.primary,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    borderWidth: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...typography.body,
    color: colors.text,
  },

  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.lg,
  },
  joinBtnDisabled: { opacity: 0.6 },
  joinBtnText: { ...typography.button, color: colors.white, fontSize: 16 },
});
