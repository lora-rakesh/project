import React from "react";
import { Stack } from "expo-router";

export default function MusterStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MusterList" />
      <Stack.Screen name="MusterUpdate" />
    </Stack>
  );
}