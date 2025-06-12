DELIMITER $$

-- CREATE USER
CREATE PROCEDURE CreateUser(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_username VARCHAR(100),
    OUT p_id CHAR(36)
)
BEGIN
    SET p_id = UUID();
    INSERT INTO users (usr_id, usr_email, usr_password, usr_username)
    VALUES (p_id, p_email, MD5(p_password), p_username);
END$$

-- SELECT USER BY ID
CREATE PROCEDURE SelectUser(IN p_id CHAR(36))
BEGIN
    SELECT usr_id AS id, usr_email AS email, usr_username AS username, usr_avatar AS avatar, usr_created AS created_date
    FROM users WHERE usr_id = p_id;
END$$

-- SELECT MANY USERS (OPTIONAL LIMIT)
CREATE PROCEDURE SelectManyUsers(IN p_limit INT)
BEGIN
    IF p_limit IS NULL OR p_limit = 0 THEN
        SELECT usr_id AS id, usr_email AS email, usr_username AS username, usr_avatar AS avatar, usr_created AS created_date
        FROM users ORDER BY usr_id;
    ELSE
        SELECT usr_id AS id, usr_email AS email, usr_username AS username, usr_avatar AS avatar, usr_created AS created_date
        FROM users ORDER BY usr_id LIMIT p_limit;
    END IF;
END$$

-- UPDATE USER
CREATE PROCEDURE UpdateUser(IN p_id CHAR(36), IN p_username VARCHAR(100))
BEGIN
    UPDATE users SET usr_username = p_username WHERE usr_id = p_id;
END$$

-- UPDATE USER AVATAR
CREATE PROCEDURE UpdateUserAvatar(IN p_id CHAR(36), IN p_avatar BLOB)
BEGIN
    UPDATE users SET usr_avatar = p_avatar WHERE usr_id = p_id;
END$$

-- UPDATE USER PASSWORD
CREATE PROCEDURE UpdateUserPassword(IN p_id CHAR(36), IN p_new_password VARCHAR(255))
BEGIN
    UPDATE users SET usr_password = MD5(p_new_password) WHERE usr_id = p_id;
END$$

-- DELETE USER
CREATE PROCEDURE DeleteUser(IN p_id CHAR(36))
BEGIN
    DELETE FROM users WHERE usr_id = p_id;
END$$

-- CREATE PROJECT
CREATE PROCEDURE CreateProject(
    IN p_name VARCHAR(255),
    IN p_file VARCHAR(255),
    IN p_image BLOB,
    IN p_description TEXT,
    IN p_userId CHAR(36),
    OUT p_id CHAR(36)
)
BEGIN
    SET p_id = UUID();
    INSERT INTO projects (proj_id, proj_name, proj_file, proj_image, proj_description, proj_user_id)
    VALUES (p_id, p_name, p_file, p_image, p_description, p_userId);
END$$

-- SELECT PROJECT BY ID (optionally filtered by user)
CREATE PROCEDURE SelectProject(IN p_id CHAR(36), IN p_user CHAR(36))
BEGIN
    SELECT proj_id AS id, proj_name AS name, proj_description AS description, proj_created AS created_date,
           proj_file AS filePath, proj_image AS image, proj_user_id AS userId
    FROM projects
    WHERE proj_id = p_id AND (p_user = '' OR proj_user_id = p_user);
END$$

-- SELECT PROJECTS FOR USER
CREATE PROCEDURE SelectUserProjects(IN p_id CHAR(36))
BEGIN
    SELECT proj_id AS id, proj_name AS name, proj_description AS description, proj_created AS created_date,
           proj_file AS filePath, proj_image AS image, proj_user_id AS userId
    FROM projects WHERE proj_user_id = p_id;
END$$

-- UPDATE PROJECT
CREATE PROCEDURE UpdateProject(IN p_id CHAR(36), IN p_name VARCHAR(255), IN p_file VARCHAR(255))
BEGIN
    UPDATE projects SET proj_name = p_name, proj_file = p_file WHERE proj_id = p_id;
END$$

-- DELETE PROJECT
CREATE PROCEDURE DeleteProject(IN p_id CHAR(36))
BEGIN
    DELETE FROM projects WHERE proj_id = p_id;
END$$

-- SET PROJECT STAR
CREATE PROCEDURE SetProjectStar(IN p_user CHAR(36), IN p_projec CHAR(36))
BEGIN
    INSERT IGNORE INTO project_stars (star_id, star_user_id, star_proj_id)
    VALUES (UUID(), p_user, p_projec);
END$$

-- SELECT MANY PROJECTS (SEARCH, PAGINATION, FILTER BY USER)
CREATE PROCEDURE SelectManyProjects(
    IN p_limit INT,
    IN p_search VARCHAR(255),
    IN p_start_index INT,
    IN p_user CHAR(36)
)
BEGIN
    SET @search = CONCAT('%', p_search, '%');
    IF p_user IS NULL OR p_user = '' THEN
        SELECT proj_id AS id, proj_name AS name, proj_description AS description, proj_created AS created_date,
               proj_file AS filePath, proj_image AS image, proj_user_id AS userId
        FROM projects
        WHERE proj_name LIKE @search
        ORDER BY proj_created DESC
        LIMIT p_start_index, p_limit;
    ELSE
        SELECT proj_id AS id, proj_name AS name, proj_description AS description, proj_created AS created_date,
               proj_file AS filePath, proj_image AS image, proj_user_id AS userId
        FROM projects
        WHERE proj_name LIKE @search AND proj_user_id = p_user
        ORDER BY proj_created DESC
        LIMIT p_start_index, p_limit;
    END IF;
END$$

-- SELECT PROJECTS IMAGES BY LIST OF IDS
CREATE PROCEDURE SelectProjectsImages(
    IN p_list TEXT
)
BEGIN
    -- p_list should be a comma-separated string of UUIDs, e.g. 'uuid1,uuid2,uuid3'
    SET @sql = CONCAT(
        'SELECT proj_id AS id, proj_image AS image FROM projects WHERE proj_id IN (',
        REPLACE(p_list, ',', ''','''),
        ')'
    );
    SET @sql = REPLACE(@sql, 'IN (', 'IN (''');
    SET @sql = REPLACE(@sql, ')', ''')');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DELIMITER ;