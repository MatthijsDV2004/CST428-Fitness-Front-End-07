import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ProfileScreen from "../app/(tabs)/profile";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ProfilePic } from "@/components/ProfilePic";
import { useSession } from "@/hooks/ctx";
import useProfile from "@/hooks/useProfile";

// --- Mock dependencies ---
jest.mock("@/hooks/ctx");
jest.mock("@/hooks/useProfile");
jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: any) => <>{children}</>,
}));
jest.mock("@/components/ThemedText", () => {
  const { Text } = require("react-native");
  return { ThemedText: ({ children }: any) => <Text>{children}</Text> };
});
jest.mock("@/components/ProfilePic", () => ({
  ProfilePic: jest.fn(() => null),
}));

describe("ProfileScreen", () => {
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({ signOut: mockSignOut });
  });

  it("renders username and email correctly", () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: {
        user: {
          username: "Matthijs",
          email: "matthijs@example.com",
          profile_pic: "https://example.com/pic.jpg",
        },
      },
    });

    const { getByText } = render(<ProfileScreen />);
    

    expect(getByText("Matthijs")).toBeTruthy();
    expect(getByText("matthijs@example.com")).toBeTruthy();
  });

  it("passes correct uri prop to ProfilePic", () => {
    const mockProfile = {
      user: {
        username: "Matthijs",
        email: "matthijs@example.com",
        profile_pic: "https://example.com/avatar.png",
      },
    };
    (useProfile as jest.Mock).mockReturnValue({ profile: mockProfile });
  
    render(<ProfileScreen />);
  
    const calls = (ProfilePic as jest.Mock).mock.calls;
    expect(calls.length).toBe(1);
  
    const [props] = calls[0];
    expect(props).toEqual(expect.objectContaining({ uri: "https://example.com/avatar.png" }));
  });

  it("calls signOut when Sign Out button is pressed", () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: { user: { username: "Matthijs", email: "m@x.com" } },
    });

    const { getByText } = render(<ProfileScreen />);
    fireEvent.press(getByText("Sign Out"));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("handles missing profile gracefully", () => {
    (useProfile as jest.Mock).mockReturnValue({ profile: null });

    const { getByText } = render(<ProfileScreen />);
    // Should still render "Sign Out" even without profile
    expect(getByText("Sign Out")).toBeTruthy();
  });
});
