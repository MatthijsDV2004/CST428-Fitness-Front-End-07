import type { SQLiteDatabase } from "expo-sqlite";
import { toNullableNumber } from "@/db/sanitize";

export type WorkoutExercise = {
  name: string;
  sets: number;
  reps: number;
};

export function makeWorkoutPlansRepo(db: SQLiteDatabase) {
  return {
    async addExerciseToWorkoutPlan(
      userId: number,
      workoutPlanName: string,
      exerciseName: string,
      day: string,
      sets: number,
      reps: number
    ): Promise<boolean> {
      try {
        let exerciseId: number | null = null;
        let workoutPlanId: number | null = null;

        const existingExercise = await db.getFirstAsync<{ id: number }>(
          "SELECT id FROM exercise WHERE name = ?",
          [exerciseName]
        );

        if (existingExercise) {
          exerciseId = existingExercise.id;
        } else {
          const result = await db.runAsync(
            "INSERT INTO exercise (name) VALUES (?)",
            [exerciseName]
          );
          exerciseId = result?.lastInsertRowId ?? null;
        }

        if (!exerciseId) return false;

        const existingPlan = await db.getFirstAsync<{ id: number }>(
          "SELECT id FROM workoutPlan WHERE user_id = ? AND name = ?",
          [userId, workoutPlanName]
        );

        if (existingPlan) {
          workoutPlanId = existingPlan.id;
        } else {
          const result = await db.runAsync(
            "INSERT INTO workoutPlan (user_id, name) VALUES (?, ?)",
            [userId, workoutPlanName]
          );
          workoutPlanId = result?.lastInsertRowId ?? null;
        }

        if (!workoutPlanId) return false;

        await db.runAsync(
          "INSERT INTO workoutPlanExercises (workout_plan_id, exercise_id, day, sets, reps) VALUES (?, ?, ?, ?, ?)",
          [workoutPlanId, exerciseId, day, toNullableNumber(sets), toNullableNumber(reps)]
        );

        console.log("Exercise successfully added to workout plan!");
        return true;
      } catch (error) {
        console.error("addExerciseToWorkoutPlan error:", error);
        return false;
      }
    },

    async fetchWorkoutExercises(day: string): Promise<WorkoutExercise[]> {
      try {
        const result = (await db.getAllAsync(
          `SELECT e.name, we.sets, we.reps
             FROM workoutPlanExercises we
             JOIN exercise e ON we.exercise_id = e.id
             WHERE we.day = ?`,
          [day]
        )) as WorkoutExercise[];
        return result;
      } catch (error) {
        console.error("fetchWorkoutExercises error:", error);
        return [];
      }
    },

    async updateWorkoutExerciseByName(
      name: string,
      sets: number,
      reps: number
    ): Promise<boolean> {
      try {
        await db.runAsync(
          "UPDATE workoutPlanExercises SET sets = ?, reps = ? WHERE exercise_id = (SELECT id FROM exercise WHERE name = ?)",
          [toNullableNumber(sets), toNullableNumber(reps), name]
        );
        console.log(`Updated ${name}: ${sets} sets × ${reps} reps`);
        return true;
      } catch (error) {
        console.error("updateWorkoutExerciseByName error:", error);
        return false;
      }
    },

    async deleteExerciseFromWorkoutPlanByName(name: string): Promise<boolean> {
      try {
        await db.runAsync(
          "DELETE FROM workoutPlanExercises WHERE exercise_id = (SELECT id FROM exercise WHERE name = ?)",
          [name]
        );
        console.log(`Deleted ${name} from workout plan`);
        return true;
      } catch (error) {
        console.error("deleteExerciseFromWorkoutPlanByName error:", error);
        return false;
      }
    },
  };
}
