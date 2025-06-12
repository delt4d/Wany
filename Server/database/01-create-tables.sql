-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    usr_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usr_email VARCHAR(255) NOT NULL UNIQUE,
    usr_username VARCHAR(100) NOT NULL UNIQUE,
    usr_password VARCHAR(255) NOT NULL,
    usr_avatar BLOB,
    usr_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    proj_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    proj_name VARCHAR(255) NOT NULL,
    proj_description TEXT,
    proj_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    proj_file VARCHAR(255),
    proj_image BLOB,
    proj_user_id CHAR(36),
    FOREIGN KEY (proj_user_id) REFERENCES users(usr_id) ON DELETE CASCADE
);

-- PROJECT STARS TABLE
CREATE TABLE IF NOT EXISTS project_stars (
    star_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    star_user_id CHAR(36) NOT NULL,
    star_proj_id CHAR(36) NOT NULL,
    UNIQUE KEY unique_star (star_user_id, star_proj_id),
    FOREIGN KEY (star_user_id) REFERENCES users(usr_id) ON DELETE CASCADE,
    FOREIGN KEY (star_proj_id) REFERENCES projects(proj_id) ON DELETE CASCADE
);