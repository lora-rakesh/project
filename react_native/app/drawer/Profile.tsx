import React, { useState } from "react";
import { SafeAreaView, View, Text, Image, TouchableOpacity, Modal, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { updateProfile } from "../../hooks/api"; // backend API for profile update
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function Profile() {
  const navigation = useNavigation<any>();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Update profile image
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const formData = new FormData();
      formData.append("image", {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);

      try {
        await updateProfile(formData); // token handled internally
        setProfileImage(result.assets[0].uri);
        Toast.show({ type: "success", text1: "Profile updated!" });
      } catch (err) {
        Toast.show({ type: "error", text1: "Update failed" });
      }
    }
    setDropdownVisible(false);
  };

  // Logout (frontend only)
  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken"); // remove token
    navigation.reset({ index: 0, routes: [{ name: "Login" }] }); // navigate to Login
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-6">
      <Text className="text-2xl font-bold mb-6">Profile</Text>

      <View className="items-center">
        <TouchableOpacity onPress={() => setDropdownVisible(true)}>
          <Image
            source={{ uri: profileImage || "https://i.pravatar.cc/150?img=3" }}
            className="w-32 h-32 rounded-full mb-4"
          />
        </TouchableOpacity>
        <Text className="text-gray-500">Tap image for options</Text>
      </View>

      {/* Dropdown Modal */}
      <Modal transparent visible={dropdownVisible} animationType="fade">
        <Pressable
          className="flex-1 justify-center items-center bg-black/40"
          onPress={() => setDropdownVisible(false)}
        >
          <View className="bg-white rounded-lg p-4 w-60">
            <TouchableOpacity className="py-2" onPress={handlePickImage}>
              <Text className="text-blue-600 font-semibold text-center">Update Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-2" onPress={handleLogout}>
              <Text className="text-red-600 font-semibold text-center">Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Toast position="bottom" bottomOffset={50} />
    </SafeAreaView>
  );
}
