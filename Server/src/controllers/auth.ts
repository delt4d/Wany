import { authConfig } from "@config/auth-config";
import { UserRepository } from "@models/users";
import { HttpErrorResponse } from "@routes/index";
import { controller } from "@utils/controller";
import jwt from "jsonwebtoken"

const path = "/api/projects";
const repository = new UserRepository();

export const loginController = controller(path + "/login", async (req, error, res) => {
    const { email, password, expiresIn } = req.body;
    const userId = await repository.check({ email, password });

    if (!userId) return error(
        HttpErrorResponse.Unauthorized,
        "email ou senha inválidos",
        `não existe usuário com o email ${email} ou a senha passada no corpo da requisição`
    );

    const token = jwt.sign({ userId }, authConfig.secret_token, { expiresIn: expiresIn ?? (1000 * 60 * 60 * 24) });

    res.cookie("secret_token", token, {
        httpOnly: true,
        path: "/",
        expires: new Date(Date.now() + 900000),
        maxAge: 1000 * 60 * 10
    });

    return userId;
})

export const logoutController = controller(path + "/logout", async (req, error, res) => {
    res.clearCookie("secret_token");
    return;
})