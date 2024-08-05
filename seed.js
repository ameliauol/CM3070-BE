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
      "TRUNCATE TABLE exercise_records, user_calendar, user_exercises, user_programmes, programme_exercises, exercise_instructions, exercises, available_programmes, users CASCADE"
    );

    // Insert Users
    const usersQuery = `
      INSERT INTO users (username, email, password_hash, name)
      VALUES
        ('john_doe', 'john@example.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8gqC0.Ycf3qlJ10zE6xNBjKqDtd2o6', 'John Doe'),
        ('jane_smith', 'jane@example.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8gqC0.Ycf3qlJ10zE6xNBjKqDtd2o6', 'Jane Smith')
      RETURNING id, username;
    `;
    const usersResult = await client.query(usersQuery);
    const users = usersResult.rows;
    const userIds = users.map((user) => user.id);

    // Insert Available Programmes
    const programmesQuery = `
      INSERT INTO available_programmes (name, description, author_id)
      VALUES
        ('Weight Loss', 'A programme focused on weight loss', ${userIds[0]}),
        ('Muscle Building', 'A programme focused on muscle building', ${userIds[1]})
      RETURNING id;
    `;
    const programmesResult = await client.query(programmesQuery);
    const programmeIds = programmesResult.rows.map((row) => row.id);

    // Insert Exercises
    const exercisesQuery = `
      INSERT INTO exercises (name, category, description)
      VALUES
        ('Push Up', 'arms', 'An exercise to strengthen arms'),
        ('Squat', 'legs', 'An exercise to strengthen legs')
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
        (${exerciseIds[1]}, 3, 'Return to the starting position.')
    `;
    await client.query(exerciseInstructionsQuery);

    // Insert Programme Exercises
    const programmeExercisesQuery = `
      INSERT INTO programme_exercises (programme_id, exercise_id)
      VALUES
        (${programmeIds[0]}, ${exerciseIds[0]}),
        (${programmeIds[0]}, ${exerciseIds[1]}),
        (${programmeIds[1]}, ${exerciseIds[0]})
    `;
    await client.query(programmeExercisesQuery);

    // Insert User Programmes
    const userProgrammesQuery = `
      INSERT INTO user_programmes (user_id, programme_id, start_date, status, active_days)
      VALUES
        (${userIds[0]}, ${programmeIds[0]}, '2024-06-01', 'active', 'Monday,Wednesday,Friday'),
        (${userIds[1]}, ${programmeIds[1]}, '2024-06-01', 'active', 'Tuesday,Thursday')
      RETURNING id;
    `;
    const userProgrammesResult = await client.query(userProgrammesQuery);
    const userProgrammeIds = userProgrammesResult.rows.map((row) => row.id);

    // Insert User Exercises with Goal Weight
    const userExercisesQuery = `
      INSERT INTO user_exercises (user_programme_id, exercise_id, start_weight, goal_weight)
      VALUES
        (${userProgrammeIds[0]}, ${exerciseIds[0]}, 20, 50),
        (${userProgrammeIds[0]}, ${exerciseIds[1]}, 50, 100),
        (${userProgrammeIds[1]}, ${exerciseIds[0]}, 30, 60)
      RETURNING id;
    `;
    const userExercisesResult = await client.query(userExercisesQuery);
    const userExerciseIds = userExercisesResult.rows.map((row) => row.id);

    // Insert Exercise Records
    const exerciseRecordsQuery = `
      INSERT INTO exercise_records (user_exercise_id, weight, date_achieved)
      VALUES
        (${userExerciseIds[0]}, 20, '2024-06-02'),
        (${userExerciseIds[1]}, 50, '2024-06-03'),
        (${userExerciseIds[2]}, 30, '2024-06-04')
    `;
    await client.query(exerciseRecordsQuery);

    // Insert User Calendar Entries
    const userCalendarQuery = `
      INSERT INTO user_calendar (user_id, date, programme_id)
      VALUES
        (${userIds[0]}, '2024-06-02', ${userProgrammeIds[0]}),
        (${userIds[1]}, '2024-06-03', ${userProgrammeIds[1]})
    `;
    await client.query(userCalendarQuery);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.end();
    console.log("Disconnected from the database");
  }
};

seedDatabase();
