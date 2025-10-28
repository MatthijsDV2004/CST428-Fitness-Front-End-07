import * as SQLite from "expo-sqlite";

export async function seedDatabaseForUser(
  g_id: string,
  email: string,
  username: string,
  profile_pic: string | null
): Promise<void> {
  try {
    const db = await SQLite.openDatabaseAsync("flexzone_database.db");

    await db.runAsync(
      `
      INSERT OR IGNORE INTO user (g_id, email, username, profile_pic)
      VALUES (?, ?, ?, ?);
    `,
      [g_id, email, username, profile_pic ?? null]
    );

    const user = (await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM user WHERE g_id = ?;",
      [g_id]
    )) ?? null;

    if (!user) return;

    const userId = user.id;

    await db.runAsync(
      `
      INSERT OR IGNORE INTO profile (user_id, age, weight, height, skill_level)
      VALUES (?, ?, ?, ?, ?);
    `,
      [userId, 21, 85, 190, "Intermediate"]
    );

    await db.runAsync(
      `
      INSERT OR IGNORE INTO workoutPlan (user_id, name)
      VALUES (?, ?);
    `,
      [userId, "My First Plan"]
    );

    const plan = (await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM workoutPlan WHERE user_id = ?;",
      [userId]
    )) ?? null;

    if (!plan) return;

    const planId = plan.id;

    await db.runAsync(`
      INSERT OR IGNORE INTO exercise (name, description, muscle_group)
      VALUES
      ('Push-Up', 'Bodyweight chest exercise', 'Chest'),
      ('Squat', 'Leg strength exercise', 'Legs'),
      ('Plank', 'Core stability exercise', 'Core');
    `);

    const exercises = await db.getAllAsync<{ id: number }>(
      "SELECT id FROM exercise LIMIT 3;"
    );

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
