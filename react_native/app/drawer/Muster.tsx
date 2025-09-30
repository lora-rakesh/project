import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://127.0.0.1:8000/api";

type MusterItem = {
  id: number;
  employee: string;
  clock_in: string;
  clock_out: string;
  lunch_in: string;
  lunch_out: string;
  break_in: string;
  break_out: string;
};

export default function Muster() {
  const [musterList, setMusterList] = useState<MusterItem[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<MusterItem | null>(null);
  const [showUpdate, setShowUpdate] = useState(false);

  const fetchMuster = async () => {
    try {
      const tokenString = await AsyncStorage.getItem("userToken");
      const tokenData = tokenString ? JSON.parse(tokenString) : null;
      const token = tokenData?.access;

      const res = await axios.get(`${API_URL}/muster/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMusterList(res.data);
      if (!selectedEmployee && res.data.length) setSelectedEmployee(res.data[0]);
    } catch (err) {
      console.log("Failed to fetch muster:", err);
    }
  };

  useEffect(() => {
    fetchMuster();
    const interval = setInterval(fetchMuster, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-row flex-1 bg-gray-50">
      {/* Left Pane - Muster List */}
      <ScrollView className="w-64 bg-white p-4 border-r border-gray-300">
        <Text className="text-lg font-bold mb-4">Employees</Text>
        {musterList.map((emp) => (
          <TouchableOpacity
            key={emp.id}
            className={`p-2 mb-2 rounded ${
              selectedEmployee?.id === emp.id ? "bg-blue-100" : "bg-gray-100"
            }`}
            onPress={() => {
              setSelectedEmployee(emp);
              setShowUpdate(false);
            }}
          >
            <Text className="text-gray-800">{emp.employee}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Middle Pane - Muster Details */}
      <ScrollView className="flex-1 p-4">
        <Text className="text-lg font-bold mb-4">Muster Details</Text>
        {selectedEmployee ? (
          <View className="bg-white p-4 rounded shadow">
            <Text>Employee: {selectedEmployee.employee}</Text>
            <Text>Clock In: {selectedEmployee.clock_in || "-"}</Text>
            <Text>Clock Out: {selectedEmployee.clock_out || "-"}</Text>
            <Text>Lunch In: {selectedEmployee.lunch_in || "-"}</Text>
            <Text>Lunch Out: {selectedEmployee.lunch_out || "-"}</Text>
            <Text>Break In: {selectedEmployee.break_in || "-"}</Text>
            <Text>Break Out: {selectedEmployee.break_out || "-"}</Text>

            <TouchableOpacity
              className="mt-4 bg-blue-500 p-2 rounded"
              onPress={() => setShowUpdate(true)}
            >
              <Text className="text-white text-center">Update</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text>Select an employee to see details</Text>
        )}
      </ScrollView>

      {/* Right Pane - Update Panel (simulating drawer) */}
      {showUpdate && selectedEmployee && (
        <View className="w-72 bg-white p-4 border-l border-gray-300 shadow-lg">
          <Text className="text-lg font-bold mb-4">Update Muster</Text>
          <Text className="mb-2">Employee: {selectedEmployee.employee}</Text>
          {/* 🔹 Replace with inputs for updating */}
          <TouchableOpacity
            className="bg-green-500 p-2 rounded mb-2"
            onPress={() => alert("Clock In Updated")}
          >
            <Text className="text-white text-center">Clock In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 p-2 rounded mb-2"
            onPress={() => alert("Clock Out Updated")}
          >
            <Text className="text-white text-center">Clock Out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-500 p-2 rounded"
            onPress={() => setShowUpdate(false)}
          >
            <Text className="text-white text-center">Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
