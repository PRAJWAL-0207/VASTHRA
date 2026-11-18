import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { getUserProfile } from '../services/storage';

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function checkFirstLaunch() {
      try {
        const profile = await getUserProfile();
        if (!profile.onboardingCompleted) {
          // Push to onboarding
          setTimeout(() => {
            router.replace('/onboarding');
          }, 100);
        }
      } catch (e) {
        console.warn('Profile read err:', e);
      } finally {
        setIsReady(true);
      }
    }
    checkFirstLaunch();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="generator" options={{ headerShown: false }} />
        <Stack.Screen name="stylist" options={{ headerShown: false }} />
        <Stack.Screen name="saved" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
