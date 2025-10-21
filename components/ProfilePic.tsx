import React from "react";
import { Image, StyleSheet } from "react-native";

// ✅ Define props properly
type ProfilePicProps = {
  size?: number;
  uri?: string | null;
};

// ✅ Export a valid functional React component
export function ProfilePic({ size = 50, uri }: ProfilePicProps) {
  const source =
    uri && uri.length > 0
      ? { uri }
      : require("@/assets/images/default-profile.png");

  return <Image source={source} style={[styles.image, { width: size, height: size }]} />;
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 9999,
  },
});