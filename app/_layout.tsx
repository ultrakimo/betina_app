import { I18nProvider } from '../src/lib/i18n';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
  Archivo_900Black_Italic,
  useFonts,
} from '@expo-google-fonts/archivo';
import { Colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Belt-and-suspenders web font loading: app/+html.tsx injects these @font-face
// into <head> for the static export (before paint); this runtime injection
// covers the dev server (where +html.tsx isn't applied). Same Google CDN URLs,
// so the browser de-dupes. expo-font's own web injection is disabled below.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const id = 'betina-google-fonts';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @font-face { font-family: 'Archivo_400Regular'; font-style: normal; font-weight: 400; font-display: swap; src: url('https://fonts.gstatic.com/s/archivo/v25/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTNDNp8A.ttf') format('truetype'); }
      @font-face { font-family: 'Archivo_500Medium'; font-style: normal; font-weight: 500; font-display: swap; src: url('https://fonts.gstatic.com/s/archivo/v25/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTBjNp8A.ttf') format('truetype'); }
      @font-face { font-family: 'Archivo_600SemiBold'; font-style: normal; font-weight: 600; font-display: swap; src: url('https://fonts.gstatic.com/s/archivo/v25/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTT6jRp8A.ttf') format('truetype'); }
      @font-face { font-family: 'Archivo_700Bold'; font-style: normal; font-weight: 700; font-display: swap; src: url('https://fonts.gstatic.com/s/archivo/v25/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTT0zRp8A.ttf') format('truetype'); }
      @font-face { font-family: 'Archivo_800ExtraBold'; font-style: normal; font-weight: 800; font-display: swap; src: url('https://fonts.gstatic.com/s/archivo/v25/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTtDRp8A.ttf') format('truetype'); }
      @font-face { font-family: 'Archivo_900Black'; font-style: normal; font-weight: 900; font-display: swap; src: url('https://fonts.gstatic.com/s/archivo/v25/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTnTRp8A.ttf') format('truetype'); }
      @font-face { font-family: 'Archivo_900Black_Italic'; font-style: italic; font-weight: 900; font-display: swap; src: url('https://fonts.gstatic.com/s/archivo/v25/k3k8o8UDI-1M0wlSfdzyIEkpwTM29hr-8mTYIRyOSVz60_PG_HAotBds.ttf') format('truetype'); }
    `;
    document.head.appendChild(style);
  }
}

export default function RootLayout() {
  // On web the fonts are provided by the @font-face in app/+html.tsx (Google
  // CDN). Skip expo-font's injection there so it can't add a competing
  // @font-face pointing at export assets that 404 on the deployed site.
  const [fontsLoaded] = useFonts(
    Platform.OS === 'web'
      ? {}
      : {
          Archivo_400Regular,
          Archivo_500Medium,
          Archivo_600SemiBold,
          Archivo_700Bold,
          Archivo_800ExtraBold,
          Archivo_900Black,
          Archivo_900Black_Italic,
        },
  );

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded && Platform.OS !== 'web') return null;

  return (
    <I18nProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="celebration" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        <Stack.Screen name="article" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      </Stack>
    </I18nProvider>
  );
}
