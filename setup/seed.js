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

    // Insert Users
    const usersQuery = `
      INSERT INTO users (username, email, password_hash, name, is_admin)
      VALUES
        ('tester_1', 'tester_1@example.com', '${await hashPassword(
          process.env.TEST_PASSWORD1
        )}', 'John Doe', FALSE),
        ('tester_2', 'tester_2@example.com', '${await hashPassword(
          process.env.TEST_PASSWORD2
        )}', 'Jane Smith', FALSE),
        ('tester_3', 'tester_3@example.com', '${await hashPassword(
          process.env.TEST_PASSWORD3
        )}', 'Mike Johnson', FALSE),
        ('tester_4', 'tester_4@example.com', '${await hashPassword(
          process.env.TEST_PASSWORD4
        )}', 'Alice Wilson', FALSE),
        ('rachel_gina', 'rachel_gina@example.com', '${await hashPassword(
          process.env.RACHEL_PASSWORD
        )}', 'Rachel Gina', TRUE),
        ('amelia_tan', 'amelia_tan@example.com', '${await hashPassword(
          process.env.AMELIA_PASSWORD
        )}', 'Amelia Tan', TRUE),
        ('tester_admin', 'tester_admin@example.com', '${await hashPassword(
          process.env.ADMIN_TESTER_PASSWORD
        )}', 'Tester Admin', TRUE)
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

    // Insert Exercises
    const exercisesQuery = `
      INSERT INTO exercises (name, category, description, is_weighted, image_url, video_url)
      VALUES
        ('Push Up', 'arms', 'A bodyweight exercise targeting the chest, shoulders, and triceps.', false, 
        'https://cdn.pixabay.com/photo/2017/08/30/12/45/push-up-2696030_1280.jpg', 
        'https://www.youtube.com/watch?v=_l3ySVKYVJ8'),
        
        ('Squat', 'legs', 'A foundational lower body exercise to build strength in the quads, hamstrings, and glutes.', true, 
        'https://cdn.pixabay.com/photo/2016/03/26/22/40/squat-1284619_1280.jpg', 
        'https://www.youtube.com/watch?v=aclHkVaku9U'),

        ('Running', 'cardio', 'An aerobic exercise that enhances cardiovascular endurance and burns calories.', false, 
        'https://cdn.pixabay.com/photo/2015/01/20/13/13/sunset-605305_1280.jpg', 
        'https://www.youtube.com/watch?v=6U6hX7ei5eM'),

        ('Deadlift', 'full body', 'A compound movement that targets the posterior chain, improving overall body strength.', true, 
        'https://cdn.pixabay.com/photo/2017/04/07/09/23/deadlift-2210482_1280.jpg', 
        'https://www.youtube.com/watch?v=op9kVnSso6Q'),

        ('Bench Press', 'chest', 'A key upper body exercise to develop strength in the chest, shoulders, and triceps.', true, 
        'https://cdn.pixabay.com/photo/2017/08/02/16/09/barbell-2572178_1280.jpg', 
        'https://www.youtube.com/watch?v=gRVjAtPip0Y'),

        ('Pull Up', 'back', 'A challenging bodyweight exercise that strengthens the lats, biceps, and upper back.', true, 
        'https://cdn.pixabay.com/photo/2016/03/27/19/48/pull-up-1284619_1280.jpg', 
        'https://www.youtube.com/watch?v=eGo4IYlbE5g'),

        ('Plank', 'core', 'A core stabilization exercise that engages the abs, back, and shoulders.', false, 
        'https://cdn.pixabay.com/photo/2016/03/27/19/48/plank-1284625_1280.jpg', 
        'https://www.youtube.com/watch?v=B296mZDhrP4'),

        ('Burpees', 'full body', 'A high-intensity full-body exercise combining strength and cardio to boost endurance.', false, 
        'https://cdn.pixabay.com/photo/2016/03/27/19/48/burpees-1284624_1280.jpg', 
        'https://www.youtube.com/watch?v=TU8QYVW0gDU'),

        ('Lunges', 'legs', 'A dynamic leg exercise that targets the quads, hamstrings, and glutes, improving balance and coordination.', true, 
        'https://cdn.pixabay.com/photo/2016/03/27/19/48/lunges-1284622_1280.jpg', 
        'https://www.youtube.com/watch?v=QOVaHwm-Q6U'),

        ('Bicep Curl', 'arms', 'An isolated arm exercise focused on building the bicep muscles.', true, 
        'https://cdn.pixabay.com/photo/2016/03/27/19/48/bicep-curl-1284620_1280.jpg', 
        'https://www.youtube.com/watch?v=ykJmrZ5v0Oo'),

        ('Tricep Dip', 'arms', 'A tricep-focused exercise that also engages the chest and shoulders.', false, 
        'https://cdn.pixabay.com/photo/2016/03/27/19/48/tricep-dip-1284621_1280.jpg', 
        'https://www.youtube.com/watch?v=0326dy_-CzM'),

        ('Jump Rope', 'cardio', 'A simple yet effective cardio exercise that improves coordination and endurance.', false, 
        'https://cdn.pixabay.com/photo/2017/05/17/12/42/fitness-2317180_1280.jpg', 
        'https://www.youtube.com/watch?v=fcN37TxBE_s'),

        ('Overhead Press', 'shoulders', 'A compound exercise that builds shoulder strength and stability.', true, 
        'https://cdn.pixabay.com/photo/2017/01/31/20/44/overhead-press-2022627_1280.jpg', 
        'https://www.youtube.com/watch?v=F3QY5vMz_6I'),

        ('Leg Press', 'legs', 'A machine-based exercise that strengthens the quadriceps, hamstrings, and glutes.', true, 
            'https://cdn.pixabay.com/photo/2016/03/27/19/48/leg-press-1284618_1280.jpg', 
            'https://www.youtube.com/watch?v=lUEqJGWXUJ8'),

        ('Mountain Climbers', 'core', 'A dynamic core exercise that also boosts cardiovascular endurance.', false, 
        'https://cdn.pixabay.com/photo/2017/02/08/19/22/mountain-climbers-2042203_1280.jpg', 
        'https://www.youtube.com/watch?v=nmwgirgXLYM')
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
      (${exerciseIds[7]}, 2, 'Squat down, placing your hands on the floor in front of you.'),
      (${exerciseIds[7]}, 3, 'Kick your feet back into a plank position.'),
      (${exerciseIds[7]}, 4, 'Do a push-up.'),
      (${exerciseIds[7]}, 5, 'Quickly return your feet to the squat position.'),
      (${exerciseIds[7]}, 6, 'Jump explosively into the air.'),
      (${exerciseIds[8]}, 1, 'Stand with your feet together.'),
      (${exerciseIds[8]}, 2, 'Take a step forward with your right leg and lower your body until your right thigh is parallel to the floor and your right knee is directly above your ankle.'),
      (${exerciseIds[8]}, 3, 'Push off with your right foot to return to the starting position.'),
      (${exerciseIds[8]}, 4, 'Repeat on the other side.'),
      (${exerciseIds[9]}, 1, 'Stand with feet shoulder-width apart, holding a dumbbell in each hand with palms facing forward.'),
      (${exerciseIds[9]}, 2, 'Curl the dumbbells upward, keeping your elbows close to your sides.'),
      (${exerciseIds[9]}, 3, 'Slowly lower the dumbbells back to the starting position.'),
      (${exerciseIds[10]}, 1, 'Place your hands shoulder-width apart on a bench or sturdy surface behind you.'),
      (${exerciseIds[10]}, 2, 'Extend your legs out in front of you, resting on your heels.'),
      (${exerciseIds[10]}, 3, 'Lower your body by bending your elbows until they reach a 90-degree angle.'),
      (${exerciseIds[10]}, 4, 'Push back up to the starting position.'),
      (${exerciseIds[11]}, 1, 'Hold the jump rope handles, keeping your elbows close to your body.'),
      (${exerciseIds[11]}, 2, 'Rotate your wrists to swing the rope over your head.'),
      (${exerciseIds[11]}, 3, 'Hop over the rope as it passes your feet.'),
      (${exerciseIds[12]}, 1, 'Stand with your feet shoulder-width apart, holding a barbell across your upper back with an overhand grip.'),
      (${exerciseIds[12]}, 2, 'Keeping your core engaged, press the barbell straight up over your head until your arms are fully extended.'),
      (${exerciseIds[12]}, 3, 'Lower the barbell back to the starting position with control.'),
      (${exerciseIds[13]}, 1, 'Adjust the seat and weight on the leg press machine.'),
      (${exerciseIds[13]}, 2, 'Place your feet shoulder-width apart on the platform.'),
      (${exerciseIds[13]}, 3, 'Push the platform away from you by extending your legs.'),
      (${exerciseIds[13]}, 4, 'Slowly lower the platform back down until your knees are slightly bent.'),
      (${exerciseIds[14]}, 1, 'Start in a high plank position with your hands shoulder-width apart.'),
      (${exerciseIds[14]}, 2, 'Bring one knee towards your chest, then quickly alternate, bringing the other knee in.'),
      (${exerciseIds[14]}, 3, 'Maintain a fast pace, as if running in place.');
  `;

    await client.query(exerciseInstructionsQuery);

    // Insert Programme Exercises (Associating exercises with programmes)
    const programmeExercisesQuery = `
    INSERT INTO programme_exercises (programme_id, exercise_id, reps, sets)
    VALUES
      (${programmeIds[0]}, ${exerciseIds[0]}, 15, 3),
      (${programmeIds[0]}, ${exerciseIds[1]}, 20, 3), 
      (${programmeIds[0]}, ${exerciseIds[2]}, 30, 1),
      (${programmeIds[1]}, ${exerciseIds[3]}, 8, 4),
      (${programmeIds[1]}, ${exerciseIds[4]}, 10, 4),
      (${programmeIds[1]}, ${exerciseIds[9]}, 12, 3),
      (${programmeIds[2]}, ${exerciseIds[2]}, 45, 1),
      (${programmeIds[2]}, ${exerciseIds[11]}, 60, 1),
      (${programmeIds[2]}, ${exerciseIds[14]}, 20, 3),
      (${programmeIds[3]}, ${exerciseIds[3]}, 5, 5),
      (${programmeIds[3]}, ${exerciseIds[12]}, 10, 4),
      (${programmeIds[3]}, ${exerciseIds[4]}, 5, 5),
      (${programmeIds[4]}, ${exerciseIds[7]}, 15, 3),
      (${programmeIds[4]}, ${exerciseIds[0]}, 10, 3),
      (${programmeIds[4]}, ${exerciseIds[14]}, 20, 2),
      (${programmeIds[5]}, ${exerciseIds[6]}, 60, 1),
      (${programmeIds[5]}, ${exerciseIds[13]}, 20, 3),
      (${programmeIds[5]}, ${exerciseIds[8]}, 12, 2),
      (${programmeIds[6]}, ${exerciseIds[3]}, 10, 3),
      (${programmeIds[6]}, ${exerciseIds[7]}, 12, 4),
      (${programmeIds[6]}, ${exerciseIds[1]}, 15, 4),
      (${programmeIds[7]}, ${exerciseIds[13]}, 15, 3),
      (${programmeIds[7]}, ${exerciseIds[8]}, 10, 3),
      (${programmeIds[7]}, ${exerciseIds[6]}, 60, 2),
      (${programmeIds[8]}, ${exerciseIds[2]}, 60, 1),
      (${programmeIds[8]}, ${exerciseIds[14]}, 30, 2),
      (${programmeIds[8]}, ${exerciseIds[11]}, 100, 1),
      (${programmeIds[9]}, ${exerciseIds[6]}, 30, 1),
      (${programmeIds[9]}, ${exerciseIds[14]}, 15, 3),
      (${programmeIds[9]}, ${exerciseIds[8]}, 20, 3);
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
      (${userProgrammeIds[0]}, ${exerciseIds[0]}, NULL, NULL, 8, 12),
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
      (${userExerciseIds[0]}, NULL, 10, 3),
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
    RETURNING id;
  `;
    await client.query(exerciseRecordsQuery);

    console.log(
      "User programmes, exercises, and exercise records have been inserted successfully!"
    );
  } catch (err) {
    console.error("Error inserting user data:", err.stack);
  } finally {
    await client.end();
    console.log("Disconnected from the database.");
  }
};

seedDatabase();
