import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  View,
  Platform,
} from "react-native";
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

  // Track focus state
  const [focusedInput, setFocusedInput] = useState<"employeeId" | "password" | null>(null);

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
          maxWidth: Platform.OS === "web" ? 400 : "100%", // ✅ mobile full width, web max 400px
          width: "100%",
        }}
      >
        <Text className="text-2xl font-bold text-[#007bff] mb-6 text-center">
          Welcome Back!
        </Text>

        {/* Employee ID Input */}
        <View
          className={`w-full px-3 py-2 rounded-lg shadow mb-3 ${
            focusedInput === "employeeId"
              ? "border-2 border-blue-500"
              : "border border-gray-300"
          } bg-white`}
        >
          <TextInput
            placeholder="Employee ID"
            value={employeeId}
            onChangeText={setEmployeeId}
            className="text-gray-700"
            onFocus={() => setFocusedInput("employeeId")}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        {/* Password Input */}
        <View
          className={`w-full px-3 py-2 rounded-lg shadow mb-4 ${
            focusedInput === "password"
              ? "border-2 border-blue-500"
              : "border border-gray-300"
          } bg-white`}
        >
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="text-gray-700"
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        {/* Login button */}
        <TouchableOpacity
          onPress={handleLogin}
          className="w-full bg-[#007bff] py-3 rounded-lg shadow mb-4"
          disabled={loading}
        >
          <Text className="text-center text-white font-bold text-lg">
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
