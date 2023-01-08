import { authConfig } from "@config/auth-config";
import { UserRepository } from "@models/users";
import { HttpErrorResponse } from "@routes/index";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

const path = "/api/projects"
const repository = new UserRepository();

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/login"

    try {
        const { email, password, expiresIn } = req.body
        const userId = await repository.check({ email, password })

        if (!userId) return next(HttpErrorResponse.Unauthorized("email ou senha inválidos", `não existe usuário com o email ${email} ou a senha passada no corpo da requisição`, myPath))

        const token = jwt.sign({ userId }, authConfig.secret_token, { expiresIn: expiresIn ?? (1000 * 60 * 60 * 24) })

        res.cookie("secret_token", token, {
            // secure: true,
            httpOnly: true,
            path: "/",
            expires: new Date(Date.now() + 900000),
            maxAge: 1000 * 60 * 10
            // sameSite: "none"
            // sameSite: "lax"
        })

        return res.send(userId)
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/logout"

    try {
        return res.clearCookie("secret_token").end()
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}