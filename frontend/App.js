/**
 * App.js — Root of the HomeTick React Native app.
 *
 * Navigation structure:
 *   No family selected  → FamilySelectionScreen
 *     └─ FamilySetupScreen  (create new family)
 *
 *   Family selected, no user → UserSelectionScreen
 *
 *   User selected → MainTabs
 *     ├─ HomeScreen        (checklist)
 *     ├─ AddTaskScreen     (admin only)
 *     └─ FamilyOverviewScreen
 *       └─ MemberTasksScreen  (pushed from overview)
 */

import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from './src/context/AppContext';
import SplashScreen from './src/screens/SplashScreen';
import FamilySelectionScreen from './src/screens/FamilySelectionScreen';
import FamilySetupScreen from './src/screens/FamilySetupScreen';
import JoinFamilyScreen from './src/screens/JoinFamilyScreen';
import UserSelectionScreen from './src/screens/UserSelectionScreen';
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
  const { currentUser, currentFamilyId, isInitializing } = useApp();

  // Wait for AsyncStorage to restore state before rendering — prevents flicker
  if (isInitializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? (
          // Authenticated: show main app
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="MemberTasks" component={MemberTasksScreen} />
          </>
        ) : currentFamilyId ? (
          // Family chosen but no user picked yet
          <Stack.Screen name="UserSelection" component={UserSelectionScreen} />
        ) : (
          // No family chosen — show family picker, join, and setup flow
          <>
            <Stack.Screen name="FamilySelection" component={FamilySelectionScreen} />
            <Stack.Screen name="FamilySetup" component={FamilySetupScreen} />
            <Stack.Screen name="JoinFamily" component={JoinFamilyScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <>
        <StatusBar style="dark" />
        <SplashScreen />
      </>
    );
  }

  return (
    <AppProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AppProvider>
  );
}
