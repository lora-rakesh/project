import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://127.0.0.1:8000/api";

// Helper to get token from AsyncStorage
const getToken = async () => {
  const tokenString = await AsyncStorage.getItem("userToken");
  const tokenData = tokenString ? JSON.parse(tokenString) : null;
  return tokenData?.access || null;
}

export const loginUser = async (employeeId: string, password: string) => {
  return axios.post(`${API_URL}/login/`, {
    employee_id: employeeId,
    password: password,
  });
};

// Clock functions
export const clockIn = async (employeeId: any) => {
  const token = await getToken();
  return axios.post(`${API_URL}/clock_in/`, {}, { headers: { Authorization: `Bearer ${token}` } });
};
export const clockOut = async () => {
  const token = await getToken();
  return axios.post(`${API_URL}/clock_out/`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

// Lunch functions
export const lunchIn = async () => {
  const token = await getToken();
  return axios.post(`${API_URL}/lunch_in/`, {}, { headers: { Authorization: `Bearer ${token}` } });
};
export const lunchOut = async () => {
  const token = await getToken();
  return axios.post(`${API_URL}/lunch_out/`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

// Break functions
export const breakIn = async () => {
  const token = await getToken();
  return axios.post(`${API_URL}/break_in/`, {}, { headers: { Authorization: `Bearer ${token}` } });
};
export const breakOut = async () => {
  const token = await getToken();
  return axios.post(`${API_URL}/break_out/`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

// Update profile
export const updateProfile = async (data: any) => {
  const token = await getToken();
  return axios.put(`${API_URL}/update_profile/`, data, { headers: { Authorization: `Bearer ${token}` } });
};

export const registerEmployee = async (userData: any) => {
  const token = await AsyncStorage.getItem("userToken");
  const parsed = token ? JSON.parse(token) : null;

  return axios.post(`${API_URL}/register-employee/`, userData, {
    headers: parsed ? { Authorization: `Bearer ${parsed.access}` } : {},
  });
};

