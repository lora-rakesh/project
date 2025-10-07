import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator, 
  Modal, 
  TextInput, 
  Alert,
  Dimensions 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { listEmployees, updateEmployee, deleteEmployee } from "../../hooks/api";

const { width } = Dimensions.get('window');
const isMobile = width < 768;
const isSmallDevice = width < 375;

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

  // Responsive styles
  const containerPadding = isMobile ? 'p-4' : 'p-6';
  const textSize = {
    title: isMobile ? 'text-2xl' : 'text-3xl',
    header: isMobile ? 'text-xl' : 'text-2xl',
    body: isMobile ? 'text-base' : 'text-lg',
    small: isMobile ? 'text-sm' : 'text-base'
  };
  const buttonPadding = isMobile ? 'py-4' : 'py-3';
  const modalWidth = isMobile ? 'w-11/12' : 'w-2/3 max-w-md';
  const inputPadding = isMobile ? 'p-4' : 'p-3';

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
        <Text className={`mt-4 ${textSize.body}`}>Loading employees...</Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 bg-gray-50 ${containerPadding}`}>
      {/* Header */}
      <View className={`flex-row items-center p-4 bg-white shadow-lg rounded-2xl mb-6`}>
        <TouchableOpacity 
          onPress={() => navigation.toggleDrawer?.()} 
          className="mr-4"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu-outline" size={isMobile ? 28 : 32} color="#007bff" />
        </TouchableOpacity>
        <Text className={`${textSize.header} font-bold`}>Employee Management</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className={`${textSize.title} font-bold mb-6 text-center`}>👥 Employees</Text>

        {/* Employees List */}
        <View className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <View className="bg-blue-50 p-4 border-b border-gray-200">
            <Text className={`${textSize.body} font-semibold text-blue-800`}>
              All Employees ({employees.length})
            </Text>
          </View>

          {employees.length > 0 ? (
            employees.map((employee, index) => (
              <View 
                key={employee.id} 
                className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <View className="p-4">
                  {/* Employee Info */}
                  <View className="mb-4">
                    <Text className={`${textSize.body} font-semibold mb-1`}>
                      {employee.first_name} {employee.last_name}
                    </Text>
                    <Text className={`text-gray-600 ${textSize.small} mb-2`}>
                      ID: {employee.employee_id}
                    </Text>
                    <View className="flex-row flex-wrap items-center gap-2">
                      <Text className={`px-3 py-1.5 rounded-full ${textSize.small} ${getRoleColor(employee.role)}`}>
                        {employee.role.toUpperCase()}
                      </Text>
                      {employee.is_staff && (
                        <Text className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          STAFF
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {/* Action Buttons */}
                  <View className="flex-row justify-between">
                    <TouchableOpacity
                      onPress={() => openEditModal(employee)}
                      className={`bg-blue-500 px-5 ${buttonPadding} rounded-xl flex-1 mr-2 shadow-sm`}
                      activeOpacity={0.7}
                    >
                      <Text className="text-white text-center font-semibold text-base">
                        Edit
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleDeleteEmployee(employee)}
                      className={`bg-red-500 px-5 ${buttonPadding} rounded-xl flex-1 ml-2 shadow-sm`}
                      activeOpacity={0.7}
                    >
                      <Text className="text-white text-center font-semibold text-base">
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="p-8 items-center">
              <Text className={`text-gray-500 ${textSize.body} mb-2`}>No employees found</Text>
              <Text className="text-gray-400 text-center">Add employees to get started</Text>
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
        <View className="flex-1 justify-center items-center bg-black/50 p-4">
          <View className={`bg-white rounded-2xl p-6 ${modalWidth} max-h-[90%]`}>
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`${textSize.header} font-bold`}>Edit Employee</Text>
              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedEmployee && (
              <View className="mb-4 p-4 bg-gray-100 rounded-xl">
                <Text className={`font-semibold ${textSize.body}`}>
                  Employee ID: {selectedEmployee.employee_id}
                </Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-4">
                <TextInput
                  placeholder="First Name *"
                  value={firstName}
                  onChangeText={setFirstName}
                  className={`border-2 border-gray-200 rounded-xl ${inputPadding} ${textSize.body}`}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  placeholder="Last Name *"
                  value={lastName}
                  onChangeText={setLastName}
                  className={`border-2 border-gray-200 rounded-xl ${inputPadding} ${textSize.body}`}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  placeholder="Role (employee/hr/manager/admin) *"
                  value={role}
                  onChangeText={setRole}
                  className={`border-2 border-gray-200 rounded-xl ${inputPadding} ${textSize.body}`}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  placeholder="New Password (leave empty to keep current)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className={`border-2 border-gray-200 rounded-xl ${inputPadding} ${textSize.body}`}
                  placeholderTextColor="#9CA3AF"
                />

                <View className="flex-row justify-between space-x-3 pt-2">
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      resetForm();
                    }}
                    className={`flex-1 bg-gray-500 ${buttonPadding} rounded-xl shadow-sm`}
                    activeOpacity={0.7}
                  >
                    <Text className="text-white text-center font-semibold text-base">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleUpdateEmployee}
                    className={`flex-1 bg-blue-600 ${buttonPadding} rounded-xl shadow-sm`}
                    activeOpacity={0.7}
                  >
                    <Text className="text-white text-center font-semibold text-base">
                      Update
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}