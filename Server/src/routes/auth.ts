import { Router } from "express";
import { body } from "express-validator";
import { authorizationMiddleware } from "@middleware/authorization-middleware";
import { loginController, logoutController } from "controllers/auth";

const authRouter = Router()

authRouter.patch("/login",
    body('email').exists().trim().notEmpty().isEmail().escape().withMessage("email inválido"),
    body('password').exists().trim().notEmpty().withMessage("senha inválida"),
    loginController)

authRouter.patch("/logout", authorizationMiddleware, logoutController)

export { authRouter }