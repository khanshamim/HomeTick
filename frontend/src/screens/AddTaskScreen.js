/**
 * AddTaskScreen — admin-only form to create and assign tasks.
 *
 * Fields:
 *   - Task title (text input)
 *   - Assign to (user picker)
 *   - Daily toggle
 *   - Optional due time (HH:MM)
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { createTask } from '../services/api';
import Header from '../components/Header';
import { colors, spacing, radius, typography, shadow } from '../theme';

export default function AddTaskScreen() {
  const { currentUser, familyName, users, fetchUsersForFamily, currentFamilyId, logout } = useApp();

  // If the users list is empty (e.g. app restored from cold start and user landed directly
  // on this tab), fetch the family's member list so the assignee picker is populated.
  useEffect(() => {
    if (users.length === 0 && currentFamilyId) {
      fetchUsersForFamily(currentFamilyId);
    }
  }, [currentFamilyId]);

  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState(null);
  const [isDaily, setIsDaily] = useState(true);
  const [dueTime, setDueTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Guard: non-admin users should not see this screen (tab is hidden in App.js)
  if (currentUser?.role !== 'admin') {
    return (
      <View style={styles.screen}>
        <Header title="Add Task" onLogout={logout} />
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textDisabled} />
          <Text style={styles.guardText}>Only admins can create tasks.</Text>
        </View>
      </View>
    );
  }

  const validate = () => {
    if (!title.trim()) { Alert.alert('Validation', 'Please enter a task title.'); return false; }
    if (!assignedTo) { Alert.alert('Validation', 'Please select a family member.'); return false; }
    if (dueTime && !/^\d{2}:\d{2}$/.test(dueTime)) {
      Alert.alert('Validation', 'Due time must be in HH:MM format (e.g. 08:30).');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        assigned_to: assignedTo,
        is_daily: isDaily,
        due_time: dueTime || null,
      });
      Alert.alert('Success', 'Task created!');
      setTitle('');
      setAssignedTo(null);
      setIsDaily(true);
      setDueTime('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Add Task" subtitle="Create & assign a new task" familyName={familyName} onLogout={logout} />

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <Label text="Task Title" />
        <TextInput
          style={styles.input}
          placeholder="e.g. Take out the bins"
          placeholderTextColor={colors.textDisabled}
          value={title}
          onChangeText={setTitle}
          maxLength={120}
        />

        {/* Assign to */}
        <Label text="Assign To" />
        <View style={styles.userGrid}>
          {users.map((u) => (
            <TouchableOpacity
              key={u.id}
              style={[styles.userChip, assignedTo === u.id && styles.userChipActive]}
              onPress={() => setAssignedTo(u.id)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.userChipText,
                  assignedTo === u.id && styles.userChipTextActive,
                ]}
              >
                {u.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily toggle */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Repeats Daily</Text>
            <Text style={styles.rowHint}>Show in checklist every day</Text>
          </View>
          <Switch
            value={isDaily}
            onValueChange={setIsDaily}
            trackColor={{ false: colors.switchBackground, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {/* Due time */}
        <Label text="Due Time (optional)" />
        <TextInput
          style={styles.input}
          placeholder="HH:MM  e.g. 08:30"
          placeholderTextColor={colors.textDisabled}
          value={dueTime}
          onChangeText={setDueTime}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color={colors.white} />
              <Text style={styles.submitText}>Create Task</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ text }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  guardText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
  form: { padding: spacing.lg, paddingBottom: spacing.xxl },

  label: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    borderWidth: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...typography.body,
    color: colors.text,
  },

  userGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  userChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surface,
  },
  userChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  userChipText: { ...typography.body, color: colors.textSecondary },
  userChipTextActive: { color: colors.white, fontWeight: '600' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    ...shadow.card,
  },
  rowLabel: { ...typography.body, fontWeight: '600' },
  rowHint: { ...typography.bodySmall, marginTop: 2 },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { ...typography.button, color: colors.white },
});
