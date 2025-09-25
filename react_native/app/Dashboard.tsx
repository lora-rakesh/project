import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "./api/api";

type AttendanceSummary = {
  total_days?: number;
  present_days?: number;
  absent_days?: number;
  late_days?: number;
};

type MusterRequest = {
  id: number;
  reason: string;
  status: string;
};

const ActionButton = ({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const base =
    "flex-1 py-3 rounded-lg flex-row items-center justify-center space-x-2";
  const styles = disabled ? "bg-gray-400" : "bg-gray-800";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
      {icon}
      <Text className="text-white font-medium">{label}</Text>
    </TouchableOpacity>
  );
};

const DashboardScreen = () => {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<any>({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [reason, setReason] = useState("");
  const [requests, setRequests] = useState<MusterRequest[]>([]);
  const [requestLoading, setRequestLoading] = useState(false);

  const [employeeName, setEmployeeName] = useState<string>("");

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await API.get("attendance-summary/");
      setSummary(res.data);
    } catch (err: any) {
      Alert.alert("Error", "Failed to load attendance summary");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceAction = async (endpoint: string) => {
    try {
      const res = await API.post(endpoint);
      Alert.alert("Success", res.data.message);
      fetchSummary();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Action failed");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("update_profile/");
      setProfile(res.data);
      setEmployeeName(`${res.data.first_name} ${res.data.last_name}`);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch profile");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setProfileLoading(true);
      const payload = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        dob: profile.dob,
        gender: profile.gender,
        nationality: profile.nationality,
        address: profile.address,
        password: profile.password || undefined,
        profile_photo: profile.profile_photo || undefined,
      };
      const res = await API.post("update_profile/", payload);
      Alert.alert("Success", res.data.message || "Profile updated");
      fetchProfile();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Update failed");
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await API.get("muster-request/list/");
      setRequests(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmitRequest = async () => {
    if (!reason) {
      Alert.alert("Error", "Please enter a reason");
      return;
    }
    try {
      setRequestLoading(true);
      const res = await API.post("muster-request/", { reason });
      Alert.alert("Success", res.data.message || "Request submitted");
      setReason("");
      fetchRequests();
    } catch (err) {
      Alert.alert("Error", "Failed to submit request");
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchProfile();
    fetchRequests();
  }, []);

  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="bg-gray-50 px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Welcome, {employeeName}
        </Text>
        <Text className="text-gray-600 mb-6">
          Here is your attendance and requests summary
        </Text>

        {/* Attendance Summary */}
        <View className="bg-white rounded-xl shadow-md p-5 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Attendance Summary
          </Text>
          {loading ? (
            <Text className="text-gray-500">Loading...</Text>
          ) : summary ? (
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Total Days</Text>
                <Text className="text-gray-900 font-semibold">
                  {summary.total_days ?? "-"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Present Days</Text>
                <Text className="text-gray-900 font-semibold">
                  {summary.present_days ?? "-"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Absent Days</Text>
                <Text className="text-gray-900 font-semibold">
                  {summary.absent_days ?? "-"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Late Days</Text>
                <Text className="text-gray-900 font-semibold">
                  {summary.late_days ?? "-"}
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-gray-500">No summary available</Text>
          )}
        </View>

        {/* Attendance Actions */}
        <View className="bg-white rounded-xl shadow-md p-5 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </Text>

          <View className="flex-row space-x-3 mb-3">
            <ActionButton
              label="Clock In"
              icon={
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color="white"
                />
              }
              onPress={() => handleAttendanceAction("clock_in/")}
            />
            <ActionButton
              label="Clock Out"
              icon={
                <MaterialCommunityIcons
                  name="clock-end"
                  size={20}
                  color="white"
                />
              }
              onPress={() => handleAttendanceAction("clock_out/")}
            />
          </View>

          <View className="flex-row space-x-3 mb-3">
            <ActionButton
              label="Break In"
              icon={
                <MaterialCommunityIcons
                  name="coffee-outline"
                  size={20}
                  color="white"
                />
              }
              onPress={() => handleAttendanceAction("break_in/")}
            />
            <ActionButton
              label="Break Out"
              icon={
                <MaterialCommunityIcons
                  name="coffee-off-outline"
                  size={20}
                  color="white"
                />
              }
              onPress={() => handleAttendanceAction("break_out/")}
            />
          </View>

          <View className="flex-row space-x-3">
            <ActionButton
              label="Lunch In"
              icon={
                <MaterialCommunityIcons
                  name="food-fork-drink"
                  size={20}
                  color="white"
                />
              }
              onPress={() => handleAttendanceAction("lunch_in/")}
            />
            <ActionButton
              label="Lunch Out"
              icon={
                <MaterialCommunityIcons name="food-off" size={20} color="white" />
              }
              onPress={() => handleAttendanceAction("lunch_out/")}
            />
          </View>
        </View>

        {/* Profile Update */}
        <View className="bg-white rounded-xl shadow-md p-5 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Update Profile
          </Text>

          {profile.profile_photo && (
            <Image
              source={{ uri: profile.profile_photo }}
              className="w-20 h-20 rounded-full mb-4 self-center"
            />
          )}

          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800"
            placeholder="First Name"
            value={profile.first_name || ""}
            onChangeText={(text) =>
              setProfile({ ...profile, first_name: text })
            }
          />
          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800"
            placeholder="Last Name"
            value={profile.last_name || ""}
            onChangeText={(text) =>
              setProfile({ ...profile, last_name: text })
            }
          />
          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800"
            placeholder="Email"
            value={profile.email || ""}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
            keyboardType="email-address"
          />
          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800"
            placeholder="Phone"
            value={profile.phone || ""}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            className={`w-full py-3 rounded-lg ${
              profileLoading ? "bg-gray-400" : "bg-gray-800"
            }`}
            onPress={handleUpdateProfile}
            disabled={profileLoading}
          >
            <Text className="text-white text-center font-medium">
              {profileLoading ? "Updating..." : "Update Profile"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Muster Request */}
        <View className="bg-white rounded-xl shadow-md p-5 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Muster Request
          </Text>
          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800"
            placeholder="Enter Reason"
            value={reason}
            onChangeText={setReason}
          />
          <TouchableOpacity
            className={`w-full py-3 rounded-lg ${
              requestLoading ? "bg-gray-400" : "bg-gray-800"
            }`}
            onPress={handleSubmitRequest}
            disabled={requestLoading}
          >
            <Text className="text-white text-center font-medium">
              {requestLoading ? "Submitting..." : "Submit Request"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Muster Requests List */}
        <View className="bg-white rounded-xl shadow-md p-5 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Your Requests
          </Text>
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                <Text className="font-semibold">Reason: {item.reason}</Text>
                <Text className="text-gray-600">Status: {item.status}</Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DashboardScreen;
