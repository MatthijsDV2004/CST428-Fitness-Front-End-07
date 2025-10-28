import type { SQLiteDatabase } from "expo-sqlite";
import type { Profile, User } from "@/types/types";
import { toNullableNumber } from "@/db/sanitize";

export type NewProfile = {
  user_id: number;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  skill_level?: string | null;
};

export function makeProfilesRepo(db: SQLiteDatabase) {
  return {
    async getByUserId(userId: number): Promise<Profile | null> {
      return db.getFirstAsync<Profile>("SELECT * FROM profile WHERE user_id = ?", [userId]);
    },

    async getUserAndProfileByEmail(
      email: string
    ): Promise<{ user: User; profile: Profile | null } | null> {
      const user = await db.getFirstAsync<User>("SELECT * FROM user WHERE email = ?", [email]);
      if (!user) return null;

      const profile = await db.getFirstAsync<Profile>(
        "SELECT * FROM profile WHERE user_id = ?",
        [user.id]
      );
      return { user, profile: profile ?? null };
    },

    async create(p: NewProfile): Promise<Profile> {
      const age = toNullableNumber(p.age);
      const weight = toNullableNumber(p.weight);
      const height = toNullableNumber(p.height);
      const skill = p.skill_level ?? "Beginner";

      const existing = await db.getFirstAsync<Profile>(
        "SELECT * FROM profile WHERE user_id = ?",
        [p.user_id]
      );
      if (existing) return existing;

      await db.runAsync(
        "INSERT INTO profile (user_id, age, weight, height, skill_level) VALUES (?, ?, ?, ?, ?)",
        [p.user_id, age, weight, height, skill]
      );

      const inserted = await db.getFirstAsync<Profile>(
        "SELECT * FROM profile WHERE user_id = ?",
        [p.user_id]
      );
      if (!inserted) throw new Error("Failed to load inserted profile");
      return inserted;
    },
  };
}
