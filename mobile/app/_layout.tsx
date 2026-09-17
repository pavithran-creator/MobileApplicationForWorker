import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileAuthProvider } from "../lib/auth";
import { MobileLangProvider } from "../lib/i18n";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MobileLangProvider>
        <MobileAuthProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)/login" options={{ presentation: "card" }} />
            <Stack.Screen name="(auth)/register" options={{ presentation: "card" }} />
            <Stack.Screen name="(customer)" options={{ headerShown: false }} />
            <Stack.Screen name="(worker)" options={{ headerShown: false }} />
            <Stack.Screen name="emergency" options={{ presentation: "modal", headerShown: false }} />
          </Stack>
        </MobileAuthProvider>
      </MobileLangProvider>
    </SafeAreaProvider>
  );
}
