import * as SQLite from "expo-sqlite";
import type { Profile, User } from "@/types/types";

export const createProfile = async (
  profile: Profile
): Promise<Profile | null> => {
  try {
    const db = await SQLite.openDatabaseAsync("flexzone_database.db");
    const existing = await db.getFirstAsync<Profile>(
      "SELECT * FROM profile WHERE user_id = ?",
      [profile.user_id]
    );

    if (existing) return existing;

    await db.runAsync(
      "INSERT INTO profile (user_id, age, weight, height, skill_level) VALUES (?, ?, ?, ?, ?)",
      [
        profile.user_id,
        profile.age,
        profile.weight,
        profile.height,
        profile.skill_level ?? "Beginner",
      ]
    );

    const inserted = await db.getFirstAsync<Profile>(
      "SELECT * FROM profile WHERE user_id = ?",
      [profile.user_id]
    );

    return inserted ?? null;
  } catch (err) {
    console.error("❌ Error creating profile:", err);
    return null;
  }
};

export async function getProfile(
  email: string
): Promise<{ user: User; profile: Profile | null }> {
  const db = await SQLite.openDatabaseAsync("flexzone_database.db");

  const user = await db.getFirstAsync<User>(
    "SELECT * FROM user WHERE email = ?",
    [email]
  );
  if (!user) throw new Error(`User not found for email: ${email}`);

  const profile = await db.getFirstAsync<Profile>(
    "SELECT * FROM profile WHERE user_id = ?",
    [user.id]
  );

  return { user, profile: profile ?? null };
}
