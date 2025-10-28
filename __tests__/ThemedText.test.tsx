import React from "react";
import { render } from "@testing-library/react-native";
import { ThemedText } from "@/components/ThemedText";

describe("ThemedText", () => {
  it("renders children text", () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    expect(getByText("Hello World")).toBeTruthy();
  });

  it("applies custom style prop", () => {
    const { getByText } = render(
      <ThemedText style={{ color: "red" }}>Styled</ThemedText>
    );
    expect(getByText("Styled").props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: "red" })])
    );
  });
});
