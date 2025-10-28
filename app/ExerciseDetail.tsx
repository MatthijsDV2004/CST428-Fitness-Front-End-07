import React, { useEffect, useState, useMemo } from "react";
import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import type { RootStackParamList, Exercise } from "@/types/types";
import { getWorkoutDetail } from "@/api/workOutAPI";

type ExerciseDetailRouteProp = RouteProp<RootStackParamList, "ExerciseDetail">;

export default function ExerciseDetailScreen() {
  const route = useRoute<ExerciseDetailRouteProp>();
  const { exercise } = route.params;
  const router = useRouter();

  const [exerciseDetail, setExerciseDetail] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const detail = await getWorkoutDetail(exercise.workoutID);
        if (active) setExerciseDetail(detail);
      } catch (err) {
        console.error("Error fetching exercise detail:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [exercise.workoutID]);

  const videoUrl =
    (exerciseDetail && exerciseDetail.videoUrl?.trim()) || "about:blank";

  const source = useMemo(() => ({ uri: videoUrl }), [videoUrl]);

  const player = useVideoPlayer(source, (p) => {
    const hasValidVideo =
      !!exerciseDetail?.videoUrl && exerciseDetail.videoUrl.trim().length > 0;
    p.loop = hasValidVideo;
    if (hasValidVideo) {
      p.volume = 1.0;
      p.play();
    } else {
      p.pause();
    }
  });


  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading exercise details...</ThemedText>
      </ThemedView>
    );
  }

  if (!exerciseDetail) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Exercise details not available.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/explore")}
      >
        <ThemedText style={styles.backButtonText}>← Back</ThemedText>
      </TouchableOpacity>

      <ThemedText type="title" style={styles.title}>
        {exerciseDetail.workoutName}
      </ThemedText>

      <ScrollView style={styles.scrollItem}>
        <ThemedText style={styles.exerciseItem}>
          Muscle Group: {exerciseDetail.muscleGroup}
        </ThemedText>

        <VideoView
          style={styles.video}
          player={player}
          fullscreenOptions={{
            enable: true,
            orientation: "portrait",
            autoExitOnRotate: true
          }}
          
          // @ts-ignore
          allowsPictureInPicture
          // @ts-ignore
          contentFit="contain"
        />

        {!exerciseDetail.videoUrl?.trim().length && (
          <ThemedText>No instructional video available</ThemedText>
        )}

        <ThemedText style={styles.exerciseItem}>
          Description: {exerciseDetail.workoutDesc}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { marginBottom: 20 },
  backButton: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  backButtonText: { fontSize: 16, color: "#000" },
  scrollItem: { flexGrow: 1 },
  video: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },
  exerciseItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
});
