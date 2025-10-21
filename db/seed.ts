import * as SQLite from "expo-sqlite";

/**
 * Populates the local DB with starter rows after sign-in.
 */
export async function seedDatabaseForUser(
  g_id: string,
  email: string,
  username: string,
  profile_pic: string | null
): Promise<void> {
  try {
    const db = await SQLite.openDatabaseAsync("flexzone_database.db");

    // 1️⃣ Insert or ignore the user
    await db.runAsync(
      `
      INSERT OR IGNORE INTO user (g_id, email, username, profile_pic)
      VALUES (?, ?, ?, ?);
      `,
      [g_id, email, username, profile_pic ?? null] // ✅ no undefined
    );

    // 2️⃣ Get the user's ID
    const user = (await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM user WHERE g_id = ?;`,
      [g_id]
    )) ?? null;

    const userId = user?.id ?? null;
    if (userId === null) {
      console.warn("⚠️ User not found after insert — skipping seeding.");
      return;
    }

    // 3️⃣ Create a sample profile if none exists
    await db.runAsync(
      `
      INSERT OR IGNORE INTO profile (user_id, age, weight, height, skill_level)
      VALUES (?, ?, ?, ?, ?);
      `,
      [userId, 21, 85, 190, "Intermediate"]
    );

    // 4️⃣ Create a default workout plan if none exists
    await db.runAsync(
      `
      INSERT OR IGNORE INTO workoutPlan (user_id, name)
      VALUES (?, ?);
      `,
      [userId, "My First Plan"]
    );

    // 5️⃣ Get the plan ID
    const plan = (await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM workoutPlan WHERE user_id = ?;`,
      [userId]
    )) ?? null;

    const planId = plan?.id ?? null;
    if (planId === null) {
      console.warn("⚠️ Workout plan not found after insert.");
      return;
    }

    // 6️⃣ Add a few sample exercises if not already there
    await db.runAsync(`
      INSERT OR IGNORE INTO exercise (name, description, muscle_group)
      VALUES
      ('Push-Up', 'Bodyweight chest exercise', 'Chest'),
      ('Squat', 'Leg strength exercise', 'Legs'),
      ('Plank', 'Core stability exercise', 'Core');
    `);

    // Explicit type for returned rows
    const exercises = await db.getAllAsync<{ id: number }>(
      `SELECT id FROM exercise LIMIT 3;`
    );

    // 7️⃣ Link exercises to the workout plan
    for (const ex of exercises) {
      await db.runAsync(
        `
        INSERT OR IGNORE INTO workoutPlanExercises
          (workout_plan_id, exercise_id, day, sets, reps)
        VALUES (?, ?, ?, ?, ?);
        `,
        [planId, ex.id, "Monday", 3, 10]
      );
    }

    console.log("✅ Local DB seeded successfully for user:", username);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  }
}
