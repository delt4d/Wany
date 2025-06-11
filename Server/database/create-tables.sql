-- Users table
CREATE TABLE users (
    usr_id SERIAL PRIMARY KEY,
    usr_email VARCHAR(255) UNIQUE NOT NULL,
    usr_username VARCHAR(100) UNIQUE NOT NULL,
    usr_password VARCHAR(255) NOT NULL,
    usr_avatar BYTEA,
    usr_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    proj_id SERIAL PRIMARY KEY,
    proj_name VARCHAR(255) NOT NULL,
    proj_description TEXT,
    proj_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    proj_file VARCHAR(255),
    proj_image BYTEA,
    proj_user_id INTEGER REFERENCES users(usr_id) ON DELETE CASCADE
);

-- Project stars (many-to-many)
CREATE TABLE project_stars (
    star_id SERIAL PRIMARY KEY,
    star_user_id INTEGER REFERENCES users(usr_id) ON DELETE CASCADE,
    star_proj_id INTEGER REFERENCES projects(proj_id) ON DELETE CASCADE,
    UNIQUE(star_user_id, star_proj_id)
);