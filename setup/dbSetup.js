const { client } = require("../db");

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
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
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

CREATE TABLE IF NOT EXISTS exercise_instructions (
  id SERIAL PRIMARY KEY,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS programme_exercises (
  id SERIAL PRIMARY KEY,
  programme_id INTEGER REFERENCES available_programmes(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_programmes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  programme_id INTEGER REFERENCES available_programmes(id),
  start_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  active_days VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_active_days CHECK (active_days ~ '^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(,(monday|tuesday|wednesday|thursday|friday|saturday|sunday)){0,2}$')
);

CREATE TABLE IF NOT EXISTS user_exercises (
  id SERIAL PRIMARY KEY,
  user_programme_id INTEGER REFERENCES user_programmes(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id),
  start_weight FLOAT NOT NULL,
  goal_weight FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exercise_records (
  id SERIAL PRIMARY KEY,
  user_exercise_id INTEGER REFERENCES user_exercises(id) ON DELETE CASCADE,
  weight FLOAT NOT NULL,
  date_achieved TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
