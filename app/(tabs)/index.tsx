import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { HelloWave } from "@/components/HelloWave";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types";
import { ProfilePic } from "@/components/ProfilePic";
import useProfile from "@/hooks/useProfile";
import * as SecureStore from "expo-secure-store";
import { getPlansByDay, createPlan } from "@/api/plan";

const workoutDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function HomeScreen() {
  const { profile } = useProfile();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [plans, setPlans] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlans = async () => {
    try {
      const googleId =
        profile?.user?.g_id || (await SecureStore.getItemAsync("googleId"));

      if (!googleId) {
        console.warn("⚠️ No Google ID found, skipping plan fetch.");
        setPlans({});
        return;
      }

      const allPlans: Record<string, string> = {};

      for (const day of workoutDays) {
        const data = await getPlansByDay(googleId, day);
        allPlans[day] = data.length > 0 ? data[0].name : "Rest Day";
      }

      setPlans(allPlans);
    } catch (error) {
      console.error("❌ Error fetching plans:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlans();
  };

  const handleDayPress = async (day: string) => {
    const workout = plans[day] || "Rest Day";
    navigation.navigate("WorkoutDay", { day, workout });
  };

  const handleCreatePlan = async (day: string) => {
    try {
      const googleId =
        profile?.user?.g_id || (await SecureStore.getItemAsync("googleId"));
      if (!googleId) return;
      await createPlan({
        googleId,
        name: `${day} Plan`,
        day,
      });
      await fetchPlans();
    } catch (err) {
      console.error("❌ Error creating plan:", err);
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#888" />
        <ThemedText style={styles.loadingText}>Loading your plans...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.welcomeText}>
            Welcome,{" "}
            {profile?.user?.username
              ? profile.user.username.split(" ")[0]
              : "User"}
          </ThemedText>
          <HelloWave />
        </View>
        <View style={styles.headerRight}>
          <ProfilePic uri={profile?.user?.profile_pic ?? null} />
        </View>
      </View>

      <View style={styles.subHeader}>
        <ThemedText type="subtitle">Your Current Split</ThemedText>
        <View style={styles.subHeaderDate}>
          <ThemedText type="default">{formattedDate}</ThemedText>
        </View>
      </View>

      <FlatList
        data={workoutDays}
        keyExtractor={(item) => item}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleDayPress(item)}
            onLongPress={() => handleCreatePlan(item)}
          >
            <ThemedText type="title" style={styles.cardTitle}>
              {item}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
              {plans[item] || "Rest Day"}
            </ThemedText>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.cardList}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F7F8FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerRight: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: "bold",
  },
  subHeader: {
    marginBottom: 20,
    alignItems: "flex-start",
  },
  subHeaderDate: {
    fontSize: 16,
    color: "#888",
    marginBottom: 1,
    marginTop: 1,
  },
  cardList: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
  },
});
