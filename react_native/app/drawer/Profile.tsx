import React, { useState, useEffect } from "react";
import { 
  SafeAreaView, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Modal, 
  Pressable, 
  TextInput, 
  Alert, 
  ScrollView,
  Dimensions,
  Platform 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { updateProfile } from "../../hooks/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');
const isMobile = width < 768; // Tablet breakpoint
const isSmallDevice = width < 375; // Small phones

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

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    // Load profile data logic
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

  // Responsive styles
  const containerPadding = isMobile ? 'p-4' : 'p-8';
  const profileImageSize = isSmallDevice ? 100 : isMobile ? 120 : 150;
  const textSize = {
    title: isMobile ? 'text-2xl' : 'text-3xl',
    body: isMobile ? 'text-base' : 'text-lg',
    small: isMobile ? 'text-sm' : 'text-base'
  };
  const buttonPadding = isMobile ? 'py-4' : 'py-3';
  const modalWidth = isMobile ? 'w-11/12' : 'w-2/3 max-w-2xl';

  return (
    <SafeAreaView className={`flex-1 bg-gray-50 ${containerPadding}`}>
      {/* Header */}
      <Text className={`${textSize.title} font-bold mb-6`}>Profile</Text>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Profile Image Section */}
        <View className="items-center mb-8">
          <TouchableOpacity 
            onPress={() => setDropdownVisible(true)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: profileImage || "https://i.pravatar.cc/150?img=3" }}
              style={{ 
                width: profileImageSize, 
                height: profileImageSize,
                borderRadius: profileImageSize / 2 
              }}
              className="mb-4 border-4 border-white shadow-lg"
            />
          </TouchableOpacity>
          <Text className={`text-gray-500 ${textSize.small}`}>
            Tap image for options
          </Text>
        </View>

        {/* Profile Info Summary */}
        <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <Text className={`${textSize.body} font-semibold mb-4`}>
            Profile Information
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className={`text-gray-600 ${textSize.small}`}>Name:</Text>
              <Text className={`font-semibold ${textSize.small} text-right flex-1 ml-4`}>
                {firstName || "Not set"} {lastName || ""}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className={`text-gray-600 ${textSize.small}`}>Email:</Text>
              <Text className={`font-semibold ${textSize.small} text-right flex-1 ml-4`}>
                {email || "Not set"}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className={`text-gray-600 ${textSize.small}`}>Phone:</Text>
              <Text className={`font-semibold ${textSize.small} text-right flex-1 ml-4`}>
                {phone || "Not set"}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center py-2">
              <Text className={`text-gray-600 ${textSize.small}`}>Gender:</Text>
              <Text className={`font-semibold ${textSize.small} text-right flex-1 ml-4`}>
                {gender || "Not set"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={openEditModal}
            className={`bg-blue-600 ${buttonPadding} rounded-xl mt-6 shadow-lg`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Options Dropdown - Mobile Optimized */}
      <Modal transparent visible={dropdownVisible} animationType="fade">
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={() => setDropdownVisible(false)}
        >
          <View className={`bg-white rounded-2xl p-5 ${isMobile ? 'w-4/5' : 'w-80'}`}>
            <TouchableOpacity 
              className="py-4 border-b border-gray-200"
              onPress={handlePickImage}
              activeOpacity={0.6}
            >
              <Text className="text-blue-600 font-semibold text-center text-lg">
                Update Photo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="py-4 border-b border-gray-200"
              onPress={openEditModal}
              activeOpacity={0.6}
            >
              <Text className="text-blue-600 font-semibold text-center text-lg">
                Edit Profile
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="py-4"
              onPress={handleLogout}
              activeOpacity={0.6}
            >
              <Text className="text-red-600 font-semibold text-center text-lg">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Profile Modal - Responsive */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className={`bg-white rounded-2xl p-6 ${modalWidth} max-h-[90%]`}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`${textSize.title} font-bold`}>Edit Profile</Text>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              className="max-h-[500px]"
            >
              <View className="space-y-4">
                <TextInput
                  placeholder="First Name *"
                  value={firstName}
                  onChangeText={setFirstName}
                  className={`border-2 border-gray-200 rounded-xl p-4 ${textSize.body}`}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  placeholder="Last Name *"
                  value={lastName}
                  onChangeText={setLastName}
                  className={`border-2 border-gray-200 rounded-xl p-4 ${textSize.body}`}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  placeholder="Email *"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`border-2 border-gray-200 rounded-xl p-4 ${textSize.body}`}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  placeholder="Phone"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  className={`border-2 border-gray-200 rounded-xl p-4 ${textSize.body}`}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  placeholder="Date of Birth (YYYY-MM-DD)"
                  value={dob}
                  onChangeText={setDob}
                  className={`border-2 border-gray-200 rounded-xl p-4 ${textSize.body}`}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  placeholder="Gender"
                  value={gender}
                  onChangeText={setGender}
                  className={`border-2 border-gray-200 rounded-xl p-4 ${textSize.body}`}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  placeholder="Nationality"
                  value={nationality}
                  onChangeText={setNationality}
                  className={`border-2 border-gray-200 rounded-xl p-4 ${textSize.body}`}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  placeholder="Address"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className={`border-2 border-gray-200 rounded-xl p-4 ${textSize.body} min-h-[100px]`}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  placeholder="New Password (leave empty to keep current)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className={`border-2 border-gray-200 rounded-xl p-4 ${textSize.body}`}
                  placeholderTextColor="#9CA3AF"
                />

                <TouchableOpacity
                  onPress={handleUpdateProfile}
                  disabled={loading}
                  className={`bg-blue-600 ${buttonPadding} rounded-xl shadow-lg mt-2`}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    {loading ? "Updating..." : "Update Profile"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Toast position="bottom" bottomOffset={20} />
    </SafeAreaView>
  );
}