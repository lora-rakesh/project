import { useState } from "react";
import { Text, TextInput, TouchableOpacity, Alert, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from "../hooks/api";
import "../global.css";

export default function Login() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!employeeId || !password) {
      Alert.alert("Error", "Please enter Employee ID and Password");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(employeeId, password);
      const data = response.data;

      if (data.message === "Login successful") {
        await AsyncStorage.setItem("userToken", JSON.stringify(data));
        router.replace("/Dashboard");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (err) {
      Alert.alert("Error", "Server not reachable");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-blue-50 px-3">
      <View
        className="w-full"
        style={{
          maxWidth: Platform.OS === "web" ? 400 : "100%", // max width on web
          width: "100%",
        }}
      >
        <Text className="text-2xl font-bold text-[#007bff] mb-6 text-center">Welcome Back!</Text>

        <TextInput
          placeholder="Employee ID"
          value={employeeId}
          onChangeText={setEmployeeId}
          className="w-full bg-white px-3 py-2 rounded-lg shadow mb-3 text-gray-700"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="w-full bg-white px-3 py-2 rounded-lg shadow mb-4 text-gray-700"
        />

        <TouchableOpacity
          onPress={handleLogin}
          className="w-full bg-[#007bff] py-3 rounded-lg shadow mb-4"
          disabled={loading}
        >
          <Text className="text-center text-white font-bold text-lg">
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-2">
          <Text className="text-gray-600">Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text className="text-[#007bff] font-semibold">Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
