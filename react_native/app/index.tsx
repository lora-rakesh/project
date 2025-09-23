import { useState } from "react";
import { Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
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
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        employee_id: employeeId,
        password: password,
      });

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
    <SafeAreaView className="flex-1 justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 px-6">
      <Text className="text-3xl font-bold text-blue-600 mb-8">Welcome Back!</Text>

      <TextInput
        placeholder="Employee ID"
        value={employeeId}
        onChangeText={setEmployeeId}
        className="w-full bg-white px-4 py-3 rounded-lg shadow mb-4 text-gray-700"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="w-full bg-white px-4 py-3 rounded-lg shadow mb-6 text-gray-700"
      />

      <TouchableOpacity
        onPress={handleLogin}
        className="w-full bg-blue-600 py-3 rounded-lg shadow"
        disabled={loading}
      >
        <Text className="text-center text-white font-bold text-lg">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
