import * as SQLite from "expo-sqlite";
import type { User, NewUser } from "@/types/types";

export async function getUserByGoogleId(g_id: string): Promise<User | null> {
  const db = await SQLite.openDatabaseAsync("flexzone_database.db");
  const user = await db.getFirstAsync<User>(
    "SELECT * FROM user WHERE g_id = ?",
    [g_id]
  );
  return user ?? null;
}

export async function createUser(newUser: NewUser): Promise<User> {
  const db = await SQLite.openDatabaseAsync("flexzone_database.db");
  await db.runAsync(
    "INSERT INTO user (g_id, username, email, profile_pic) VALUES (?, ?, ?, ?)",
    [newUser.g_id, newUser.username, newUser.email, newUser.profile_pic ?? null]
  );

  const inserted = await db.getFirstAsync<User>(
    "SELECT * FROM user WHERE g_id = ?",
    [newUser.g_id]
  );

  if (!inserted) throw new Error("Failed to create user in database");
  return inserted;
}
