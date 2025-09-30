import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clockIn, clockOut, lunchIn, lunchOut, breakIn, breakOut, updateProfile } from "../../hooks/api";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// Mini toast component
const ToastMessage = ({ message, isError = false, duration = 2000 }: { message: string; isError?: boolean; duration?: number }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -5, duration: 300, useNativeDriver: true }),
      ]).start();
    }, duration);

    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: -25,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: isError ? "#D14343" : "#16A34A",
        borderRadius: 6,
        opacity,
        transform: [{ translateY }],
        zIndex: 999,
      }}
    >
      <Text style={{ color: "white", fontSize: 12, textAlign: "center" }}>{message}</Text>
    </Animated.View>
  );
};

type DashboardProps = {
  collapsed?: boolean;
  navigation?: any;
};

export default function Dashboard({ collapsed = false, navigation }: DashboardProps) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tokenString = await AsyncStorage.getItem("userToken");
        const tokenData = tokenString ? JSON.parse(tokenString) : null;
        const token = tokenData?.access;

        if (token) {
          const res = await axios.get(`${API_URL}/profile/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProfileImage(res.data.image);
        }
      } catch (err) {
        console.log("Failed to fetch profile image", err);
      }
    };
    fetchProfile();
  }, []);

  const boxes = [
    { title: "Work", buttons: [{ label: "Clock In", api: clockIn }, { label: "Clock Out", api: clockOut }] },
    { title: "Lunch", buttons: [{ label: "Lunch In", api: lunchIn }, { label: "Lunch Out", api: lunchOut }] },
    { title: "Break", buttons: [{ label: "Break In", api: breakIn }, { label: "Break Out", api: breakOut }] },
  ];

  const handlePress = async (apiFunc: Function, label: string, id: string) => {
    try {
      await apiFunc();
      setFeedback((prev) => ({ ...prev, [id]: `${label} successful!` }));
    } catch {
      setFeedback((prev) => ({ ...prev, [id]: `${label} failed` }));
    }
    setTimeout(() => setFeedback((prev) => ({ ...prev, [id]: "" })), 2000);
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
      formData.append("image", {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);

      try {
        await updateProfile(formData);
        setProfileImage(result.assets[0].uri);
      } catch (err) {
        console.log("Profile update failed", err);
      }
    }
    setDropdownVisible(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    // navigate to login page
    navigation?.replace("index");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fa" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "white", shadowOpacity: 0.1, shadowRadius: 2 }}>
        {/* Drawer toggle */}
        <TouchableOpacity onPress={() => navigation?.toggleDrawer()}>
          <Ionicons name="menu-outline" size={28} color="#007bff" />
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Dashboard</Text>

        <TouchableOpacity onPress={() => setDropdownVisible(true)}>
          <Image source={{ uri: profileImage || "https://i.pravatar.cc/150?img=3" }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      <Modal transparent visible={dropdownVisible} animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: "#00000020", justifyContent: "flex-start", alignItems: "flex-end", paddingTop: 60, paddingRight: 10 }} onPress={() => setDropdownVisible(false)}>
          <View style={{ backgroundColor: "white", borderRadius: 8, width: 160, padding: 5 }}>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: 8 }} onPress={handlePickImage}>
              <MaterialIcons name="photo-camera" size={20} color="#007bff" />
              <Text style={{ marginLeft: 5, color: "#007bff", fontWeight: "600" }}>Update Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: 8 }} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="red" />
              <Text style={{ marginLeft: 5, color: "red", fontWeight: "600" }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Body */}
      <ScrollView contentContainerStyle={{ padding: 16, marginLeft: collapsed ? 100 : 0 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {boxes.map((box, i) => (
            <View key={i} style={{ width: "48%", backgroundColor: "white", borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8, textAlign: "center" }}>{box.title}</Text>
              <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
                {box.buttons.map((btn, j) => {
                  const btnId = `${i}-${j}`;
                  return (
                    <View key={j} style={{ alignItems: "center" }}>
                      {feedback[btnId] && <ToastMessage message={feedback[btnId]} isError={feedback[btnId].includes("failed")} />}
                      <TouchableOpacity
                        onPress={() => handlePress(btn.api, btn.label, btnId)}
                        style={{
                          backgroundColor: "#007bff",
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "600" }}>{btn.label}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
