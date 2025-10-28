import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  View,
} from "react-native";
import {
  useRoute,
  useNavigation,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/types/types";
import * as SecureStore from "expo-secure-store";
import { updatePlan, createPlan, getPlansByDay } from "@/api/plan";

export default function WorkoutDayScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "WorkoutDay">>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { day, workout } = route.params;

  const [workoutName, setWorkoutName] = useState(workout);
  const [workoutExercises, setWorkoutExercises] = useState<
    { id: number; name: string; sets: number; reps: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Load plan and exercises from backend
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
          setWorkoutName(plan.name || workout);
          // Once backend includes exercises for plan, map them here:
          setWorkoutExercises(plan.exercises || []);
          console.log("Loaded plan:", plan);
        } else {
          setWorkoutExercises([]);
          console.log("No plan found for this day.");
        }
      } catch (error) {
        console.error("Failed to load plan data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlanData();
  }, [day]);
  const saveWorkoutName = async (newName: string) => {
    try {
      const googleId = await SecureStore.getItemAsync("googleId");
      if (!googleId) return;
  
      const plans = await getPlansByDay(googleId, day);
      if (plans.length > 0) {
        // Plan exists → update it
        const planId = plans[0].id;
        await updatePlan(planId, { googleId, name: newName, day });
      } else {
        // Plan doesn’t exist → create it
        await createPlan({ googleId, name: newName, day });
      }
    } catch (err) {
      console.error("Error saving workout name:", err);
    }
  };
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading workouts...</ThemedText>
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
        <ThemedText type="title">{day}:</ThemedText>
        <TextInput
  style={styles.inputBox}
  value={workoutName}
  onChangeText={async (text) => {
    setWorkoutName(text);

    try {
      const googleId = await SecureStore.getItemAsync("googleId");
      if (!googleId) return;

      const plans = await getPlansByDay(googleId, day);

      if (plans.length > 0) {

        const planId = plans[0].id;
        await updatePlan(planId, { googleId, name: text, day });
        console.log(`Updated plan ${planId} to "${text}"`);
      } else {

        await createPlan({ googleId, name: text, day });
        console.log(`Created new plan "${text}" for ${day}`);
      }
    } catch (err) {
      console.error("Error saving workout name:", err);
    }
  }}
  placeholder="Enter Workout Name"
  placeholderTextColor="#888"
/>
      </View>

      <ThemedText type="subtitle" style={styles.workoutListTitle}>
        Workout Exercises:
      </ThemedText>

      {workoutExercises.length > 0 ? (
        <FlatList
  data={workoutExercises}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <ThemedText style={styles.workoutItem}>
      • {item.name} - {item.sets} sets x {item.reps} reps
    </ThemedText>
  )}
/>
      ) : (
        <ThemedText style={styles.emptyText}>
          No exercises added yet.
        </ThemedText>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("AddWorkout", {day,
            workoutPlanName: workoutName,
          })
        }
      >
        <ThemedText type="default">Add Workout</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("EditWorkout", { day })}
      >
        <ThemedText type="default">Edit Workout</ThemedText>
      </TouchableOpacity>
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
    marginBottom: 20,
    gap: 10,
  },
  inputBox: {
    borderWidth: 2,
    borderColor: "#ccc",
    fontSize: 25,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flex: 1,
    color: "#333",
    borderRadius: 5,
  },
  workoutListTitle: {
    marginBottom: 15,
    fontSize: 25,
    color: "#555",
  },
  workoutList: {
    marginBottom: 30,
  },
  workoutItem: {
    fontSize: 18,
    marginBottom: 10,
    color: "#444",
    fontStyle: "italic",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#888",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 30,
  },
});
