/**
 * useNotifications — handles FCM device registration.
 *
 * On mount this hook:
 *   1. Requests notification permission from the OS
 *   2. Gets the Expo push token
 *   3. Sends the token to the backend (authenticated via X-User-ID header)
 *   4. Sets up foreground notification handler
 */

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { updateFCMToken } from '../services/api';

// Display notifications while the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications(userId) {
  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    if (!userId) return;

    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Notification received]', notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[Notification tapped]', response);
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId]);
}

async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device.');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permission not granted.');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'HomeTick Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    console.log('[FCM Token]', token);
    // userId is now taken from the X-User-ID header set in AppContext
    await updateFCMToken(token);
  } catch (err) {
    console.warn('Could not register FCM token:', err.message);
  }
}
