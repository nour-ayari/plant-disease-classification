import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initHistory } from '@/utils/history';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function RootLayout() {
  useEffect(() => { initHistory(); }, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
