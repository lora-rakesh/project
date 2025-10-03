import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getAttendanceSummary } from "../../../hooks/api";

interface EmployeeAttendance {
  employee_id: string;
  first_name: string;
  last_name: string;
  clock_in: string | null;
  clock_out: string | null;
  break_in: string | null;
  break_out: string | null;
  lunch_in: string | null;
  lunch_out: string | null;
}

interface AttendanceSummary {
  clockin: EmployeeAttendance[];
  clockout: EmployeeAttendance[];
  breakin: EmployeeAttendance[];
  breakout: EmployeeAttendance[];
  lunchin: EmployeeAttendance[];
  lunchout: EmployeeAttendance[];
}

export default function MusterUpdate() {
  const navigation = useNavigation<any>();
  const [attendanceData, setAttendanceData] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const toggleMusterDrawer = () => {
    navigation.toggleDrawer?.();
  };

  const fetchAttendanceData = async () => {
    try {
      const data = await getAttendanceSummary();
      setAttendanceData(data);
    } catch (error: any) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendanceData();
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "-";
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return "-";
    }
  };

  const getEmployeeStatus = (employee: EmployeeAttendance) => {
    if (employee.clock_out) return "Completed";
    if (employee.clock_in) return "Working";
    return "Not Started";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "Working": return "bg-blue-100 text-blue-800";
      case "Not Started": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAllEmployees = () => {
    if (!attendanceData) return [];
    const allEmployees = new Map();
    
    [...attendanceData.clockin, ...attendanceData.clockout, 
     ...attendanceData.breakin, ...attendanceData.breakout,
     ...attendanceData.lunchin, ...attendanceData.lunchout].forEach(emp => {
      allEmployees.set(emp.employee_id, {
        ...allEmployees.get(emp.employee_id),
        ...emp
      });
    });
    
    return Array.from(allEmployees.values());
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#007bff" />
        <Text className="mt-4 text-lg">Loading attendance...</Text>
      </View>
    );
  }

  const employees = getAllEmployees();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-4 bg-white shadow-sm">
        <TouchableOpacity onPress={toggleMusterDrawer} className="mr-4">
          <Ionicons name="menu-outline" size={28} color="#007bff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Attendance Dashboard</Text>
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className="text-2xl font-bold mb-6 text-center">📊 Live Attendance</Text>

        {attendanceData && (
          <View className="bg-white rounded-lg p-4 shadow-md mb-6">
            <Text className="text-lg font-semibold mb-3">Today's Summary</Text>
            <View className="flex-row flex-wrap justify-between">
              <View className="items-center mb-3 w-1/2">
                <Text className="text-sm text-gray-500">Clocked In</Text>
                <Text className="text-2xl font-bold text-green-600">{attendanceData.clockin.length}</Text>
              </View>
              <View className="items-center mb-3 w-1/2">
                <Text className="text-sm text-gray-500">Clocked Out</Text>
                <Text className="text-2xl font-bold text-blue-600">{attendanceData.clockout.length}</Text>
              </View>
              <View className="items-center mb-3 w-1/2">
                <Text className="text-sm text-gray-500">On Lunch</Text>
                <Text className="text-2xl font-bold text-yellow-600">{attendanceData.lunchin.length}</Text>
              </View>
              <View className="items-center mb-3 w-1/2">
                <Text className="text-sm text-gray-500">On Break</Text>
                <Text className="text-2xl font-bold text-purple-600">{attendanceData.breakin.length}</Text>
              </View>
            </View>
          </View>
        )}

        <View className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <Text className="text-lg font-semibold p-4 bg-blue-50 border-b">
            Employees ({employees.length})
          </Text>
          
          <View className="flex-row bg-gray-100 border-b">
            <Text className="flex-2 p-3 font-semibold text-xs">Employee</Text>
            <Text className="flex-1 p-3 font-semibold text-xs">Clock In</Text>
            <Text className="flex-1 p-3 font-semibold text-xs">Clock Out</Text>
            <Text className="flex-1 p-3 font-semibold text-xs">Status</Text>
          </View>

          {employees.length > 0 ? (
            employees.map((employee, index) => (
              <View key={employee.employee_id} className={`flex-row border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <View className="flex-2 p-2">
                  <Text className="text-xs font-semibold">{employee.first_name} {employee.last_name}</Text>
                  <Text className="text-xs text-gray-500">{employee.employee_id}</Text>
                </View>
                <Text className={`flex-1 p-2 text-xs ${employee.clock_in ? 'text-green-600' : 'text-red-500'}`}>
                  {formatTime(employee.clock_in)}
                </Text>
                <Text className={`flex-1 p-2 text-xs ${employee.clock_out ? 'text-green-600' : 'text-red-500'}`}>
                  {formatTime(employee.clock_out)}
                </Text>
                <View className="flex-1 p-2">
                  <Text className={`text-xs px-2 py-1 rounded-full text-center ${getStatusColor(getEmployeeStatus(employee))}`}>
                    {getEmployeeStatus(employee)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className="p-4 items-center">
              <Text className="text-gray-500">No attendance data available</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          className="px-6 py-3 bg-gray-600 rounded-lg mb-8"
          onPress={() => navigation.navigate("MusterList")}
        >
          <Text className="text-white text-lg font-semibold text-center">Back to Muster List</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}