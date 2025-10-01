import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Modal, TextInput, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { listEmployees, updateEmployee, deleteEmployee } from "../../hooks/api";

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  role: string;
  is_staff: boolean;
}

export default function Employee() {
  const navigation = useNavigation<any>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Edit form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");

  const fetchEmployees = async () => {
    try {
      const data = await listEmployees();
      setEmployees(data);
    } catch (error: any) {
      console.log("Error fetching employees:", error);
      Alert.alert("Error", "Failed to load employees");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFirstName(employee.first_name);
    setLastName(employee.last_name);
    setRole(employee.role);
    setPassword("");
    setModalVisible(true);
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee || !firstName || !lastName || !role) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const updateData: any = {
      first_name: firstName,
      last_name: lastName,
      role: role,
    };

    if (password) {
      updateData.password = password;
    }

    try {
      await updateEmployee(selectedEmployee.employee_id, updateData);
      setModalVisible(false);
      resetForm();
      fetchEmployees();
      Alert.alert("Success", "Employee updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to update employee");
    }
  };

  const handleDeleteEmployee = (employee: Employee) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${employee.first_name} ${employee.last_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEmployee(employee.employee_id);
              fetchEmployees();
              Alert.alert("Success", "Employee deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.error || "Failed to delete employee");
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setFirstName("");
    setLastName("");
    setRole("");
    setPassword("");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "hr": return "bg-purple-100 text-purple-800";
      case "manager": return "bg-blue-100 text-blue-800";
      case "employee": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#007bff" />
        <Text className="mt-4 text-lg">Loading employees...</Text>
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
        <Text className="text-xl font-bold">Employee Management</Text>
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className="text-2xl font-bold mb-6 text-center">👥 Employees</Text>

        {/* Employees List */}
        <View className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <Text className="text-lg font-semibold p-4 bg-blue-50 border-b">
            All Employees ({employees.length})
          </Text>

          {employees.length > 0 ? (
            employees.map((employee, index) => (
              <View key={employee.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <View className="p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold">
                        {employee.first_name} {employee.last_name}
                      </Text>
                      <Text className="text-gray-600">ID: {employee.employee_id}</Text>
                      <View className="flex-row items-center mt-1">
                        <Text className={`px-2 py-1 rounded text-xs ${getRoleColor(employee.role)}`}>
                          {employee.role.toUpperCase()}
                        </Text>
                        {employee.is_staff && (
                          <Text className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            STAFF
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-end space-x-2 mt-3">
                    <TouchableOpacity
                      onPress={() => openEditModal(employee)}
                      className="bg-blue-500 px-4 py-2 rounded"
                    >
                      <Text className="text-white text-sm">Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleDeleteEmployee(employee)}
                      className="bg-red-500 px-4 py-2 rounded"
                    >
                      <Text className="text-white text-sm">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="p-8 items-center">
              <Text className="text-gray-500 text-lg">No employees found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Employee Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <Text className="text-xl font-bold mb-4">Edit Employee</Text>

            {selectedEmployee && (
              <View className="mb-4 p-3 bg-gray-100 rounded">
                <Text className="font-semibold">Employee ID: {selectedEmployee.employee_id}</Text>
              </View>
            )}

            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              className="border border-gray-300 rounded-lg p-3 mb-3"
            />

            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              className="border border-gray-300 rounded-lg p-3 mb-3"
            />

            <TextInput
              placeholder="Role (employee/hr/manager/admin)"
              value={role}
              onChangeText={setRole}
              className="border border-gray-300 rounded-lg p-3 mb-3"
            />

            <TextInput
              placeholder="New Password (leave empty to keep current)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-300 rounded-lg p-3 mb-6"
            />

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-500 py-3 rounded-lg mr-2"
              >
                <Text className="text-white text-center">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleUpdateEmployee}
                className="flex-1 bg-blue-600 py-3 rounded-lg ml-2"
              >
                <Text className="text-white text-center">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}