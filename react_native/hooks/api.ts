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
