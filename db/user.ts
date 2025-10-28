import type { SQLiteDatabase } from "expo-sqlite";
import type { User } from "@/types/types";

export type NewUser = {
  g_id?: string | null;
  username: string;
  email: string;
  profile_pic?: string | null;
};

export function makeUsersRepo(db: SQLiteDatabase) {
  return {
    async getByEmail(email: string): Promise<User | null> {
      return db.getFirstAsync<User>("SELECT * FROM user WHERE email = ?", [email]);
    },

    async getByGoogleId(g_id: string): Promise<User | null> {
      return db.getFirstAsync<User>("SELECT * FROM user WHERE g_id = ?", [g_id]);
    },

    async create(newUser: NewUser): Promise<User> {
      const username = (newUser.username ?? "").trim();
      const email = (newUser.email ?? "").trim();
      const gId = newUser.g_id ?? null;
      const profilePic = newUser.profile_pic ?? null;

      if (!username || !email) throw new Error("username and email are required");

      await db.runAsync(
        "INSERT INTO user (g_id, username, email, profile_pic) VALUES (?, ?, ?, ?)",
        [gId, username, email, profilePic]
      );

      const created = await db.getFirstAsync<User>("SELECT * FROM user WHERE email = ?", [email]);
      if (!created) throw new Error("Failed to load created user");
      return created;
    },
  };
}
