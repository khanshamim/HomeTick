/**
 * App.js — Root of the HomeTick React Native app.
 *
 * Navigation structure:
 *   AuthStack (before a user is selected)
 *     └─ UserSelectionScreen
 *
 *   MainTabs (after user selection)
 *     ├─ HomeScreen        (checklist)
 *     ├─ AddTaskScreen     (admin only — still rendered for all; guard inside)
 *     └─ FamilyOverviewScreen
 */

import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from './src/context/AppContext';
import UserSelectionScreen from './src/screens/UserSelectionScreen';
import FamilySetupScreen from './src/screens/FamilySetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import FamilyOverviewScreen from './src/screens/FamilyOverviewScreen';
import MemberTasksScreen from './src/screens/MemberTasksScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'checkmark-circle' : 'checkmark-circle-outline',
            'Add Task': focused ? 'add-circle' : 'add-circle-outline',
            Family: focused ? 'people' : 'people-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'My Tasks' }} />
      {isAdmin && (
        <Tab.Screen name="Add Task" component={AddTaskScreen} />
      )}
      <Tab.Screen name="Family" component={FamilyOverviewScreen} options={{ title: 'Family' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { currentUser, users, hasLoaded, isInitializing, fetchUsers } = useApp();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Wait for AsyncStorage to restore currentUser before rendering anything
  // — prevents flash of UserSelectionScreen for already-logged-in users
  if (isInitializing) return null;

  const needsSetup = hasLoaded && users.length === 0 && !currentUser;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="MemberTasks" component={MemberTasksScreen} />
          </>
        ) : needsSetup ? (
          <Stack.Screen name="FamilySetup" component={FamilySetupScreen} />
        ) : (
          <Stack.Screen name="UserSelection" component={UserSelectionScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AppProvider>
  );
}
