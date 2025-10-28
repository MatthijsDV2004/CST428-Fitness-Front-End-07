import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ??
  "https://cst438-d5640ff12bdc.herokuapp.com";

async function authHeader() {
  const jwt = await SecureStore.getItemAsync("jwt");
  return { Authorization: `Bearer ${jwt}` };
}

export const getPlans = async (googleId: string) => {
  const headers = await authHeader();
  const { data } = await axios.get(`${API_BASE_URL}/plans`, {
    headers,
    params: { googleId },
  });
  return data;
};

export const getPlansByDay = async (googleId: string, day: string) => {
  const headers = await authHeader();
  const { data } = await axios.get(`${API_BASE_URL}/plans/day`, {
    headers,
    params: { googleId, day },
  });
  return data;
};

export const createPlan = async (plan: {
  googleId: string;
  name: string;
  day: string;
}) => {
  const headers = await authHeader();
  const { data } = await axios.post(`${API_BASE_URL}/plans`, plan, { headers });
  return data;
};

export const updatePlan = async (
  id: number,
  plan: { googleId: string; name: string; day: string }
) => {
  const headers = await authHeader();
  const { data } = await axios.put(`${API_BASE_URL}/plans/${id}`, plan, {
    headers,
  });
  return data;
};

export const deletePlan = async (id: number) => {
  const headers = await authHeader();
  await axios.delete(`${API_BASE_URL}/plans/${id}`, { headers });
};

export const addExerciseToPlan = async (
  planId: number,
  exercise: { name: string; sets: number; reps: number }
) => {
  const headers = await authHeader();
  const { data } = await axios.post(
    `${API_BASE_URL}/plans/${planId}/addExercise`,
    exercise,
    { headers }
  );
  return data;
};

export const updateExerciseInPlan = async (
  planId: number,
  name: string,
  exercise: { sets: number; reps: number }
) => {
  const headers = await authHeader();
  const { data } = await axios.put(
    `${API_BASE_URL}/plans/${planId}/exercise/${encodeURIComponent(name)}`,
    exercise,
    { headers }
  );
  return data;
};

export const deleteExerciseFromPlan = async (planId: number, name: string) => {
  const headers = await authHeader();
  const { data } = await axios.delete(
    `${API_BASE_URL}/plans/${planId}/exercise/${encodeURIComponent(name)}`,
    { headers }
  );
  return data;
};
