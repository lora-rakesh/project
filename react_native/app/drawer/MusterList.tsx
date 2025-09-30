import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function MusterList({ navigation }: any) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text className="text-lg font-bold">📋 Muster List</Text>
      <TouchableOpacity
        className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
        onPress={() => navigation.navigate("MusterUpdate")}
      >
        <Text className="text-white">Go to Update</Text>
      </TouchableOpacity>
    </View>
  );
}
