import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/types/types";
import {
  getPlansByDay,
  updateExerciseInPlan,
  deleteExerciseFromPlan,
} from "@/api/plan";
import * as SecureStore from "expo-secure-store";

export default function EditWorkoutScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "EditWorkout">>();
  const navigation = useNavigation();
  const { day } = route.params;

  const [workoutExercises, setWorkoutExercises] = useState<
    { name: string; sets: number; reps: number }[]
  >([]);
  const [planId, setPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load exercises for this day from backend
  useEffect(() => {
    const loadPlanData = async () => {
      try {
        const googleId = await SecureStore.getItemAsync("googleId");
        if (!googleId) {
          console.error("No Google ID found");
          return;
        }

        const plans = await getPlansByDay(googleId, day);
        if (plans.length > 0) {
          const plan = plans[0];
          setPlanId(plan.id);
          setWorkoutExercises(plan.exercises || []); // backend should eventually return exercises
          console.log("✅ Loaded plan for editing:", plan);
        } else {
          console.warn("ℹ️ No plan found for this day");
          setWorkoutExercises([]);
        }
      } catch (error) {
        console.error("❌ Failed to load plan data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlanData();
  }, [day]);

  // Update sets or reps for an exercise (backend future extension)
  const handleUpdateExercise = async (name: string, sets: number, reps: number) => {
    if (!planId) return;
    try {
      await updateExerciseInPlan(planId, name, { sets, reps });
      console.log("✅ Updated exercise:", name);
      setWorkoutExercises((prev) =>
        prev.map((ex) => (ex.name === name ? { ...ex, sets, reps } : ex))
      );
    } catch (err) {
      console.error("❌ Error updating exercise:", err);
    }
  };

  // Delete an exercise from the plan
  const handleDeleteExercise = async (name: string) => {
    if (!planId) return;
    try {
      await deleteExerciseFromPlan(planId, name);
      console.log("🗑️ Deleted exercise:", name);
      setWorkoutExercises((prev) =>
        prev.filter((exercise) => exercise.name !== name)
      );
    } catch (err) {
      console.error("❌ Error deleting exercise:", err);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading plan...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ThemedText style={styles.backArrow}>←</ThemedText>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <ThemedText type="title">Edit Workout - </ThemedText>
        <ThemedText style={styles.weekday}>{day}</ThemedText>
      </View>

      {workoutExercises.length > 0 ? (
        <FlatList
          data={workoutExercises}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View style={styles.exerciseContainer}>
              <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>

              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={item.sets.toString()}
                onChangeText={(text) =>
                  handleUpdateExercise(item.name, parseInt(text) || 0, item.reps)
                }
              />

              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={item.reps.toString()}
                onChangeText={(text) =>
                  handleUpdateExercise(item.name, item.sets, parseInt(text) || 0)
                }
              />

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteExercise(item.name)}
              >
                <ThemedText style={styles.deleteText}>🗑️</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.workoutList}
        />
      ) : (
        <ThemedText style={styles.emptyText}>
          No exercises in this plan yet.
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F7F8FA",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 40,
    color: "#333",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1,
  },
  exerciseContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  exerciseName: {
    fontSize: 18,
    flex: 2,
    color: "#444",
    fontStyle: "italic",
  },
  weekday: {
    fontSize: 24,
    fontStyle: "italic",
    color: "#888",
  },
  input: {
    width: 50,
    borderBottomWidth: 1,
    borderColor: "#000",
    textAlign: "center",
    fontSize: 16,
  },
  deleteButton: {
    padding: 5,
    backgroundColor: "red",
    borderRadius: 5,
  },
  deleteText: {
    color: "white",
    fontSize: 16,
  },
  workoutList: {
    marginBottom: 30,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    fontStyle: "italic",
  },
});
