// db/profile.ts
import * as SQLite from "expo-sqlite";
import type { Profile, User } from "@/types/types";

const toNullableNumber = (v: any) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

export const createProfile = async (profile: Profile): Promise<Profile | null> => {
  try {
    const db = await SQLite.openDatabaseAsync("flexzone_database.db");

    const existing = await db.getFirstAsync<Profile>(
      "SELECT * FROM profile WHERE user_id = ?",
      [profile.user_id]
    );
    if (existing) return existing;

    // ✅ sanitize
    const age   = toNullableNumber(profile.age);
    const weight = toNullableNumber(profile.weight);
    const height = toNullableNumber(profile.height);
    const skill  = profile.skill_level ?? "Beginner";

    await db.runAsync(
      "INSERT INTO profile (user_id, age, weight, height, skill_level) VALUES (?, ?, ?, ?, ?)",
      [profile.user_id, age, weight, height, skill]
    );

    const inserted = await db.getFirstAsync<Profile>(
      "SELECT * FROM profile WHERE user_id = ?",
      [profile.user_id]
    );
    return inserted ?? null;
  } catch (e) {
    console.error("createProfile error:", e);
    return null;
  }
};

export const getProfile = async (email: string): Promise<{ user: User; profile: Profile | null } | null> => {
  const db = await SQLite.openDatabaseAsync("flexzone_database.db");
  const user = await db.getFirstAsync<User>(
    "SELECT * FROM user WHERE email = ?",
    [email]
  );
  if (!user) return null;

  const profile = await db.getFirstAsync<Profile>(
    "SELECT * FROM profile WHERE user_id = ?",
    [user.id]
  );
  return { user, profile: profile ?? null };
};
