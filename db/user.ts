import * as SQLite from "expo-sqlite";
import type { User } from "@/types/user";

export const createUser = async (user: User) => {
    console.log('Creating user:', user)

    const db = await SQLite.openDatabaseAsync('flexzone_database');

    await db.runAsync(
        "INSERT INTO user (g_id, username, email, profile_pic) VALUES (?, ?, ?, ?)",
        [user.g_id, user.username, user.email, user.profile_pic]
      );

      const newUser = await db.getFirstAsync<User>("SELECT * FROM user WHERE g_id = ?", [user.g_id]);
      return newUser!;
}

export const getUserByGoogleId = async (googleId: string): Promise<User | null> => {
    console.log('Getting user by google id:', googleId)
    const db = await SQLite.openDatabaseAsync('flexzone_database');

    const result = await db.getFirstAsync<User>("SELECT * FROM user WHERE g_id = ?", [googleId]);
    console.log('User: ', result)

    return result ?? null;
}