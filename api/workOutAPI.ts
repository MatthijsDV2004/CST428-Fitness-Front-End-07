import { Exercise } from "@/types/types";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const LOCAL_IP = "10.11.116.234";
const LOCAL_URL = `http://${LOCAL_IP}:8080`;
const PROD_URL = "https://cst438-d5640ff12bdc.herokuapp.com";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? LOCAL_URL : PROD_URL);

console.log("🔗 Fetching workouts from:", `${API_BASE_URL}/getWorkouts`);

export const getWorkouts = async (params: Record<string, any> = {}) => {
  try {
    const jwt = await SecureStore.getItemAsync("jwt");

    const { data } = await axios.get(`${API_BASE_URL}/getWorkouts`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      params,
    });

    return data;
  } catch (error: any) {
    console.error(
      "❌ Error fetching workouts:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const getWorkoutDetail = async (id: number): Promise<Exercise> => {
    const jwt = await SecureStore.getItemAsync("jwt");
    const { data } = await axios.get(`${API_BASE_URL}/getWorkouts/${id}`,{
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      params: { id},
    });
    return data;
  };
