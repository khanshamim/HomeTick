/**
 * FamilyOverviewScreen — shows each family member's task progress for today.
 *
 * Available to all users, but most useful for the admin (Dad).
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import UserCard from '../components/UserCard';
import { useApp } from '../context/AppContext';
import { getFamilyOverview } from '../services/api';
import { colors, spacing, typography } from '../theme';

export default function FamilyOverviewScreen() {
  const { currentUser, familyName, logout } = useApp();
  const navigation = useNavigation();
  const [overview, setOverview] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFamilyOverview();
      setOverview(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load family overview.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalDone = overview.reduce((acc, p) => acc + p.completed_tasks, 0);
  const totalAll = overview.reduce((acc, p) => acc + p.total_tasks, 0);

  return (
    <View style={styles.screen}>
      <Header
        title="Family Overview"
        subtitle={`${totalDone} / ${totalAll} tasks done today`}
        familyName={familyName}
        onLogout={logout}
      />

      {loading && overview.length === 0 ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: spacing.xxl }}
        />
      ) : (
        <FlatList
          data={overview}
          keyExtractor={(item) => item.user.id}
          renderItem={({ item }) => (
            <UserCard
              progress={item}
              onPress={() => navigation.navigate('MemberTasks', { member: item.user })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={load}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No data available yet.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
