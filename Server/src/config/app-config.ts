import dotenv from 'dotenv'
dotenv.config()

export const appConfig = {
    port: process.env.PORT ? parseInt(process.env.PORT) : null || 8080,
    host: process.env.HOST || "localhost",
    frontend: process.env.FRONTEND ?? "http://localhost:3000"
}