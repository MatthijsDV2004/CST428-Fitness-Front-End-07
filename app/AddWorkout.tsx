import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  View,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList, Exercise } from "@/types/types";
import {
  getPlansByDay,
  createPlan,
  addExerciseToPlan,
} from "@/api/plan";
import { getWorkouts } from "@/api/workOutAPI";
import * as SecureStore from "expo-secure-store";

export default function AddWorkoutScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "AddWorkout">>();
  const navigation = useNavigation();
  const { day, workoutPlanName } = route.params;

  const [searchTerm, setSearchTerm] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");

  useEffect(() => {
    if (searchTerm.trim().length < 1) {
      setExercises([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await getWorkouts({ name: searchTerm });
        setExercises(results);
      } catch (err) {
        console.error("Error fetching workouts:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const addWorkout = async () => {
    if (!selectedExercise || !sets || !reps) {
      alert("⚠️ Please select an exercise and enter sets/reps.");
      return;
    }

    try {
      const googleId = await SecureStore.getItemAsync("googleId");
      if (!googleId) {
        alert("⚠️ Google ID not found. Please sign in again.");
        return;
      }

      const existing = await getPlansByDay(googleId, day);
      let planId: number;

      if (existing.length > 0) {
        planId = existing[0].id;
      } else {
        const newPlan = await createPlan({ googleId, name: workoutPlanName, day });
        planId = newPlan.id;
      }

      await addExerciseToPlan(planId, {
        name: selectedExercise.workoutName,
        sets: parseInt(sets),
        reps: parseInt(reps),
      });

      alert(`Added ${selectedExercise.workoutName} to ${day}!`);
      setSelectedExercise(null);
      setSets("");
      setReps("");
      setSearchTerm("");
      setExercises([]);
      Keyboard.dismiss();
    } catch (error) {
      console.error("Error adding exercise:", error);
      alert("Failed to add exercise. Try again.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ThemedText style={styles.backArrow}>←</ThemedText>
      </TouchableOpacity>

      <ThemedText type="title" style={{ marginBottom: 10 }}>
        Add a Workout
      </ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Search for an exercise..."
        value={searchTerm}
        onChangeText={(text) => setSearchTerm(text)}
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#888" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.workoutID.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedExercise(item);
                setSearchTerm(item.workoutName);
                setExercises([]);
              }}
            >
              <ThemedView style={styles.exerciseCard}>
                <ThemedText style={styles.exerciseTitle}>{item.workoutName}</ThemedText>
                <ThemedText>{item.muscleGroup}</ThemedText>
                <ThemedText style={{ fontStyle: "italic" }}>
                  {item.workoutDesc}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.exerciseList}
        />
      )}

      {selectedExercise && (
        <View style={{ marginTop: 20 }}>
          <ThemedText type="subtitle">{selectedExercise.workoutName}</ThemedText>

          <ThemedText style={styles.label}>Sets</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Number of Sets"
            keyboardType="numeric"
            value={sets}
            onChangeText={setSets}
          />

          <ThemedText style={styles.label}>Reps</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Number of Reps"
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
          />

          <TouchableOpacity style={styles.button} onPress={addWorkout}>
            <ThemedText style={styles.buttonText}>Add Workout</ThemedText>
          </TouchableOpacity>
        </View>
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
    marginBottom: 10,
  },
  backArrow: {
    fontSize: 40,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 15,
  },
  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  exerciseList: {
    paddingBottom: 20,
  },
  label: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#4CAF50",
    marginTop: 25,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
