import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, Image, TouchableOpacity, Modal, Pressable, TextInput, Alert, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { updateProfile } from "../../hooks/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const navigation = useNavigation<any>();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  // Load current profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const tokenString = await AsyncStorage.getItem("userToken");
      const tokenData = tokenString ? JSON.parse(tokenString) : null;
      
      // You might need to add an API to get current user profile
      // For now, we'll set empty form fields
      // setFirstName(userData.first_name);
      // setLastName(userData.last_name);
      // etc...
    } catch (error) {
      console.log("Error loading profile data:", error);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const formData = new FormData();
      formData.append("profile_photo", {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);

      try {
        setLoading(true);
        await updateProfile(formData);
        setProfileImage(result.assets[0].uri);
        Toast.show({ type: "success", text1: "Profile photo updated!" });
      } catch (err) {
        Toast.show({ type: "error", text1: "Photo update failed" });
      } finally {
        setLoading(false);
      }
    }
    setDropdownVisible(false);
  };

  const handleUpdateProfile = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert("Error", "Please fill required fields");
      return;
    }

    const profileData: any = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      dob: dob,
      gender: gender,
      nationality: nationality,
      address: address,
    };

    if (password) {
      profileData.password = password;
    }

    try {
      setLoading(true);
      await updateProfile(profileData);
      setEditModalVisible(false);
      setPassword("");
      Toast.show({ type: "success", text1: "Profile updated successfully!" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Profile update failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const openEditModal = () => {
    setEditModalVisible(true);
    setDropdownVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-6">
      <Text className="text-2xl font-bold mb-6">Profile</Text>

      <ScrollView>
        {/* Profile Image Section */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={() => setDropdownVisible(true)}>
            <Image
              source={{ uri: profileImage || "https://i.pravatar.cc/150?img=3" }}
              className="w-32 h-32 rounded-full mb-4"
            />
          </TouchableOpacity>
          <Text className="text-gray-500">Tap image for options</Text>
        </View>

        {/* Profile Info Summary */}
        <View className="bg-white rounded-lg p-6 shadow-md mb-6">
          <Text className="text-lg font-semibold mb-4">Profile Information</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Name:</Text>
              <Text className="font-semibold">{firstName || "Not set"} {lastName || ""}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Email:</Text>
              <Text className="font-semibold">{email || "Not set"}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Phone:</Text>
              <Text className="font-semibold">{phone || "Not set"}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Gender:</Text>
              <Text className="font-semibold">{gender || "Not set"}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={openEditModal}
            className="bg-blue-600 py-3 rounded-lg mt-6"
          >
            <Text className="text-white text-center font-semibold">Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Options Dropdown */}
      <Modal transparent visible={dropdownVisible} animationType="fade">
        <Pressable
          className="flex-1 justify-center items-center bg-black/40"
          onPress={() => setDropdownVisible(false)}
        >
          <View className="bg-white rounded-lg p-4 w-60">
            <TouchableOpacity className="py-2" onPress={handlePickImage}>
              <Text className="text-blue-600 font-semibold text-center">Update Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-2" onPress={openEditModal}>
              <Text className="text-blue-600 font-semibold text-center">Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-2" onPress={handleLogout}>
              <Text className="text-red-600 font-semibold text-center">Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-11/12 max-w-md max-h-[90%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-[500px]">
              <TextInput
                placeholder="First Name *"
                value={firstName}
                onChangeText={setFirstName}
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Last Name *"
                value={lastName}
                onChangeText={setLastName}
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Email *"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Date of Birth (YYYY-MM-DD)"
                value={dob}
                onChangeText={setDob}
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Gender"
                value={gender}
                onChangeText={setGender}
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Nationality"
                value={nationality}
                onChangeText={setNationality}
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-lg p-3 mb-6"
              />

              <TextInput
                placeholder="New Password (leave empty to keep current)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="border border-gray-300 rounded-lg p-3 mb-6"
              />

              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={loading}
                className="bg-blue-600 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold text-lg">
                  {loading ? "Updating..." : "Update Profile"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Toast position="bottom" bottomOffset={50} />
    </SafeAreaView>
  );
}