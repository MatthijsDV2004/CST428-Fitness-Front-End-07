import React from "react";
import { Image, StyleSheet } from "react-native";

type ProfilePicProps = {
  size?: number;
  uri?: string | null;
};

export function ProfilePic({ size = 50, uri }: ProfilePicProps) {
  // ✅ Only render if a valid URI is provided
  if (!uri || uri.length === 0) return null;

  return <Image source={{ uri }} style={[styles.image, { width: size, height: size }]} />;
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 9999,
  },
});
