import { useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import { makeUsersRepo } from "../db/user";
import { makeProfilesRepo } from "../db/profile";
import { makeWorkoutPlansRepo } from "../db/workoutPlan";
export type DB = SQLiteDatabase;

export function useDB(): DB {
  return useSQLiteContext();
}
export function useRepos() {
    const db = useDB();
    return {
      db,
      users: makeUsersRepo(db),
      profiles: makeProfilesRepo(db),
      workoutPlans: makeWorkoutPlansRepo(db),
    };
  }