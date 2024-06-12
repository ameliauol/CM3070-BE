const client = require("./db");

client.query(
  `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS available_programmes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_category CHECK (category IN ('chest', 'back', 'arms', 'legs', 'core', 'full body', 'shoulders', 'others', 'cardio'))
  );

  CREATE TABLE IF NOT EXISTS programme_exercises (
    id SERIAL PRIMARY KEY,
    programme_id INTEGER REFERENCES available_programmes(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    goal_weight FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_programmes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    programme_id INTEGER REFERENCES available_programmes(id),
    start_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    days_per_week INTEGER,
    active_days VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

  CREATE TABLE IF NOT EXISTS user_exercises (
    id SERIAL PRIMARY KEY,
    user_programme_id INTEGER REFERENCES user_programmes(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id),
    current_weight FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS exercise_records (
    id SERIAL PRIMARY KEY,
    user_exercise_id INTEGER REFERENCES user_exercises(id) ON DELETE CASCADE,
    weight FLOAT,
    date_achieved DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_calendar (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE,
    programme_id INTEGER REFERENCES user_programmes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`,
  (err, res) => {
    if (err) {
      console.error("Error creating tables:", err);
    } else {
      console.log("Tables created successfully");
    }
    client.end();
  }
);
