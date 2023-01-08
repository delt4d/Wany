require("dotenv").config()

export const authConfig = {
    secret_token: process.env.SECRET_TOKEN ?? "",
}