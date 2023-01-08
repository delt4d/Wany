import dotenv from 'dotenv'
dotenv.config()

export const dbConfig = {
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "",
    host: process.env.DB_HOST || "",
    // username: process.env.MYSQL_ADDON_USER,
    // database: process.env.MYSQL_ADDON_DB,
    // password: process.env.MYSQL_ADDON_PASSWORD,
    // host: process.env.MYSQL_ADDON_HOST,
    port: process.env.DB_PORT || "3306"
}