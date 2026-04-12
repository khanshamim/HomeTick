/**
 * AppContext — global app state.
 *
 * Persists the selected user and family across sessions using AsyncStorage.
 *
 * Auth model:
 *   1. User picks a family → family_id stored in AsyncStorage
 *   2. User picks their profile → user stored + X-User-ID header set on the
 *      axios instance so all subsequent API calls are authenticated.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFamilies, getFamilyUsers, setAuthUser } from '../services/api';

const USER_KEY = '@hometick_current_user';
const FAMILY_KEY = '@hometick_family_id';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentFamilyId, setCurrentFamilyId] = useState(null);
  const [users, setUsers] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [hasLoadedFamilies, setHasLoadedFamilies] = useState(false);
  // True until AsyncStorage has resolved — prevents flash of wrong screen
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore persisted state on app launch
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(USER_KEY),
      AsyncStorage.getItem(FAMILY_KEY),
    ]).then(([rawUser, storedFamilyId]) => {
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser);
          setCurrentUser(user);
          setAuthUser(user.id); // Re-attach the auth header
        } catch (_) {}
      }
      if (storedFamilyId) {
        setCurrentFamilyId(storedFamilyId);
      }
      setIsInitializing(false);
    });
  }, []);

  const fetchFamilies = async () => {
    setLoadingFamilies(true);
    try {
      const data = await getFamilies();
      setFamilies(data);
      return data;
    } catch (err) {
      console.warn('Could not fetch families:', err.message);
      return [];
    } finally {
      setLoadingFamilies(false);
      setHasLoadedFamilies(true);
    }
  };

  const fetchUsersForFamily = async (familyId) => {
    const fid = familyId || currentFamilyId;
    if (!fid) return;
    setLoadingUsers(true);
    try {
      const data = await getFamilyUsers(fid);
      setUsers(data);
    } catch (err) {
      console.warn('Could not fetch users:', err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const selectFamily = async (familyId) => {
    setCurrentFamilyId(familyId);
    await AsyncStorage.setItem(FAMILY_KEY, familyId);
    await fetchUsersForFamily(familyId);
  };

  const selectUser = async (user) => {
    setCurrentUser(user);
    setAuthUser(user.id);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  /** Log out the current user but stay in the same family. */
  const logout = async () => {
    setCurrentUser(null);
    setAuthUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  };

  /** Log out completely — clears both user and family selection. */
  const logoutFamily = async () => {
    setCurrentUser(null);
    setCurrentFamilyId(null);
    setUsers([]);
    setFamilies([]);
    setAuthUser(null);
    setHasLoadedFamilies(false);
    await AsyncStorage.multiRemove([USER_KEY, FAMILY_KEY]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentFamilyId,
        users,
        families,
        loadingUsers,
        loadingFamilies,
        hasLoadedFamilies,
        isInitializing,
        fetchFamilies,
        fetchUsersForFamily,
        selectFamily,
        selectUser,
        logout,
        logoutFamily,
        setUsers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
