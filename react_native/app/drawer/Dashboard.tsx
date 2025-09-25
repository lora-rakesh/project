// app/drawer/Dashboard.tsx
import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView } from "react-native";

export default function Dashboard() {
  const boxes = [
    { title: "Work", buttons: ["Clock In", "Clock Out"] },
    { title: "Lunch", buttons: ["Lunch In", "Lunch Out"] },
    { title: "Break", buttons: ["Break In", "Break Out"] },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="flex-row flex-wrap justify-between">
          {boxes.map((box, i) => (
            <View
              key={i}
              className="w-[48%] h-40 bg-white rounded-lg shadow p-4 mb-4 justify-center"
            >
              <Text className="font-bold text-lg mb-3 text-center">{box.title}</Text>
              <View className="flex-row justify-center space-x-3">
                {box.buttons.map((btn, j) => (
                  <TouchableOpacity
                    key={j}
                    onPress={() => console.log(`Pressed ${btn}`)}
                    activeOpacity={0.8}
                  >
                    <View className="bg-blue-600 px-3 py-2 rounded-lg">
                      <Text className="text-white font-semibold">{btn}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
