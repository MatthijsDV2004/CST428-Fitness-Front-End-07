import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("flexzone_database.db");
    console.log("Database initialized!");
  }
  return db;
};

export const addExerciseToWorkoutPlan = async (
  userId: string,
  workoutPlanName: string,
  exerciseName: string,
  day: string,
  sets: number,
  reps: number
) => {
  console.log("Inside addExerciseToWorkoutPlan function");

  try {
    const db = await getDatabase();

    let exerciseId: number | null = null;
    let workoutPlanId: number | null = null;

    const existingExercise = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM exercise WHERE name = ?",
      [exerciseName]
    );

    if (existingExercise) {
      exerciseId = existingExercise.id;
      console.log(`Found Exercise ID: ${exerciseId}`);
    } else {
      const result = await db.runAsync(
        "INSERT INTO exercise (name) VALUES (?)",
        [exerciseName]
      );
      exerciseId = result?.lastInsertRowId || null;
      console.log(`New Exercise ID: ${exerciseId}`);
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
      workoutPlanId = result?.lastInsertRowId || null;
    }

    if (!workoutPlanId) return false;

    await db.runAsync(
      "INSERT INTO workoutPlanExercises (workout_plan_id, exercise_id, day, sets, reps) VALUES (?, ?, ?, ?, ?)",
      [workoutPlanId, exerciseId, day, sets, reps]
    );

    console.log("Exercise successfully added to workout plan!");
    return true;
  } catch (error) {
    console.error("SQL Error:", error);
    return false;
  }
};

export type WorkoutExercise = {
  name: string;
  sets: number;
  reps: number;
};

export const fetchWorkoutExercises = async (
  day: string
): Promise<WorkoutExercise[]> => {
  const db = await getDatabase();

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
    console.error("Error fetching workouts:", error);
    return [];
  }
};

export const updateWorkoutExerciseByName = async (
  name: string,
  sets: number,
  reps: number
) => {
  const db = await getDatabase();

  try {
    await db.runAsync(
      "UPDATE workoutPlanExercises SET sets = ?, reps = ? WHERE exercise_id = (SELECT id FROM exercise WHERE name = ?)",
      [sets, reps, name]
    );
    console.log(`✅ Updated ${name} with ${sets} sets and ${reps} reps.`);
    return true;
  } catch (error) {
    console.error("Error updating workout exercise:", error);
    return false;
  }
};

export const deleteExerciseFromWorkoutPlanByName = async (name: string) => {
  const db = await getDatabase();

  try {
    await db.runAsync(
      "DELETE FROM workoutPlanExercises WHERE exercise_id = (SELECT id FROM exercise WHERE name = ?)",
      [name]
    );
    console.log(`✅ Deleted exercise ${name} from workout plan.`);
    return true;
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return false;
  }
};
