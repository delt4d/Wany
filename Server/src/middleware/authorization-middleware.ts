import { authConfig } from "@config/auth-config"
import { HttpErrorResponse } from "@routes/index"
import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

export enum AuthenticationRoles {
    admin,
    user
}

export const authorizationMiddlewareWithoutThrow = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.secret_token

    if (!token) { return next(); }

    try {
        const data: any = jwt.verify(token, authConfig.secret_token)
        const { userId } = data

        req.user = {
            id: userId,
            role: AuthenticationRoles.user
        }
    }
    catch (err: any) { }
    finally { return next(); }
}

export const authorizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.secret_token

    if (!token) {
        return next(HttpErrorResponse.Unauthorized("token de acesso ausente", "o token de acesso da requisição está ausente", "authorization"))
    }

    try {
        const data: any = jwt.verify(token, authConfig.secret_token)
        const { userId } = data

        req.user = {
            id: userId,
            role: AuthenticationRoles.user
        }

        return next()
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal(err.message ?? "ocorreu um erro inesperado", err.message, "authorization"))
    }
}