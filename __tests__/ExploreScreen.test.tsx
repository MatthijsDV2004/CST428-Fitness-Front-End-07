import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ExploreScreen from "../app/(tabs)/explore";
import { getWorkouts } from "@/api/workOutAPI";
import { useNavigation } from "@react-navigation/native";
import { Text } from "react-native";

jest.mock("@/api/workOutAPI");
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));
jest.mock("@/components/ThemedText", () => {
    const { Text } = require("react-native");
    return {
      ThemedText: ({ children }: any) => <Text>{children}</Text>,
    };
  });
jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: any) => <>{children}</>,
}));

jest.useFakeTimers(); // ✅ use fake timers to control debounce

describe("ExploreScreen", () => {
  const mockNavigate = jest.fn();
  const mockGetWorkouts = getWorkouts as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
  });

  it("renders title and search bar", async () => {
    const { getByText, getByPlaceholderText } = render(<ExploreScreen />);
    await waitFor(() => expect(getByText("Explore Exercises")).toBeTruthy());
    expect(getByPlaceholderText("Search exercises...")).toBeTruthy();
  });

  it("shows loading indicator while fetching", async () => {
    mockGetWorkouts.mockImplementation(() => new Promise(() => {})); // never resolves
    const { getByPlaceholderText, getByTestId } = render(<ExploreScreen />);

    fireEvent.changeText(getByPlaceholderText("Search exercises..."), "push");

    // Fast-forward debounce delay
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => expect(getByTestId("loading-indicator")).toBeTruthy());
  });

  it("renders exercises after fetching data", async () => {
    mockGetWorkouts.mockResolvedValueOnce([
      {
        workoutID: 1,
        workoutName: "Push-Up",
        muscleGroup: "Chest",
        workoutDesc: "A classic push exercise",
      },
    ]);

    const { getByText } = render(<ExploreScreen />);
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => expect(getByText("Push-Up")).toBeTruthy());
    expect(getByText("Chest")).toBeTruthy();
    expect(getByText("A classic push exercise")).toBeTruthy();
  });

  it("shows 'No exercises found.' when API returns empty", async () => {
    mockGetWorkouts.mockResolvedValueOnce([]);

    const { getByText } = render(<ExploreScreen />);
    await act(async () => {
        jest.advanceTimersByTime(300);
        await Promise.resolve(); // flush microtasks
      });

    await waitFor(() =>
      expect(getByText("No exercises found.")).toBeTruthy()
    );
  });

  it("navigates to ExerciseDetail on press", async () => {
    const mockData = [
      {
        workoutID: 1,
        workoutName: "Squat",
        muscleGroup: "Legs",
        workoutDesc: "Builds leg strength",
      },
    ];
    mockGetWorkouts.mockResolvedValueOnce(mockData);

    const { getByText } = render(<ExploreScreen />);
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => getByText("Squat"));
    fireEvent.press(getByText("Squat"));
    expect(mockNavigate).toHaveBeenCalledWith("ExerciseDetail", {
      exercise: mockData[0],
    });
  });
});
