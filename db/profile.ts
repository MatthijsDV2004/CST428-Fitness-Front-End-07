import * as SQLite from "expo-sqlite";
import type { Profile, User } from "@/types/types";

/**
 * Creates a new profile row for the given user if none exists.
 */
export const createProfile = async (
  profile: Profile
): Promise<Profile | null> => {
  try {
    const db = await SQLite.openDatabaseAsync("flexzone_database.db");

    // 1️⃣ Check if the profile already exists for this user
    const existing = await db.getFirstAsync<Profile>(
      "SELECT * FROM profile WHERE user_id = ?",
      [profile.user_id]
    );

    if (existing) {
      console.log("Profile already exists:", existing);
      return existing;
    }

    // 2️⃣ Insert new profile
    await db.runAsync(
      "INSERT INTO profile (user_id, age, weight, height, skill_level) VALUES (?, ?, ?, ?, ?)",
      [
        profile.user_id,
        profile.age,
        profile.weight,
        profile.height,
        profile.skill_level ?? "Beginner", // default
      ]
    );

    // 3️⃣ Fetch and return the new record
    const inserted = await db.getFirstAsync<Profile>(
      "SELECT * FROM profile WHERE user_id = ?",
      [profile.user_id]
    );

    console.log("✅ Created new profile:", inserted);
    return inserted ?? null;
  } catch (err) {
    console.error("❌ Error creating profile:", err);
    return null;
  }
};

/**
 * Retrieves user + profile data for the given user email.
 */
export async function getProfile(
  email: string
): Promise<{ user: User; profile: Profile | null }> {
  const db = await SQLite.openDatabaseAsync("flexzone_database.db");

  const user = await db.getFirstAsync<User>(
    "SELECT * FROM user WHERE email = ?",
    [email]
  );

  if (!user) {
    throw new Error(`User not found for email: ${email}`);
  }

  const profile = await db.getFirstAsync<Profile>(
    "SELECT * FROM profile WHERE user_id = ?",
    [user.g_id]
  );

  return { user, profile: profile ?? null };
}
