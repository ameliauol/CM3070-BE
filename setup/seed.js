require("dotenv").config();
const bcrypt = require("bcrypt");
const { client, connectClient } = require("./db");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

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
    const users = [
      {
        username: "tester_1",
        email: "tester_1@example.com",
        password: process.env.TEST_PASSWORD1,
        name: "John Doe",
      },
      {
        username: "tester_2",
        email: "tester_2@example.com",
        password: process.env.TEST_PASSWORD2,
        name: "Jane Smith",
      },
      {
        username: "tester_3",
        email: "tester_3@example.com",
        password: process.env.TEST_PASSWORD3,
        name: "Mike Johnson",
      },
      {
        username: "tester_4",
        email: "tester_4@example.com",
        password: process.env.TEST_PASSWORD4,
        name: "Alice Wilson",
      },
      {
        username: "rachel_gina",
        email: "rachel_gina@example.com",
        password: process.env.RACHEL_PASSWORD,
        name: "Rachel Gina",
        is_admin: true,
      },
      {
        username: "amelia_tan",
        email: "amelia_tan@example.com",
        password: process.env.AMELIA_PASSWORD,
        name: "Amelia Tan",
        is_admin: true,
      },
      {
        username: "tester_admin",
        email: "tester_admin@example.com",
        password: process.env.ADMIN_TESTER_PASSWORD,
        name: "Tester Admin",
        is_admin: true,
      },
    ];

    for (const user of users) {
      user.password_hash = await hashPassword(user.password);
    }

    const usersQuery = `
      INSERT INTO users (username, email, password_hash, name, is_admin)
      VALUES
        ('${users[0].username}', '${users[0].email}', '${users[0].password_hash}', '${users[0].name}', FALSE),
        ('${users[1].username}', '${users[1].email}', '${users[1].password_hash}', '${users[1].name}', FALSE),
        ('${users[2].username}', '${users[2].email}', '${users[2].password_hash}', '${users[2].name}', FALSE),
        ('${users[3].username}', '${users[3].email}', '${users[3].password_hash}', '${users[3].name}', FALSE),
        ('${users[4].username}', '${users[4].email}', '${users[4].password_hash}', '${users[4].name}', ${users[4].is_admin}),
        ('${users[5].username}', '${users[5].email}', '${users[5].password_hash}', '${users[5].name}', ${users[5].is_admin}),
        ('${users[6].username}', '${users[6].email}', '${users[6].password_hash}', '${users[6].name}', ${users[6].is_admin})
      RETURNING id;
    `;
    const usersResult = await client.query(usersQuery);
    const userIds = usersResult.rows.map((row) => row.id);

    // Insert Programmes
    const programmesQuery = `
      INSERT INTO programmes (name, description, author_id)
      VALUES
        ('Weight Loss', 'A program focused on weight loss', ${userIds[0]}),
        ('Muscle Building', 'A program focused on muscle building', ${userIds[1]}),
        ('Cardio Blast', 'A program focused on improving cardiovascular health', ${userIds[2]}),
        ('Strength Training', 'A program focused on building strength', ${userIds[3]}),
        ('HIIT Workouts', 'High-intensity interval training', ${userIds[4]}),
        ('Yoga Practice', 'A program for yoga enthusiasts', ${userIds[5]}),
        ('Full Body Workouts', 'A program for full body workouts', ${userIds[6]}),
        ('Flexibility & Mobility', 'A program focused on flexibility and mobility', ${userIds[1]}),
        ('Endurance Training', 'A program to improve endurance', ${userIds[0]}),
        ('Core Strength', 'A program to build core strength', ${userIds[1]})
      RETURNING id;
    `;
    const programmesResult = await client.query(programmesQuery);
    const programmeIds = programmesResult.rows.map((row) => row.id);

    const exercisesQuery = `
      INSERT INTO exercises (name, category, description, is_weighted, image_url, video_url)
      VALUES
        ('Push Up', 'arms', 'An exercise to strengthen arms', false, 'https://example.com/pushup.jpg', 'https://example.com/pushup.mp4'),
        ('Squat', 'legs', 'An exercise to strengthen legs', true, 'https://example.com/squat.jpg', 'https://example.com/squat.mp4'),
        ('Running', 'cardio', 'A cardiovascular exercise to improve endurance', false, 'https://example.com/running.jpg', 'https://example.com/running.mp4'),
        ('Deadlift', 'full body', 'A full body exercise to build strength', true, 'https://example.com/deadlift.jpg', 'https://example.com/deadlift.mp4'),
        ('Bench Press', 'chest', 'An exercise to strengthen the chest', true, 'https://example.com/benchpress.jpg', 'https://example.com/benchpress.mp4'),
        ('Pull Up', 'back', 'An exercise to strengthen the back', true, 'https://example.com/pullup.jpg', 'https://example.com/pullup.mp4'),
        ('Plank', 'core', 'An exercise to strengthen the core', false, 'https://example.com/plank.jpg', 'https://example.com/plank.mp4'),
        ('Burpees', 'full body', 'A full body exercise to build endurance', false, 'https://example.com/burpees.jpg', 'https://example.com/burpees.mp4'),
        ('Lunges', 'legs', 'An exercise to strengthen legs', true, 'https://example.com/lunges.jpg', 'https://example.com/lunges.mp4'),
        ('Bicep Curl', 'arms', 'An exercise to strengthen biceps', true, 'https://example.com/bicepcurl.jpg', 'https://example.com/bicepcurl.mp4'),
        ('Tricep Dip', 'arms', 'An exercise to strengthen triceps', false, 'https://example.com/tricepdip.jpg', 'https://example.com/tricepdip.mp4'),
        ('Jump Rope', 'cardio', 'A cardiovascular exercise to improve endurance', false, 'https://example.com/jumprope.jpg', 'https://example.com/jumprope.mp4')
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
        (${exerciseIds[6]}, 2, 'Hold the position for as long as possible.'),
        (${exerciseIds[7]}, 1, 'Stand with feet shoulder-width apart, squat down, and place your hands on the floor.'),
        (${exerciseIds[7]}, 2, 'Kick your feet back to a push-up position and lower your chest to the floor.'),
        (${exerciseIds[7]}, 3, 'Return your feet to the squat position and jump up.'),
        (${exerciseIds[8]}, 1, 'Stand with feet together, take a step forward, and lower your hips until both knees are bent at a 90-degree angle.'),
        (${exerciseIds[8]}, 2, 'Return to the starting position by pushing off with your front leg.'),
        (${exerciseIds[9]}, 1, 'Stand with feet shoulder-width apart, hold a dumbbell in each hand with arms hanging down.'),
        (${exerciseIds[9]}, 2, 'Bend your elbows and curl the weights up towards your shoulders.'),
        (${exerciseIds[9]}, 3, 'Lower the weights back to the starting position.'),
        (${exerciseIds[10]}, 1, 'Sit on the edge of a chair or bench, place your hands next to your hips.'),
        (${exerciseIds[10]}, 2, 'Slide your butt off the edge, bend your elbows, and lower your body down.'),
        (${exerciseIds[10]}, 3, 'Push yourself back up to the starting position.'),
        (${exerciseIds[11]}, 1, 'Hold the handles of a jump rope, keep your elbows close to your body, and start jumping by swinging the rope over your head and under your feet.')
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
        (${programmeIds[3]}, ${exerciseIds[5]}, 8, 4),
        (${programmeIds[4]}, ${exerciseIds[7]}, 10, 3),
        (${programmeIds[4]}, ${exerciseIds[8]}, 10, 3),
        (${programmeIds[5]}, ${exerciseIds[6]}, 120, 3),
        (${programmeIds[5]}, ${exerciseIds[11]}, 60, 5),
        (${programmeIds[6]}, ${exerciseIds[3]}, 15, 3),
        (${programmeIds[6]}, ${exerciseIds[4]}, 10, 3),
        (${programmeIds[7]}, ${exerciseIds[8]}, 12, 3),
        (${programmeIds[7]}, ${exerciseIds[10]}, 15, 3),
        (${programmeIds[8]}, ${exerciseIds[2]}, 20, 3),
        (${programmeIds[8]}, ${exerciseIds[9]}, 15, 3),
        (${programmeIds[9]}, ${exerciseIds[6]}, 60, 3),
        (${programmeIds[9]}, ${exerciseIds[3]}, 12, 3)
    `;
    await client.query(programmeExercisesQuery);

    // Insert User Programmes
    const userProgrammesQuery = `
      INSERT INTO user_programmes (user_id, programme_id, start_date, status, active_days)
      VALUES
        (${userIds[0]}, ${programmeIds[0]}, '2024-06-01', 'active', 'monday,wednesday,friday'),
        (${userIds[1]}, ${programmeIds[1]}, '2024-06-01', 'active', 'tuesday,thursday'),
        (${userIds[2]}, ${programmeIds[2]}, '2024-06-01', 'active', 'monday,thursday,saturday'),
        (${userIds[3]}, ${programmeIds[3]}, '2024-06-01', 'active', 'wednesday,friday,sunday'),
        (${userIds[4]}, ${programmeIds[4]}, '2024-06-01', 'active', 'monday,friday,saturday'),
        (${userIds[5]}, ${programmeIds[5]}, '2024-06-01', 'active', 'tuesday,thursday,sunday'),
        (${userIds[6]}, ${programmeIds[6]}, '2024-06-01', 'active', 'wednesday,friday')
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
        (${userProgrammeIds[3]}, ${exerciseIds[5]}, 30, 70, 3, 6),
        (${userProgrammeIds[4]}, ${exerciseIds[7]}, NULL, NULL, 10, 20),
        (${userProgrammeIds[4]}, ${exerciseIds[8]}, 20, 50, 8, 12),
        (${userProgrammeIds[5]}, ${exerciseIds[6]}, NULL, NULL, 60, 120),
        (${userProgrammeIds[5]}, ${exerciseIds[11]}, NULL, NULL, 30, 60),
        (${userProgrammeIds[6]}, ${exerciseIds[3]}, 50, 100, 5, 10),
        (${userProgrammeIds[6]}, ${exerciseIds[4]}, 40, 80, 8, 12)
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
        (${userExerciseIds[7]}, 30, 8, 4),
        (${userExerciseIds[8]}, NULL, 10, 3),
        (${userExerciseIds[9]}, 20, 10, 3),
        (${userExerciseIds[10]}, NULL, 60, 3),
        (${userExerciseIds[11]}, NULL, 30, 5),
        (${userExerciseIds[12]}, 50, 10, 3),
        (${userExerciseIds[13]}, 40, 12, 3)
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
