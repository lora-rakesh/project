import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function MusterUpdate({ navigation }: any) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold">✏️ Muster Update</Text>
      <TouchableOpacity
        className="mt-4 px-4 py-2 bg-green-600 rounded-lg"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-white">Back to List</Text>
      </TouchableOpacity>
    </View>
  );
}
