import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../../src/theme';

export default function AuthLayout() {
  const router = useRouter();

  // On mount, check if device token exists and route to device-check
  useEffect(() => {
    checkAndRouteToDeviceCheck();
  }, []);

  const checkAndRouteToDeviceCheck = async () => {
    try {
      const token = await SecureStore.getItemAsync('betina_device_token');
      if (token) {
        // Device token exists, navigate to device-check instead of login
        router.replace('/(auth)/device-check');
      }
    } catch (e) {
      // Ignore errors, proceed normally
    }
  };

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
