CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    bio TEXT DEFAULT '',
    recipes_uploaded INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    ingredients JSONB DEFAULT '[]'::jsonb,
    instructions JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::text[],
    cuisine TEXT DEFAULT '',
    difficulty TEXT DEFAULT '',
    cook_time INTEGER DEFAULT 0,
    prep_time INTEGER DEFAULT 0,
    servings INTEGER DEFAULT 1,
    images TEXT[] DEFAULT ARRAY[]::text[],
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

INSERT INTO recipes (title, description, difficulty, cook_time, images)
VALUES ('Sample Recipe', 'This is a test recipe', 'Easy', 30, ARRAY['/public/images/Featured-Image.jfif']);