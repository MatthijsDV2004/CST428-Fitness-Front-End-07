import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getWorkouts } from "@/api/workOutAPI";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Exercise, RootStackParamList } from "@/types/types";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export default function ExploreScreen() {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "ExerciseDetail">>();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const muscles = [
    { label: "All", value: "" },
    { label: "Chest", value: "Chest" },
    { label: "Back", value: "Back" },
    { label: "Legs", value: "Legs" },
    { label: "Shoulders", value: "Shoulders" },
    { label: "Arms", value: "Arms" },
    { label: "Core", value: "Core" },
    { label: "Full Body", value: "Full Body" },
  ];

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (searchTerm) params.name = searchTerm;
        if (selectedMuscle) params.muscle = selectedMuscle;

        const data = await getWorkouts(params);
        setExercises(data);
      } catch (err) {
        console.error("Error fetching exercises:", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchExercises, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedMuscle]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Explore Exercises</ThemedText>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search exercises..."
        placeholderTextColor="#888"
        value={searchTerm}
        onChangeText={setSearchTerm}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Picker
        selectedValue={selectedMuscle}
        onValueChange={(itemValue) => setSelectedMuscle(itemValue)}
        style={styles.picker}
      >
        {muscles.map((muscle, index) => (
          <Picker.Item key={index} label={muscle.label} value={muscle.value} />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator testID="loading-indicator"  size="large" color="#888" style={{ marginTop: 30 }} />

      ) : exercises.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            No exercises found.
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.workoutID.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ExerciseDetail", { exercise: item })
              }
            >
              <ThemedView style={styles.exerciseCard}>
                <ThemedText style={styles.exerciseTitle}>
                  {item.workoutName}
                </ThemedText>
                <ThemedText style={styles.muscleGroup}>
                  {item.muscleGroup}
                </ThemedText>
                <ThemedText style={styles.description}>
                  {item.workoutDesc}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.exerciseList}
        />
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
  header: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ccc",
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  exerciseList: {
    paddingBottom: 40,
  },
  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  muscleGroup: {
    fontSize: 15,
    color: "#666",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#444",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
});
