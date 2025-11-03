import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { user, initializing } = useAuth();
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  // Protect routes based on auth state
  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to sign-in if not logged in
      router.replace('/(auth)/signin');
    } else if (user && inAuthGroup) {
      // Redirect to tabs if logged in and trying to access auth screens
      router.replace('/(tabs)');
    }
  }, [user, initializing, segments]);

  // Request SMS permissions on Android as soon as the app opens
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const requestSmsPermissions = async () => {
      try {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        ]);

        const readGranted =
          result[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED;
        const receiveGranted =
          result[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED;

        if (!readGranted) {
          Alert.alert(
            'Permission required',
            'To import bank SMS, please allow SMS permission in Settings > Apps > Permissions.',
          );
        }

        // It's okay if RECEIVE_SMS is denied; importing from inbox only needs READ_SMS.
      } catch (e) {
        // Non-fatal: continue app startup even if we fail to request
        console.warn('Failed to request SMS permissions', e);
      }
    };

    requestSmsPermissions();
  }, []);

  if (initializing) {
    return null; // Optionally render a splash/loading screen
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Request SMS permissions on Android as soon as the app opens
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const requestSmsPermissions = async () => {
      try {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        ]);

        const readGranted =
          result[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED;
        const receiveGranted =
          result[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED;

        if (!readGranted) {
          Alert.alert(
            'Permission required',
            'To import bank SMS, please allow SMS permission in Settings > Apps > Permissions.',
          );
        }

        // It's okay if RECEIVE_SMS is denied; importing from inbox only needs READ_SMS.
      } catch (e) {
        // Non-fatal: continue app startup even if we fail to request
        console.warn('Failed to request SMS permissions', e);
      }
    };

    requestSmsPermissions();
  }, []);

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
