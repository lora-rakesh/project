import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://127.0.0.1:8000/api";

export const loginUser = async (employeeId: string, password: string) => {
  return axios.post(`${API_URL}/login/`, {
    employee_id: employeeId,
    password: password,
  });
};

export const registerEmployee = async (userData: any) => {
  const token = await AsyncStorage.getItem("userToken");
  const parsed = token ? JSON.parse(token) : null;

  return axios.post(`${API_URL}/register-employee/`, userData, {
    headers: parsed ? { Authorization: `Bearer ${parsed.access}` } : {},
  });
};
export const clockIn = async (token: string) => {
  return axios.post(
    `${API_URL}/api/clock_in/`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Clock out
export const clockOut = async (token: string) => {
  return axios.post(
    `${API_URL}/api/clock_out/`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Lunch in
export const lunchIn = async (token: string) => {
  return axios.post(`${API_URL}/api/lunch_in/`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

// Lunch out
export const lunchOut = async (token: string) => {
  return axios.post(`${API_URL}/api/lunch_out/`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

// Break in
export const breakIn = async (token: string) => {
  return axios.post(`${API_URL}/api/break_in/`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

// Break out
export const breakOut = async (token: string) => {
  return axios.post(`${API_URL}/api/break_out/`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

// Update profile
export const updateProfile = async (token: string, data: any) => {
  return axios.put(`${API_URL}/api/update_profile/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

