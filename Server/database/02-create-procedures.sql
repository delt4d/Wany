-- Create a user
CREATE OR REPLACE FUNCTION CreateUser(
    p_email VARCHAR,
    p_password VARCHAR,
    p_username VARCHAR
) RETURNS INTEGER AS $$
DECLARE
    new_id INTEGER;
BEGIN
    INSERT INTO users (usr_email, usr_password, usr_username)
    VALUES (p_email, md5(p_password), p_username)
    RETURNING usr_id INTO new_id;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Select a user by id
CREATE OR REPLACE FUNCTION SelectUser(p_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    email VARCHAR,
    username VARCHAR,
    avatar BYTEA,
    created_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT usr_id, usr_email, usr_username, usr_avatar, usr_created
    FROM users WHERE usr_id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Select many users (with optional limit)
CREATE OR REPLACE FUNCTION SelectManyUsers(p_limit INTEGER DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    email VARCHAR,
    username VARCHAR,
    avatar BYTEA,
    created_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT usr_id, usr_email, usr_username, usr_avatar, usr_created
    FROM users
    ORDER BY usr_id
    LIMIT COALESCE(p_limit, ALL);
END;
$$ LANGUAGE plpgsql;

-- Create a project
CREATE OR REPLACE FUNCTION CreateProject(
    p_name VARCHAR,
    p_file VARCHAR,
    p_image BYTEA,
    p_description TEXT,
    p_userId INTEGER
) RETURNS INTEGER AS $$
DECLARE
    new_id INTEGER;
BEGIN
    INSERT INTO projects (proj_name, proj_file, proj_image, proj_description, proj_user_id)
    VALUES (p_name, p_file, p_image, p_description, p_userId)
    RETURNING proj_id INTO new_id;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Select a project by id
CREATE OR REPLACE FUNCTION SelectProject(p_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    description TEXT,
    created_date TIMESTAMP,
    filePath VARCHAR,
    image BYTEA,
    userId INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT proj_id, proj_name, proj_description, proj_created, proj_file, proj_image, proj_user_id
    FROM projects WHERE proj_id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Select projects for a user
CREATE OR REPLACE FUNCTION SelectUserProjects(p_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    description TEXT,
    created_date TIMESTAMP,
    filePath VARCHAR,
    image BYTEA,
    userId INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT proj_id, proj_name, proj_description, proj_created, proj_file, proj_image, proj_user_id
    FROM projects WHERE proj_user_id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Update user
CREATE OR REPLACE PROCEDURE UpdateUser(p_id INTEGER, p_username VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE users SET usr_username = p_username WHERE usr_id = p_id;
END;
$$;

-- Update user avatar
CREATE OR REPLACE PROCEDURE UpdateUserAvatar(p_id INTEGER, p_avatar BYTEA)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE users SET usr_avatar = p_avatar WHERE usr_id = p_id;
END;
$$;

-- Update user password
CREATE OR REPLACE PROCEDURE UpdateUserPassword(p_id INTEGER, p_new_password VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE users SET usr_password = md5(p_new_password) WHERE usr_id = p_id;
END;
$$;

-- Delete user
CREATE OR REPLACE PROCEDURE DeleteUser(p_id INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM users WHERE usr_id = p_id;
END;
$$;

-- Update project
CREATE OR REPLACE PROCEDURE UpdateProject(p_id INTEGER, p_name VARCHAR, p_file VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE projects SET proj_name = p_name, proj_file = p_file WHERE proj_id = p_id;
END;
$$;

-- Delete project
CREATE OR REPLACE PROCEDURE DeleteProject(p_id INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM projects WHERE proj_id = p_id;
END;
$$;

-- Set project star
CREATE OR REPLACE PROCEDURE SetProjectStar(p_user INTEGER, p_projec INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO project_stars (star_user_id, star_proj_id)
    VALUES (p_user, p_projec)
    ON CONFLICT (star_user_id, star_proj_id) DO NOTHING;
END;
$$;

-- Select many projects (with search and pagination)
CREATE OR REPLACE FUNCTION SelectManyProjects(
    p_search VARCHAR DEFAULT '',
    p_limit INTEGER DEFAULT 10,
    p_start_index INTEGER DEFAULT 0,
    p_user INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    description TEXT,
    created_date TIMESTAMP,
    filePath VARCHAR,
    image BYTEA,
    userId INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT proj_id, proj_name, proj_description, proj_created, proj_file, proj_image, proj_user_id
    FROM projects
    WHERE proj_name ILIKE '%' || p_search || '%'
    ORDER BY proj_created DESC
    OFFSET p_start_index
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;