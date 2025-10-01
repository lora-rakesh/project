// hooks/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://127.0.0.1:8000/api";

// Helper to get token from AsyncStorage
const getToken = async () => {
  try {
    const tokenString = await AsyncStorage.getItem("userToken");
    const tokenData = tokenString ? JSON.parse(tokenString) : null;
    return tokenData?.access || null;
  } catch (error) {
    console.log("Error getting token:", error);
    return null;
  }
};

// Common request function
const makeRequest = async (endpoint: string, method = 'POST') => {
  const token = await getToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  console.log(`Making ${method} request to: ${config.url}`); // Debug log
  const response = await axios(config);
  return response.data;
};

export const loginUser = async (employeeId: string, password: string) => {
  return axios.post(`${API_URL}/login/`, {
    employee_id: employeeId,
    password: password,
  });
};

// Clock functions - Match your Django URL patterns
export const clockIn = async () => {
  return makeRequest('/clock_in/'); // Matches your Django @api_view(['POST']) def clock_in
};

export const clockOut = async () => {
  return makeRequest('/clock_out/');
};

// Lunch functions
export const lunchIn = async () => {
  return makeRequest('/lunch_in/');
};

export const lunchOut = async () => {
  return makeRequest('/lunch_out/');
};

// Break functions
export const breakIn = async () => {
  return makeRequest('/break_in/');
};

export const breakOut = async () => {
  return makeRequest('/break_out/');
};

// Update profile
export const updateProfile = async (data: any) => {
  const token = await getToken();
  return axios.put(`${API_URL}/update_profile/`, data, { 
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    } 
  });
};

export const registerEmployee = async (userData: any) => {
  const token = await getToken();
  return axios.post(`${API_URL}/register-employee/`, userData, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const getAttendanceSummary = async () => {
  const token = await getToken();
  const response = await axios.get(`${API_URL}/attendance-summary/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
// Muster Request APIs
export const createMusterRequest = async (requestData: any) => {
  const token = await getToken();
  const response = await axios.post(`${API_URL}/muster-request/`, requestData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const listMusterRequests = async () => {
  const token = await getToken();
  const response = await axios.get(`${API_URL}/muster-request/list/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const editMusterRequest = async (requestId: number, requestData: any) => {
  const token = await getToken();
  const response = await axios.patch(`${API_URL}/muster-request/${requestId}/edit/`, requestData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
// Employee CRUD APIs
export const listEmployees = async () => {
  const token = await getToken();
  const response = await axios.get(`${API_URL}/employees/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateEmployee = async (employeeId: string, employeeData: any) => {
  const token = await getToken();
  const response = await axios.patch(`${API_URL}/employees/${employeeId}/update/`, employeeData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteEmployee = async (employeeId: string) => {
  const token = await getToken();
  const response = await axios.delete(`${API_URL}/employees/${employeeId}/delete/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};