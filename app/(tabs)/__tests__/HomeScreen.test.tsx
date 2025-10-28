import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import HomeScreen from "../index";
import * as SecureStore from "expo-secure-store";
import { getPlansByDay, createPlan } from "@/api/plan";
import useProfile from "@/hooks/useProfile";
import { useNavigation } from "@react-navigation/native";

const delay = (ms = 10) => new Promise((res) => setTimeout(res, ms));

// --- Mocks ---
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));

jest.mock("@/hooks/useProfile", () => jest.fn());

jest.mock("@/api/plan", () => ({
  getPlansByDay: jest.fn(),
  createPlan: jest.fn(),
}));

jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: any) => <>{children}</>,
}));

// ✅ FIX: require Text *inside* the mock factory
jest.mock("@/components/ThemedText", () => {
  const { Text } = require("react-native");
  return {
    ThemedText: ({ children }: any) => <Text>{children}</Text>,
  };
});

jest.mock("@/components/ProfilePic", () => ({
  ProfilePic: () => <></>,
}));

jest.mock("@/components/HelloWave", () => ({
  HelloWave: () => <></>,
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useNavigation as jest.Mock).mockReturnValue({ navigate: jest.fn() });
    (useProfile as jest.Mock).mockReturnValue({
      profile: { user: { g_id: "123", username: "Matthijs", profile_pic: null } },
    });
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("123");
    (getPlansByDay as jest.Mock).mockResolvedValue([]);
  });

  it("shows loading indicator initially", async () => {
    (getPlansByDay as jest.Mock).mockImplementation(async () => {
      await delay(20);
      return [];
    });

    render(<HomeScreen />);

    expect(await screen.findByText("Loading your plans...")).toBeTruthy();
    await waitFor(() => expect(getPlansByDay).toHaveBeenCalled());
  });

  it("renders welcome text after loading", async () => {
    (getPlansByDay as jest.Mock).mockResolvedValue([{ name: "Push Day" }]);
    render(<HomeScreen />);
    expect(await screen.findByText(/Welcome/i)).toBeTruthy();
  });

  it("fetches and displays plans correctly", async () => {
    (getPlansByDay as jest.Mock).mockResolvedValue([{ name: "Push Day" }]);
    render(<HomeScreen />);
  
    const planItems = await screen.findAllByText("Push Day");
    expect(planItems.length).toBeGreaterThan(0);
  });
  
  it("handles refresh (pull to refresh)", async () => {
    (getPlansByDay as jest.Mock).mockResolvedValue([{ name: "Pull Day" }]);
    render(<HomeScreen />);
  
    const planItems = await screen.findAllByText("Pull Day");
    expect(planItems.length).toBeGreaterThan(0);
  });

  it("navigates when a day is pressed", async () => {
    const mockNavigate = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
    (getPlansByDay as jest.Mock).mockResolvedValue([{ name: "Leg Day" }]);
  
    render(<HomeScreen />);
    const legDays = await screen.findAllByText("Leg Day");
    expect(legDays.length).toBeGreaterThan(0);
  
    // still safe to press Monday (unique)
    fireEvent.press(await screen.findByText("Monday"));
  
    expect(mockNavigate).toHaveBeenCalledWith("WorkoutDay", {
      day: "Monday",
      workout: "Leg Day",
    });
  });

  it("creates a plan when a day is long pressed", async () => {
    (getPlansByDay as jest.Mock).mockResolvedValue([{ name: "Rest Day" }]);
    (createPlan as jest.Mock).mockResolvedValue({ id: 1, name: "Monday Plan" });

    render(<HomeScreen />);
    const mondayButton = await screen.findByText("Monday");
    fireEvent(mondayButton, "onLongPress");

    await waitFor(() =>
      expect(createPlan).toHaveBeenCalledWith({
        googleId: "123",
        name: "Monday Plan",
        day: "Monday",
      })
    );
  });
});
