require("dotenv").config();
const { client, connectClient } = require("./db");

const seedDatabase = async () => {
  try {
    await connectClient();
    console.log("Connected to the database!");

    // Run a simple test query to verify connection
    const res = await client.query(`SELECT NOW() as now`);
    console.log("Current Time from DB:", res.rows[0].now);

    // Clear existing data
    await client.query(
      "TRUNCATE TABLE exercise_records, user_exercises, user_programmes, programme_exercises, exercise_instructions, exercises, programmes, users CASCADE"
    );

    // Insert Users
    const usersQuery = `
      INSERT INTO users (username, email, password_hash, name)
      VALUES
        ('john_doe', 'john@example.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8gqC0.Ycf3qlJ10zE6xNBjKqDtd2o6', 'John Doe'),
        ('jane_smith', 'jane@example.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8gqC0.Ycf3qlJ10zE6xNBjKqDtd2o6', 'Jane Smith'),
        ('mike_johnson', 'mike@example.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8gqC0.Ycf3qlJ10zE6xNBjKqDtd2o6', 'Mike Johnson'),
        ('alice_wilson', 'alice@example.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8gqC0.Ycf3qlJ10zE6xNBjKqDtd2o6', 'Alice Wilson')
        
      RETURNING id, username;
    `;
    const usersResult = await client.query(usersQuery);
    const users = usersResult.rows;
    const userIds = users.map((user) => user.id);

    // Insert Programmes
    const programmesQuery = `
      INSERT INTO programmes (name, description, author_id)
      VALUES
        ('Weight Loss', 'A program focused on weight loss', ${userIds[0]}),
        ('Muscle Building', 'A program focused on muscle building', ${userIds[1]}),
        ('Cardio Blast', 'A program focused on improving cardiovascular health', ${userIds[2]}),
        ('Strength Training', 'A program focused on building strength', ${userIds[3]})
      RETURNING id;
    `;
    const programmesResult = await client.query(programmesQuery);
    const programmeIds = programmesResult.rows.map((row) => row.id);

    // Insert Exercises
    const exercisesQuery = `
      INSERT INTO exercises (name, category, description, is_weighted)
      VALUES
        ('Push Up', 'arms', 'An exercise to strengthen arms', true),
        ('Squat', 'legs', 'An exercise to strengthen legs', true),
        ('Running', 'cardio', 'A cardiovascular exercise to improve endurance', false),
        ('Deadlift', 'full body', 'A full body exercise to build strength', true),
        ('Bench Press', 'chest', 'An exercise to strengthen the chest', true),
        ('Pull Up', 'back', 'An exercise to strengthen the back', true),
        ('Plank', 'core', 'An exercise to strengthen the core', false)
      RETURNING id;
    `;
    const exercisesResult = await client.query(exercisesQuery);
    const exerciseIds = exercisesResult.rows.map((row) => row.id);

    // Insert Exercise Instructions
    const exerciseInstructionsQuery = `
      INSERT INTO exercise_instructions (exercise_id, step_number, instruction)
      VALUES
        (${exerciseIds[0]}, 1, 'Get into a high plank position.'),
        (${exerciseIds[0]}, 2, 'Lower your body down to the ground.'),
        (${exerciseIds[0]}, 3, 'Push yourself back up.'),
        (${exerciseIds[1]}, 1, 'Stand with feet shoulder-width apart.'),
        (${exerciseIds[1]}, 2, 'Lower your hips until your thighs are parallel to the ground.'),
        (${exerciseIds[1]}, 3, 'Return to the starting position.'),
        (${exerciseIds[2]}, 1, 'Start jogging at a moderate pace.'),
        (${exerciseIds[3]}, 1, 'Stand with feet hip-width apart.'),
        (${exerciseIds[3]}, 2, 'Bend at your hips and knees to lower the bar to your knees.'),
        (${exerciseIds[3]}, 3, 'Pull the bar up to your hips.'),
        (${exerciseIds[4]}, 1, 'Lie down on a bench.'),
        (${exerciseIds[4]}, 2, 'Hold the barbell above your chest.'),
        (${exerciseIds[4]}, 3, 'Lower the bar to your chest and push it back up.'),
        (${exerciseIds[5]}, 1, 'Hang from a bar with your hands shoulder-width apart.'),
        (${exerciseIds[5]}, 2, 'Pull your body up until your chin is above the bar.'),
        (${exerciseIds[5]}, 3, 'Lower yourself back down.'),
        (${exerciseIds[6]}, 1, 'Get into a plank position with your forearms on the ground.'),
        (${exerciseIds[6]}, 2, 'Hold the position for as long as possible.')
    `;
    await client.query(exerciseInstructionsQuery);

    // Insert Programme Exercises
    const programmeExercisesQuery = `
      INSERT INTO programme_exercises (programme_id, exercise_id, reps, sets)
      VALUES
        (${programmeIds[0]}, ${exerciseIds[0]}, 10, 3),
        (${programmeIds[0]}, ${exerciseIds[2]}, 30, 2),
        (${programmeIds[1]}, ${exerciseIds[1]}, 15, 4),
        (${programmeIds[1]}, ${exerciseIds[4]}, 12, 3),
        (${programmeIds[2]}, ${exerciseIds[2]}, 20, 3),
        (${programmeIds[2]}, ${exerciseIds[6]}, 60, 1),
        (${programmeIds[3]}, ${exerciseIds[3]}, 10, 3),
        (${programmeIds[3]}, ${exerciseIds[5]}, 8, 4)
    `;
    await client.query(programmeExercisesQuery);

    // Insert User Programmes
    const userProgrammesQuery = `
      INSERT INTO user_programmes (user_id, programme_id, start_date, status, active_days)
      VALUES
        (${userIds[0]}, ${programmeIds[0]}, '2024-06-01', 'active', 'monday,wednesday,friday'),
        (${userIds[1]}, ${programmeIds[1]}, '2024-06-01', 'active', 'tuesday,thursday'),
        (${userIds[2]}, ${programmeIds[2]}, '2024-06-01', 'active', 'monday,thursday,saturday'),
        (${userIds[3]}, ${programmeIds[3]}, '2024-06-01', 'active', 'wednesday,friday,sunday')
      RETURNING id;
    `;
    const userProgrammesResult = await client.query(userProgrammesQuery);
    const userProgrammeIds = userProgrammesResult.rows.map((row) => row.id);

    // Insert User Exercises with Goal Weight
    const userExercisesQuery = `
      INSERT INTO user_exercises (user_programme_id, exercise_id, start_weight, goal_weight, start_reps, goal_reps)
      VALUES
        (${userProgrammeIds[0]}, ${exerciseIds[0]}, 20, 50, 8, 12),
        (${userProgrammeIds[0]}, ${exerciseIds[2]}, NULL, NULL, NULL, NULL),
        (${userProgrammeIds[1]}, ${exerciseIds[3]}, 50, 100, 5, 8),
        (${userProgrammeIds[1]}, ${exerciseIds[4]}, 40, 80, 8, 12),
        (${userProgrammeIds[2]}, ${exerciseIds[2]}, NULL, NULL, NULL, NULL),
        (${userProgrammeIds[2]}, ${exerciseIds[6]}, NULL, NULL, 30, 60),
        (${userProgrammeIds[3]}, ${exerciseIds[3]}, 60, 120, 5, 8),
        (${userProgrammeIds[3]}, ${exerciseIds[5]}, 30, 70, 3, 6)
      RETURNING id;
    `;
    const userExercisesResult = await client.query(userExercisesQuery);
    const userExerciseIds = userExercisesResult.rows.map((row) => row.id);

    // Insert Exercise Records with Reps and Sets Completed
    const exerciseRecordsQuery = `
      INSERT INTO exercise_records (user_exercise_id, weight, reps_completed, sets_completed)
      VALUES
        (${userExerciseIds[0]}, 20, 10, 3),
        (${userExerciseIds[1]}, NULL, 30, 2),
        (${userExerciseIds[2]}, 50, 10, 3),
        (${userExerciseIds[3]}, 40, 12, 3),
        (${userExerciseIds[4]}, NULL, 20, 3),
        (${userExerciseIds[5]}, NULL, 60, 1),
        (${userExerciseIds[6]}, 60, 10, 3),
        (${userExerciseIds[7]}, 30, 8, 4)
    `;
    await client.query(exerciseRecordsQuery);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.end();
    console.log("Disconnected from the database");
  }
};

seedDatabase();
