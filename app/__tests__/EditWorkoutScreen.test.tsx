import React from "react";
import { render, waitFor, fireEvent, act } from "@testing-library/react-native";
import EditWorkoutScreen from "../EditWorkout";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { getPlansByDay, updateExerciseInPlan, deleteExerciseFromPlan } from "@/api/plan";
import { Text } from "react-native";
beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
// --- 🔧 Mock dependencies ---
jest.mock("@/api/plan");
jest.mock("expo-secure-store");
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));
jest.mock("@/components/ThemedText", () => {
  const { Text } = require("react-native");
  return { ThemedText: ({ children }: any) => <Text>{children}</Text> };
});
jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: any) => <>{children}</>,
}));

describe("EditWorkoutScreen", () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();
  const mockGetPlansByDay = getPlansByDay as jest.Mock;
  const mockUpdateExerciseInPlan = updateExerciseInPlan as jest.Mock;
  const mockDeleteExerciseFromPlan = deleteExerciseFromPlan as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ goBack: mockGoBack, navigate: mockNavigate });
    (useRoute as jest.Mock).mockReturnValue({ params: { day: "Monday" } });
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("mockGoogleId");
  });

  it("shows loading state initially", async () => {
    mockGetPlansByDay.mockResolvedValueOnce([]);
    const { getByText } = render(<EditWorkoutScreen />);
    expect(getByText("Loading plan...")).toBeTruthy();
  });

  it("renders exercises after fetching plan", async () => {
    mockGetPlansByDay.mockResolvedValueOnce([
      {
        id: 1,
        exercises: [
          { name: "Bench Press", sets: 3, reps: 10 },
          { name: "Push-Up", sets: 4, reps: 15 },
        ],
      },
    ]);

    const { getByText } = render(<EditWorkoutScreen />);

    await waitFor(() => getByText("Bench Press"));
    expect(getByText("Push-Up")).toBeTruthy();
    expect(getByText("Edit Workout - ")).toBeTruthy();
    expect(getByText("Monday")).toBeTruthy();
  });

  it("calls updateExerciseInPlan when changing sets", async () => {
    mockGetPlansByDay.mockResolvedValueOnce([
      { id: 1, exercises: [{ name: "Squat", sets: 3, reps: 10 }] },
    ]);

    const { getByDisplayValue } = render(<EditWorkoutScreen />);

    await waitFor(() => getByDisplayValue("3"));
    const setsInput = getByDisplayValue("3");

    await act(async () => {
      fireEvent.changeText(setsInput, "5");
    });

    expect(mockUpdateExerciseInPlan).toHaveBeenCalledWith(1, "Squat", { sets: 5, reps: 10 });
  });

  it("calls deleteExerciseFromPlan when delete button pressed", async () => {
    mockGetPlansByDay.mockResolvedValueOnce([
      { id: 1, exercises: [{ name: "Bench Press", sets: 3, reps: 10 }] },
    ]);

    const { getByText } = render(<EditWorkoutScreen />);
    await waitFor(() => getByText("Bench Press"));

    fireEvent.press(getByText("🗑️"));
    await waitFor(() =>
      expect(mockDeleteExerciseFromPlan).toHaveBeenCalledWith(1, "Bench Press")
    );
  });

  it("navigates back when back arrow pressed", async () => {
    mockGetPlansByDay.mockResolvedValueOnce([
      { id: 1, exercises: [{ name: "Bench Press", sets: 3, reps: 10 }] },
    ]);

    const { getByText } = render(<EditWorkoutScreen />);
    await waitFor(() => getByText("Bench Press"));

    fireEvent.press(getByText("←"));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("shows message when no plan exists", async () => {
    mockGetPlansByDay.mockResolvedValueOnce([]);
    const { getByText } = render(<EditWorkoutScreen />);
    await waitFor(() => getByText("No exercises in this plan yet."));
    expect(getByText("No exercises in this plan yet.")).toBeTruthy();
  });
});
