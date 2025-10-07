import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // dropdown
import DateTimePicker from "@react-native-community/datetimepicker"; // date picker
import { listMusterRequests, createMusterRequest, editMusterRequest } from "../../../hooks/api";

export default function MusterList() {
  const [musterData, setMusterData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [requestType, setRequestType] = useState("Early Leave");
  const [requestedDate, setRequestedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reason, setReason] = useState("");

  const actions = ["Early Leave", "Late Login", "Network Issue", "Other"];

  useEffect(() => {
    fetchMuster();
  }, []);

  const fetchMuster = async () => {
    setLoading(true);
    try {
      const data = await listMusterRequests();
      setMusterData(data);
    } catch (error) {
      console.log("❌ Error fetching muster requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingRequest(null);
    setRequestType("Early Leave");
    setRequestedDate(new Date());
    setReason("");
  };

  const handleSubmit = async () => {
    if (!requestType || !reason) {
      Alert.alert("⚠️ Fill all fields");
      return;
    }

    const formattedDate = requestedDate.toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      if (editingRequest) {
        await editMusterRequest(editingRequest.id, {
          action: requestType,
          requested_time: formattedDate,
          reason,
        });
        Alert.alert("✅ Updated", "Muster request updated!");
      } else {
        await createMusterRequest({
          action: requestType,
          requested_time: formattedDate,
          reason,
        });
        Alert.alert("✅ Created", "Muster request submitted!");
      }
      setModalVisible(false);
      resetForm();
      fetchMuster();
    } catch (error) {
      console.log(error);
      Alert.alert("❌ Error", "Something went wrong");
    }
  };

  const openEdit = (request: any) => {
    setEditingRequest(request);
    setRequestType(request.action);
    setRequestedDate(new Date(request.requested_time));
    setReason(request.reason);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-3 text-gray-600">Loading muster requests...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4 text-gray-800">📋 Muster Requests</Text>

      {/* New Request Button */}
      <TouchableOpacity
        className="bg-blue-600 p-4 rounded-lg mb-4"
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Text className="text-white font-bold text-center text-lg">+ New Request</Text>
      </TouchableOpacity>

      {/* List */}
      {musterData.length === 0 ? (
        <Text className="text-gray-600">No muster requests found.</Text>
      ) : (
        <FlatList
          data={musterData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="bg-white p-4 mb-3 rounded-xl shadow-md">
              <Text className="text-lg font-semibold text-gray-800">{item.action}</Text>
              <Text className="text-gray-600">🗓️ {item.requested_time}</Text>
              <Text className="text-gray-600">📌 {item.reason}</Text>
              <Text
                className={`mt-2 font-bold ${
                  item.status === "approved"
                    ? "text-green-600"
                    : item.status === "pending"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {item.status.toUpperCase()}
              </Text>

              {item.status === "pending" && (
                <TouchableOpacity
                  className="bg-yellow-500 p-2 mt-3 rounded-lg"
                  onPress={() => openEdit(item)}
                >
                  <Text className="text-white text-center font-semibold">✏️ Edit</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white w-full rounded-2xl p-6">
            <Text className="text-xl font-bold mb-4 text-gray-800">
              {editingRequest ? "✏️ Edit Request" : "🆕 New Request"}
            </Text>

            {/* Action Picker */}
            <Picker
              selectedValue={requestType}
              onValueChange={(val) => setRequestType(val)}
              className="bg-white border rounded-lg mb-3"
            >
              {actions.map((act) => (
                <Picker.Item key={act} label={act} value={act} />
              ))}
            </Picker>

            {/* Date Picker */}
            <TouchableOpacity
              className="border p-3 rounded-lg mb-3"
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{requestedDate.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={requestedDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setRequestedDate(date);
                }}
              />
            )}

            {/* Reason */}
            <TextInput
              className="border p-3 rounded-lg mb-4"
              placeholder="Reason"
              value={reason}
              onChangeText={setReason}
            />

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 bg-gray-400 p-3 rounded-lg mr-2"
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text className="text-white text-center font-bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-blue-600 p-3 rounded-lg"
                onPress={handleSubmit}
              >
                <Text className="text-white text-center font-bold">
                  {editingRequest ? "Update" : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
