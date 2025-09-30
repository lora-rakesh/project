// app/_layout.tsx
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Login or Landing page */}
        <Stack.Screen name="index" /> 
        {/* Drawer navigator group */}
        <Stack.Screen name="drawer" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
