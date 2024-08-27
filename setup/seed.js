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

    // Verify the connection
    const res = await client.query(`SELECT NOW() as now`);
    console.log("Current Time from DB:", res.rows[0].now);

    // Clear existing data
    await client.query(
      "TRUNCATE TABLE exercise_records, user_exercises, user_programmes, programme_exercises, exercise_instructions, exercises, programmes, users CASCADE"
    );

    // User Passwords Hashing
    const hashedPasswords = await Promise.all([
      hashPassword(process.env.TEST_PASSWORD1),
      hashPassword(process.env.TEST_PASSWORD2),
      hashPassword(process.env.TEST_PASSWORD3),
      hashPassword(process.env.TEST_PASSWORD4),
      hashPassword(process.env.RACHEL_PASSWORD),
      hashPassword(process.env.AMELIA_PASSWORD),
      hashPassword(process.env.ADMIN_TESTER_PASSWORD),
    ]);

    // Insert Users
    const usersQuery = `
      INSERT INTO users (username, email, password_hash, name, is_admin)
      VALUES
        ('tester_1', 'tester_1@example.com', '${hashedPasswords[0]}', 'John Doe', FALSE),
        ('tester_2', 'tester_2@example.com', '${hashedPasswords[1]}', 'Jane Smith', FALSE),
        ('tester_3', 'tester_3@example.com', '${hashedPasswords[2]}', 'Mike Johnson', FALSE),
        ('tester_4', 'tester_4@example.com', '${hashedPasswords[3]}', 'Alice Wilson', FALSE),
        ('rachel_gina', 'rachel_gina@example.com', '${hashedPasswords[4]}', 'Rachel Gina', TRUE),
        ('amelia_tan', 'amelia_tan@example.com', '${hashedPasswords[5]}', 'Amelia Tan', TRUE),
        ('tester_admin', 'tester_admin@example.com', '${hashedPasswords[6]}', 'Tester Admin', TRUE)
      RETURNING id;
    `;
    const usersResult = await client.query(usersQuery);
    const userIds = usersResult.rows.map((row) => row.id);

    // Insert Programmes
    const programmesQuery = `
      INSERT INTO programmes (name, description, difficulty_level, est_duration, image_url)
      VALUES
        ('Beginner Strength Training', 'A basic strength training program for beginners focusing on major muscle groups.', 'Beginner', 30, 'https://example.com/images/beginner_strength.jpg'),
        ('Intermediate Cardio Workout', 'A balanced cardio workout program for intermediate fitness levels.', 'Intermediate', 45, 'https://example.com/images/intermediate_cardio.jpg'),
        ('Advanced Flexibility Routine', 'An advanced routine designed to enhance flexibility and mobility.', 'Advanced', 60, 'https://example.com/images/advanced_flexibility.jpg'),
        ('High-Intensity Interval Training', 'A high-intensity workout combining cardio and strength exercises for a full-body challenge.', 'Advanced', 75, 'https://example.com/images/hiit.jpg'),
        ('Core Strength Program', 'Focused core strengthening exercises to build a solid foundation.', 'Intermediate', 40, 'https://example.com/images/core_strength.jpg'),
        ('Yoga for Relaxation', 'A yoga program designed to promote relaxation and flexibility.', 'Beginner', 30, 'https://example.com/images/yoga_relaxation.jpg'),
        ('Full Body Strength Circuit', 'A full-body circuit workout for overall strength and conditioning.', 'Intermediate', 60, 'https://example.com/images/full_body_strength.jpg'),
        ('Endurance Running Program', 'A progressive running program aimed at improving endurance.', 'Advanced', 90, 'https://example.com/images/endurance_running.jpg'),
        ('Pilates for Core Stability', 'Pilates exercises focusing on core stability and strength.', 'Beginner', 50, 'https://example.com/images/pilates_core.jpg'),
        ('Strength Training for Athletes', 'Advanced strength training program tailored for athletes.', 'Advanced', 60, 'https://example.com/images/athlete_strength.jpg')
      RETURNING id;
    `;
    const programmesResult = await client.query(programmesQuery);
    const programmeIds = programmesResult.rows.map((row) => row.id);

    // Insert Exercises
    const exercisesQuery = `
      INSERT INTO exercises (name, category, description, is_weighted, image_url, video_url)
      VALUES
        ('Push Up', 'arms', 'A bodyweight exercise targeting the chest, shoulders, and triceps.', false, 
          'https://cdn.pixabay.com/photo/2017/08/30/12/45/push-up-2696030_1280.jpg', 
          'https://www.youtube.com/embed/_l3ySVKYVJ8'),
        ('Squat', 'legs', 'A foundational lower body exercise to build strength in the quads, hamstrings, and glutes.', true, 
          'https://cdn.pixabay.com/photo/2016/03/26/22/40/squat-1284619_1280.jpg', 
          'https://www.youtube.com/embed/aclHkVaku9U'),
        ('Running', 'cardio', 'An aerobic exercise that enhances cardiovascular endurance and burns calories.', false, 
          'https://cdn.pixabay.com/photo/2015/01/20/13/13/sunset-605305_1280.jpg', 
          'https://www.youtube.com/embed/6U6hX7ei5eM'),
        ('Deadlift', 'full body', 'A compound movement that targets the posterior chain, improving overall body strength.', true, 
          'https://cdn.pixabay.com/photo/2017/04/07/09/23/deadlift-2210482_1280.jpg', 
          'https://www.youtube.com/embed/op9kVnSso6Q'),
        ('Bench Press', 'chest', 'A key upper body exercise to develop strength in the chest, shoulders, and triceps.', true, 
          'https://cdn.pixabay.com/photo/2017/08/02/16/09/barbell-2572178_1280.jpg', 
          'https://www.youtube.com/embed/gRVjAtPip0Y'),
        ('Pull Up', 'back', 'A challenging bodyweight exercise that strengthens the lats, biceps, and upper back.', true, 
          'https://cdn.pixabay.com/photo/2016/03/27/19/48/pull-up-1284619_1280.jpg', 
          'https://www.youtube.com/embed/eGo4IYlbE5g'),
        ('Plank', 'core', 'A core stabilization exercise that engages the abs, back, and shoulders.', false, 
          'https://cdn.pixabay.com/photo/2016/03/27/19/48/plank-1284625_1280.jpg', 
          'https://www.youtube.com/embed/B296mZDhrP4'),
        ('Burpees', 'full body', 'A high-intensity full-body exercise combining strength and cardio to boost endurance.', false, 
          'https://cdn.pixabay.com/photo/2016/03/27/19/48/burpees-1284624_1280.jpg', 
          'https://www.youtube.com/embed/TU8QYVW0gDU'),
        ('Lunges', 'legs', 'A dynamic leg exercise that targets the quads, hamstrings, and glutes, improving balance and coordination.', true, 
          'https://cdn.pixabay.com/photo/2016/03/27/19/48/lunges-1284622_1280.jpg', 
          'https://www.youtube.com/embed/QOVaHwm-Q6U'),
        ('Bicep Curl', 'arms', 'An isolated arm exercise focused on building the bicep muscles.', true, 
          'https://cdn.pixabay.com/photo/2016/03/27/19/48/bicep-curl-1284620_1280.jpg', 
          'https://www.youtube.com/embed/ykJmrZ5v0Oo'),
        ('Tricep Dip', 'arms', 'A tricep-focused exercise that also engages the chest and shoulders.', false, 
          'https://cdn.pixabay.com/photo/2016/03/27/19/48/tricep-dip-1284621_1280.jpg', 
          'https://www.youtube.com/embed/0326dy_-CzM'),
        ('Jump Rope', 'cardio', 'A simple yet effective cardio exercise that improves coordination and endurance.', false, 
          'https://cdn.pixabay.com/photo/2017/05/17/12/42/fitness-2317180_1280.jpg', 
          'https://www.youtube.com/embed/fcN37TxBE_s'),
        ('Overhead Press', 'shoulders', 'A compound exercise that builds shoulder strength and stability.', true, 
          'https://cdn.pixabay.com/photo/2017/01/31/20/44/overhead-press-2022627_1280.jpg', 
          'https://www.youtube.com/embed/F3QY5vMz_6I'),
        ('Leg Press', 'legs', 'A machine-based exercise that strengthens the quadriceps, hamstrings, and glutes.', true, 
          'https://cdn.pixabay.com/photo/2016/03/27/19/48/leg-press-1284618_1280.jpg', 
          'https://www.youtube.com/embed/lUEqJGWXUJ8'),
        ('Mountain Climbers', 'core', 'A dynamic core exercise that also boosts cardiovascular endurance.', false, 
          'https://cdn.pixabay.com/photo/2017/02/08/19/22/mountain-climbers-2042203_1280.jpg', 
          'https://www.youtube.com/embed/nmwgirgXLYM')
      RETURNING id;
    `;
    const exerciseResult = await client.query(exercisesQuery);
    const exerciseIds = exerciseResult.rows.map((row) => row.id);

    // Insert Exercise Instructions
    const exerciseInstructionsQuery = `
    INSERT INTO exercise_instructions (exercise_id, step_number, instruction)
    VALUES
      (${exerciseIds[0]}, 1, 'Start in a plank position with your hands directly under your shoulders.'),
      (${exerciseIds[0]}, 2, 'Lower your body towards the floor by bending your elbows.'),
      (${exerciseIds[0]}, 3, 'Push through your palms to return to the starting position.'),
      (${exerciseIds[1]}, 1, 'Stand with your feet shoulder-width apart, arms at your sides.'),
      (${exerciseIds[1]}, 2, 'Lower your body into a squat position by bending your knees and hips.'),
      (${exerciseIds[1]}, 3, 'Push through your heels to return to the starting position.'),
      (${exerciseIds[2]}, 1, 'Maintain a comfortable pace that allows you to converse without gasping for air.'),
      (${exerciseIds[3]}, 1, 'Stand with feet hip-width apart, the barbell on the floor in front of you.'),
      (${exerciseIds[3]}, 2, 'Hinge at your hips and knees to grip the barbell, maintaining a flat back.'),
      (${exerciseIds[3]}, 3, 'Lift the barbell by extending your hips and knees, keeping the bar close to your body.'),
      (${exerciseIds[3]}, 4, 'Lower the barbell to the ground with control, reversing the movement.'),
      (${exerciseIds[4]}, 1, 'Lie on a bench with your feet flat on the floor, holding the barbell slightly wider than shoulder-width.'),
      (${exerciseIds[4]}, 2, 'Lower the barbell to your chest, keeping your elbows slightly tucked.'),
      (${exerciseIds[4]}, 3, 'Press the barbell back up, extending your arms fully.'),
      (${exerciseIds[5]}, 1, 'Grab a pull-up bar with an overhand grip, hands slightly wider than shoulder-width apart.'),
      (${exerciseIds[5]}, 2, 'Hang from the bar with arms fully extended. Pull yourself up until your chin clears the bar.'),
      (${exerciseIds[5]}, 3, 'Lower yourself down slowly until your arms are fully extended again.'),
      (${exerciseIds[6]}, 1, 'Get into a push-up position, resting on your forearms instead of your hands.'),
      (${exerciseIds[6]}, 2, 'Engage your core and maintain a straight line from head to heels.'),
      (${exerciseIds[6]}, 3, 'Hold this position for the desired duration.'),
      (${exerciseIds[7]}, 1, 'Stand with feet shoulder-width apart and arms by your sides.'),
      (${exerciseIds[7]}, 2, 'Squat down and place your hands on the floor.'),
      (${exerciseIds[7]}, 3, 'Jump your feet back to land in a plank position.'),
      (${exerciseIds[7]}, 4, 'Perform a push-up, then jump your feet back to your hands.'),
      (${exerciseIds[7]}, 5, 'Explode up into a jump, reaching your arms overhead.'),
      (${exerciseIds[8]}, 1, 'Stand upright with your feet hip-width apart.'),
      (${exerciseIds[8]}, 2, 'Step forward with one leg and lower your hips until both knees are bent at about 90 degrees.'),
      (${exerciseIds[8]}, 3, 'Push through the heel of your front foot to return to the starting position.'),
      (${exerciseIds[9]}, 1, 'Stand with your feet shoulder-width apart, holding a dumbbell in each hand.'),
      (${exerciseIds[9]}, 2, 'Curl the weights while contracting your biceps.'),
      (${exerciseIds[9]}, 3, 'Lower the weights back to the starting position.'),
      (${exerciseIds[10]}, 1, 'Sit on a bench or a stable chair, and place your hands on the edge, fingers facing forward.'),
      (${exerciseIds[10]}, 2, 'Slide your butt off the edge, and lower your body by bending your elbows.'),
      (${exerciseIds[10]}, 3, 'Push through your palms to return to the starting position.'),
      (${exerciseIds[11]}, 1, 'Hold the jump rope handles at your sides, with the rope behind you.'),
      (${exerciseIds[11]}, 2, 'Swing the rope over your head and jump as it passes under your feet.'),
      (${exerciseIds[11]}, 3, 'Continue jumping while maintaining a consistent rhythm.'),
      (${exerciseIds[12]}, 1, 'Stand with your feet shoulder-width apart, holding a barbell at shoulder height.'),
      (${exerciseIds[12]}, 2, 'Press the barbell overhead by extending your arms fully.'),
      (${exerciseIds[12]}, 3, 'Lower the barbell back to shoulder height.'),
      (${exerciseIds[13]}, 1, 'Sit on the leg press machine, placing your feet shoulder-width apart on the platform.'),
      (${exerciseIds[13]}, 2, 'Push the platform away from you until your legs are fully extended.'),
      (${exerciseIds[13]}, 3, 'Slowly lower the platform back down to the starting position.'),
      (${exerciseIds[14]}, 1, 'Start in a plank position, with your hands directly under your shoulders.'),
      (${exerciseIds[14]}, 2, 'Drive one knee toward your chest, then quickly switch legs.'),
      (${exerciseIds[14]}, 3, 'Continue alternating legs in a running motion.')
    `;
    await client.query(exerciseInstructionsQuery);

    // Insert Programme Exercises
    const programmeExercisesQuery = `
    INSERT INTO programme_exercises (programme_id, exercise_id, reps, sets)
    VALUES
      (${programmeIds[0]}, ${exerciseIds[0]}, 15, 3),
      (${programmeIds[0]}, ${exerciseIds[7]}, 12, 3),
      (${programmeIds[1]}, ${exerciseIds[4]}, 10, 3),
      (${programmeIds[1]}, ${exerciseIds[1]}, 12, 4),
      (${programmeIds[2]}, ${exerciseIds[2]}, 20, 2),
      (${programmeIds[2]}, ${exerciseIds[11]}, 50, 4),
      (${programmeIds[3]}, ${exerciseIds[3]}, 5, 5),
      (${programmeIds[3]}, ${exerciseIds[12]}, 8, 3),
      (${programmeIds[4]}, ${exerciseIds[8]}, 15, 4),
      (${programmeIds[4]}, ${exerciseIds[13]}, 10, 3),
      (${programmeIds[5]}, ${exerciseIds[14]}, 30, 4),
      (${programmeIds[5]}, ${exerciseIds[5]}, 10, 3),
      (${programmeIds[6]}, ${exerciseIds[6]}, 60, 3),
      (${programmeIds[6]}, ${exerciseIds[9]}, 12, 4),
      (${programmeIds[7]}, ${exerciseIds[10]}, 10, 3),
      (${programmeIds[7]}, ${exerciseIds[0]}, 15, 3),
      (${programmeIds[8]}, ${exerciseIds[2]}, 30, 2),
      (${programmeIds[8]}, ${exerciseIds[7]}, 12, 4),
      (${programmeIds[9]}, ${exerciseIds[6]}, 60, 3),
      (${programmeIds[9]}, ${exerciseIds[14]}, 30, 4)
    `;
    await client.query(programmeExercisesQuery);

    // Insert User Programmes - Continued
    const userProgrammesQuery = `
    INSERT INTO user_programmes (user_id, programme_id, start_date, status, active_days)
    VALUES
      (${userIds[0]}, ${programmeIds[0]}, '2024-08-01', 'active', 'monday,thursday,saturday'),
      (${userIds[1]}, ${programmeIds[1]}, '2024-08-03', 'active', 'tuesday,friday'),
      (${userIds[2]}, ${programmeIds[2]}, '2024-08-05', 'active', 'wednesday,sunday'),
      (${userIds[3]}, ${programmeIds[3]}, '2024-08-07', 'active', 'monday,wednesday,friday'),
      (${userIds[4]}, ${programmeIds[4]}, '2024-08-09', 'active', 'tuesday,thursday'),
      (${userIds[5]}, ${programmeIds[5]}, '2024-08-11', 'active', 'monday,tuesday,thursday'),
      (${userIds[6]}, ${programmeIds[6]}, '2024-08-13', 'active', 'friday,saturday')
    RETURNING id;
    `;
    const userProgrammesResult = await client.query(userProgrammesQuery);
    const userProgrammeIds = userProgrammesResult.rows.map((row) => row.id);

    // Insert User Exercises
    const userExercisesQuery = `
    INSERT INTO user_exercises (user_programme_id, exercise_id, start_weight, goal_weight, start_reps, goal_reps)
    VALUES
      (${userProgrammeIds[0]}, ${exerciseIds[0]}, 0, 0, 15, 15),
      (${userProgrammeIds[0]}, ${exerciseIds[7]}, 0, 0, 12, 12),
      (${userProgrammeIds[1]}, ${exerciseIds[4]}, 50, 70, 10, 12),
      (${userProgrammeIds[1]}, ${exerciseIds[1]}, 60, 80, 12, 15),
      (${userProgrammeIds[2]}, ${exerciseIds[2]}, 0, 0, 20, 20),
      (${userProgrammeIds[2]}, ${exerciseIds[11]}, 0, 0, 50, 50),
      (${userProgrammeIds[3]}, ${exerciseIds[3]}, 100, 140, 5, 5),
      (${userProgrammeIds[3]}, ${exerciseIds[12]}, 30, 50, 8, 10),
      (${userProgrammeIds[4]}, ${exerciseIds[8]}, 20, 30, 15, 20),
      (${userProgrammeIds[4]}, ${exerciseIds[13]}, 80, 100, 10, 12),
      (${userProgrammeIds[5]}, ${exerciseIds[14]}, 0, 0, 30, 40),
      (${userProgrammeIds[5]}, ${exerciseIds[5]}, 0, 0, 10, 12),
      (${userProgrammeIds[6]}, ${exerciseIds[6]}, 0, 0, 60, 60),
      (${userProgrammeIds[6]}, ${exerciseIds[9]}, 20, 30, 12, 15)
    RETURNING id;
    `;
    const userExercisesResult = await client.query(userExercisesQuery);
    const userExercisesIds = userExercisesResult.rows.map((row) => row.id);

    // Insert Exercise Records
    const exerciseRecordsQuery = `
      INSERT INTO exercise_records (user_exercise_id, weight, reps_completed, sets_completed, date_achieved)
      VALUES
        (${userExercisesIds[0]}, NULL, 10, 3, '2024-08-01'),
        (${userExercisesIds[1]}, NULL, 10, 4, '2024-08-02'),
        (${userExercisesIds[2]}, 30.0, 15, 4, '2024-08-01'),
        (${userExercisesIds[3]}, 15.0, 8, 3, '2024-08-03'),
        (${userExercisesIds[4]}, 20.0, 20, 5, '2024-08-02'),
        (${userExercisesIds[5]}, 18.0, 12, 3, '2024-08-04'),
        (${userExercisesIds[6]}, 22.0, 10, 3, '2024-08-01'),
        (${userExercisesIds[7]}, 28.0, 14, 4, '2024-08-03'),
        (${userExercisesIds[8]}, 24.0, 12, 3, '2024-08-02'),
        (${userExercisesIds[9]}, 20.0, 10, 4, '2024-08-05'),
        (${userExercisesIds[10]}, 22.0, 18, 4, '2024-08-03'),
        (${userExercisesIds[11]}, 25.0, 16, 5, '2024-08-06'),
        (${userExercisesIds[12]}, 20.0, 10, 3, '2024-08-01'),
        (${userExercisesIds[13]}, 23.0, 12, 4, '2024-08-04')
    `;
    await client.query(exerciseRecordsQuery);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    client.end();
  }
};

seedDatabase();
