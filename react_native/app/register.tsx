import { useState } from "react";
import { Text, TextInput, TouchableOpacity, Alert, View, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { registerEmployee } from "../hooks/api";

export default function Register() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("employee");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await registerEmployee({
        employee_id: employeeId,
        first_name: firstName,
        last_name: lastName,
        role,
        password,
      });
      Alert.alert("Success", response.data.message);
      router.replace("/"); // redirect to login page
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Registration failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: Platform.OS === "web" ? 300 : 16, // web padding
          paddingVertical: 20,
        }}
      >
        <Text className="text-3xl font-bold text-blue-600 text-center mb-8">
          Register
        </Text>

        <TextInput
          placeholder="Employee ID"
          value={employeeId}
          onChangeText={setEmployeeId}
          className="w-full bg-white px-4 py-3 rounded-lg shadow mb-4 text-gray-700"
        />
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          className="w-full bg-white px-4 py-3 rounded-lg shadow mb-4 text-gray-700"
        />
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          className="w-full bg-white px-4 py-3 rounded-lg shadow mb-4 text-gray-700"
        />
        <TextInput
          placeholder="Role (employee/hr/manager)"
          value={role}
          onChangeText={setRole}
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
          onPress={handleRegister}
          className="w-full bg-blue-600 py-3 rounded-lg shadow mb-4"
          disabled={loading}
        >
          <Text className="text-center text-white font-bold text-lg">
            {loading ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-2">
          <Text className="text-gray-600">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text className="text-blue-600 font-semibold">Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
