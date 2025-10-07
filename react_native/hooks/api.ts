// hooks/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://127.0.0.1:8000/api";

// Helper to get token from AsyncStorage
const getToken = async () => {
  try {
    const tokenString = await AsyncStorage.getItem("userToken");
    console.log("📱 Raw token from storage:", tokenString);
    
    if (!tokenString) {
      console.log("❌ No token found in AsyncStorage");
      return null;
    }
    
    const tokenData = JSON.parse(tokenString);
    const token = tokenData?.access;
    console.log("🔑 Parsed token:", token ? "Token exists" : "No access token");
    
    return token || null;
  } catch (error) {
    console.log("❌ Error getting token:", error);
    return null;
  }
};

// Common request function with better error handling
const makeRequest = async (endpoint: string, method = 'POST', data: any = {}) => {
  const token = await getToken();
  
  if (!token) {
    throw new Error("No authentication token found. Please login again.");
  }

  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    data: method !== 'GET' ? data : undefined,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  console.log(`🚀 Making ${method} request to: ${config.url}`);
  console.log(`🔑 Using token: ${token.substring(0, 20)}...`);
  
  try {
    const response = await axios(config);
    console.log(`✅ Request successful:`, response.data);
    return response.data;
  } catch (error: any) {
    console.log(`❌ Request failed:`, error.response?.data || error.message);
    console.log(`📊 Status: ${error.response?.status}`);
    console.log(`🔍 Headers:`, error.response?.headers);
    throw error;
  }
};

// Authentication test
export const testAuth = async () => {
  const token = await getToken();
  console.log("🧪 Testing authentication...");
  console.log("🔑 Token:", token ? "Exists" : "Missing");
  
  if (!token) {
    throw new Error("No token found in AsyncStorage");
  }
  
  try {
    const response = await axios.get(`${API_URL}/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Auth test successful");
    return response.data;
  } catch (error: any) {
    console.log("❌ Auth test failed:", error.response?.data);
    throw error;
  }
};

export const loginUser = async (employeeId: string, password: string) => {
  console.log("🔐 Attempting login...");
  try {
    const response = await axios.post(`${API_URL}/login/`, {
      employee_id: employeeId,
      password: password,
    });
    
    console.log("✅ Login successful");

    // Save token to AsyncStorage
    await AsyncStorage.setItem("userToken", JSON.stringify(response.data));
    console.log("💾 Token saved to AsyncStorage");

    return response.data;
  } catch (error: any) {
    console.log("❌ Login failed:", error.response?.data);
    throw error;
  }
};


// Attendance APIs
export const clockIn = async () => {
  console.log("⏰ Clocking in...");
  return makeRequest('/clock_in/', 'POST');
};

export const clockOut = async () => {
  console.log("⏰ Clocking out...");
  return makeRequest('/clock_out/', 'POST');
};

export const lunchIn = async () => {
  console.log("🍽️ Lunch in...");
  return makeRequest('/lunch_in/', 'POST');
};

export const lunchOut = async () => {
  console.log("🍽️ Lunch out...");
  return makeRequest('/lunch_out/', 'POST');
};

export const breakIn = async () => {
  console.log("☕ Break in...");
  return makeRequest('/break_in/', 'POST');
};

export const breakOut = async () => {
  console.log("☕ Break out...");
  return makeRequest('/break_out/', 'POST');
};

// Attendance Summary
export const getAttendanceSummary = async () => {
  console.log("📊 Getting attendance summary...");
  return makeRequest('/attendance-summary/', 'GET');
};

// Profile APIs
export const updateProfile = async (data: any) => {
  console.log("👤 Updating profile...");
  const token = await getToken();
  
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.put(`${API_URL}/update_profile/`, data, { 
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      } 
    });
    console.log("✅ Profile update successful");
    return response.data;
  } catch (error: any) {
    console.log("❌ Profile update failed:", error.response?.data);
    throw error;
  }
};

// Muster Request APIs
export const createMusterRequest = async (requestData: any) => {
  console.log("📝 Creating muster request...");
  return makeRequest('/muster-request/', 'POST', requestData);
};

export const listMusterRequests = async () => {
  console.log("📋 Listing muster requests...");
  return makeRequest('/muster-request/list/', 'GET');
};

export const editMusterRequest = async (requestId: number, requestData: any) => {
  console.log("✏️ Editing muster request...");
  return makeRequest(`/muster-request/${requestId}/edit/`, 'PATCH', requestData);
};

// Employee CRUD APIs
export const listEmployees = async () => {
  console.log("👥 Listing employees...");
  return makeRequest('/employees/', 'GET');
};

export const updateEmployee = async (employeeId: string, employeeData: any) => {
  console.log("✏️ Updating employee...");
  return makeRequest(`/employees/${employeeId}/update/`, 'PATCH', employeeData);
};

export const deleteEmployee = async (employeeId: string) => {
  console.log("🗑️ Deleting employee...");
  return makeRequest(`/employees/${employeeId}/delete/`, 'DELETE');
};

// Register Employee
export const registerEmployee = async (userData: any) => {
  console.log("👤 Registering employee...");
  const token = await getToken();
  
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.post(`${API_URL}/register-employee/`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Employee registration successful");
    return response.data;
  } catch (error: any) {
    console.log("❌ Employee registration failed:", error.response?.data);
    throw error;
  }
};

// Debug function to check all stored data
export const debugStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log("📱 All AsyncStorage keys:", keys);
    
    const items = await AsyncStorage.multiGet(keys);
    console.log("📱 All AsyncStorage items:");
    items.forEach(([key, value]) => {
      console.log(`  ${key}:`, value);
    });
  } catch (error) {
    console.log("❌ Error reading AsyncStorage:", error);
  }
};