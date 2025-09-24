import { useState } from "react";
import { SafeAreaView, Text, TextInput, ScrollView, TouchableOpacity, View, Alert } from "react-native";
import axios from "axios";
import "../global.css";

export default function Dashboard() {
  const API_BASE = "http://127.0.0.1:8000/api"; 

  const [user, setUser] = useState("");
  const [date, setDate] = useState("");
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [breakIn, setBreakIn] = useState("");
  const [lunchIn, setLunchIn] = useState("");
  const [lunchOut, setLunchOut] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    if (!user || !date) {
      Alert.alert("Validation Error", "Please fill user and date");
      return;
    }

    setLoading(true);
    try {
      // 1. Register / Update employee
      await axios.post(`${API_BASE}/register-employee/`, {
        name: user,
        date: date,
      });

      // 2. Clock In
      if (clockIn) {
        await axios.post(`${API_BASE}/clock_in/`, { employee: user, time: clockIn });
      }

      // 3. Clock Out
      if (clockOut) {
        await axios.post(`${API_BASE}/clock_out/`, { employee: user, time: clockOut });
      }

      // 4. Break In
      if (breakIn) {
        await axios.post(`${API_BASE}/break_in/`, { employee: user, time: breakIn });
      }

      // 5. Lunch In
      if (lunchIn) {
        await axios.post(`${API_BASE}/lunch_in/`, { employee: user, time: lunchIn });
      }

      // 6. Lunch Out
      if (lunchOut) {
        await axios.post(`${API_BASE}/lunch_out/`, { employee: user, time: lunchOut });
      }

      Alert.alert("Success", "Attendance saved successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-white px-6 pt-10">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Title */}
        <Text className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Employee Dashboard
        </Text>

        {/* Card */}
        <View className="bg-white shadow-md rounded-2xl p-5 mb-6">
          
          {/* User */}
          <TextInput
            placeholder="User Name"
            value={user}
            onChangeText={setUser}
            className="w-full bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 mb-4 text-gray-700"
          />

          {/* Date */}
          <TextInput
            placeholder="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            className="w-full bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 mb-4 text-gray-700"
          />

          {/* Clock In / Clock Out */}
          <View className="flex-row justify-between mb-4">
            <TextInput
              placeholder="Clock In (HH:MM)"
              value={clockIn}
              onChangeText={setClockIn}
              className="w-[48%] bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-gray-700"
            />
            <TextInput
              placeholder="Clock Out (HH:MM)"
              value={clockOut}
              onChangeText={setClockOut}
              className="w-[48%] bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-gray-700"
            />
          </View>

          {/* Break In */}
          <TextInput
            placeholder="Break In (HH:MM)"
            value={breakIn}
            onChangeText={setBreakIn}
            className="w-full bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 mb-4 text-gray-700"
          />

          {/* Lunch In / Lunch Out */}
          <View className="flex-row justify-between mb-4">
            <TextInput
              placeholder="Lunch In (HH:MM)"
              value={lunchIn}
              onChangeText={setLunchIn}
              className="w-[48%] bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-gray-700"
            />
            <TextInput
              placeholder="Lunch Out (HH:MM)"
              value={lunchOut}
              onChangeText={setLunchOut}
              className="w-[48%] bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-gray-700"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="w-40 bg-blue-600 py-3 rounded-xl shadow-lg active:bg-blue-700 active:scale-95 transition-transform duration-150 self-center"
          disabled={loading}
        >
          <Text className="text-center text-white font-bold text-base tracking-wide">
            {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
