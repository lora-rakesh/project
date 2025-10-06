import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import "../global.css";

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
    <SafeAreaView className="flex-1 justify-center items-center bg-gradient-to-br from-blue-100 via-blue-50 to-white px-6">
      <View className="w-full items-center" style={{ maxWidth: Platform.OS === "web" ? 400 : "100%" }}>
        
        {/* <Text className="text-4xl font-extrabold text-blue-700 mb-8 tracking-wide text-center">
          Welcome Back!
        </Text> */}

        <Text className="text-lg font-light text-gray-700 mb-6 tracking-tight text-center">
          ✨ Let’s get you back on track 🚀
        </Text>

        <TextInput
          placeholder="Employee ID"
          value={employeeId}
          onChangeText={setEmployeeId}
          className="w-72 bg-white px-4 py-3 rounded-2xl shadow-md border border-gray-200 mb-4 text-gray-700 focus:border-blue-400"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="w-72 bg-white px-4 py-3 rounded-2xl shadow-md border border-gray-200 mb-6 text-gray-700 focus:border-blue-400"
        />

        <TouchableOpacity
          onPress={handleLogin}
          className="w-40 bg-blue-600 py-3 rounded-xl shadow-lg active:bg-blue-700 active:scale-95 transition-transform duration-150 self-center"
        >
          <Text className="text-center text-white font-bold text-base tracking-wide">
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
