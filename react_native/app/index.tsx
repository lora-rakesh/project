// app/index.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import '../global.css'
export default function Login() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!employeeId || !password) return;
    // Navigate to drawer wrapper after login
    router.replace("/drawer/DashboardWrapper");
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-blue-50 px-3">
      <View className="w-full" style={{ maxWidth: Platform.OS === "web" ? 400 : "100%" }}>
        <Text className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Welcome Back!
        </Text>

        <View className="w-full px-3 py-2 rounded-lg shadow mb-3 bg-white border border-gray-300">
          <TextInput
            placeholder="Employee ID"
            value={employeeId}
            onChangeText={setEmployeeId}
            className="text-gray-700"
          />
        </View>

        <View className="w-full px-3 py-2 rounded-lg shadow mb-4 bg-white border border-gray-300">
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="text-gray-700"
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          className="w-full bg-blue-600 py-3 rounded-lg shadow mb-4"
        >
          <Text className="text-center text-white font-bold text-lg">Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
