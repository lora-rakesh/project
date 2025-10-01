import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Modal, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { listMusterRequests, createMusterRequest, editMusterRequest } from "../../../hooks/api";

interface MusterRequest {
  id: number;
  employee_id: string;
  action: string;
  requested_time: string;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function MusterList() {
  const navigation = useNavigation<any>();
  const [requests, setRequests] = useState<MusterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MusterRequest | null>(null);
  
  // New request form state
  const [action, setAction] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [reason, setReason] = useState("");

  const fetchMusterRequests = async () => {
    try {
      const data = await listMusterRequests();
      setRequests(data);
    } catch (error: any) {
      console.log("Error fetching muster requests:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMusterRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMusterRequests();
  };

  const handleCreateRequest = async () => {
    if (!action || !requestedTime || !reason) {
      alert("Please fill all fields");
      return;
    }

    try {
      await createMusterRequest({
        action,
        requested_time: requestedTime,
        reason,
      });
      setModalVisible(false);
      resetForm();
      fetchMusterRequests();
      alert("Muster request submitted successfully!");
    } catch (error: any) {
      alert("Error creating request: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEditRequest = async () => {
    if (!editingRequest || !action || !requestedTime || !reason) return;

    try {
      await editMusterRequest(editingRequest.id, {
        action,
        requested_time: requestedTime,
        reason,
      });
      setModalVisible(false);
      resetForm();
      fetchMusterRequests();
      alert("Muster request updated successfully!");
    } catch (error: any) {
      alert("Error updating request: " + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setAction("");
    setRequestedTime("");
    setReason("");
    setEditingRequest(null);
  };

  const openEditModal = (request: MusterRequest) => {
    setEditingRequest(request);
    setAction(request.action);
    setRequestedTime(request.requested_time);
    setReason(request.reason);
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#007bff" />
        <Text className="mt-4 text-lg">Loading muster requests...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white shadow-sm">
        <TouchableOpacity onPress={() => navigation.toggleDrawer?.()} className="mr-4">
          <Ionicons name="menu-outline" size={28} color="#007bff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Muster Requests</Text>
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className="text-2xl font-bold mb-6 text-center">📋 My Muster Requests</Text>

        {/* Create New Request Button */}
        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-lg mb-6"
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text className="text-white text-lg font-semibold text-center">+ New Muster Request</Text>
        </TouchableOpacity>

        {/* Requests List */}
        <View className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <Text className="text-lg font-semibold p-4 bg-blue-50 border-b">
            My Requests ({requests.length})
          </Text>

          {requests.length > 0 ? (
            requests.map((request, index) => (
              <View key={request.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <View className="p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold">{request.action}</Text>
                      <Text className="text-gray-600">Requested: {formatDate(request.requested_time)}</Text>
                      <Text className="text-gray-600 mt-1">Reason: {request.reason}</Text>
                    </View>
                    <Text className={`px-3 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                      {request.status.toUpperCase()}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-xs text-gray-500">
                      Created: {formatDate(request.created_at)}
                    </Text>
                    {request.status === "pending" && (
                      <TouchableOpacity
                        onPress={() => openEditModal(request)}
                        className="bg-yellow-500 px-3 py-1 rounded"
                      >
                        <Text className="text-white text-xs">Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="p-8 items-center">
              <Text className="text-gray-500 text-lg mb-4">No muster requests found</Text>
              <Text className="text-gray-400 text-center">Create your first muster request to get started</Text>
            </View>
          )}
        </View>

        {/* Navigation to Attendance */}
        <TouchableOpacity
          className="px-6 py-3 bg-gray-600 rounded-lg mb-8"
          onPress={() => navigation.navigate("MusterUpdate")}
        >
          <Text className="text-white text-lg font-semibold text-center">View Attendance Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <Text className="text-xl font-bold mb-4">
              {editingRequest ? "Edit Muster Request" : "New Muster Request"}
            </Text>

            <TextInput
              placeholder="Action (e.g., Early Leave, Late Arrival)"
              value={action}
              onChangeText={setAction}
              className="border border-gray-300 rounded-lg p-3 mb-3"
            />

            <TextInput
              placeholder="Requested Time (YYYY-MM-DD)"
              value={requestedTime}
              onChangeText={setRequestedTime}
              className="border border-gray-300 rounded-lg p-3 mb-3"
            />

            <TextInput
              placeholder="Reason"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              className="border border-gray-300 rounded-lg p-3 mb-6"
            />

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-gray-500 py-3 rounded-lg mr-2"
              >
                <Text className="text-white text-center">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={editingRequest ? handleEditRequest : handleCreateRequest}
                className="flex-1 bg-blue-600 py-3 rounded-lg ml-2"
              >
                <Text className="text-white text-center">
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