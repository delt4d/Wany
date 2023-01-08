import { AuthenticationRoles } from "@middleware/authorization-middleware";
import { User, UserRepository } from "@models/users";
import { HttpErrorResponse } from "@routes/index";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

const repository = new UserRepository()
const path = "/api/users"

export const getManyUsersController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path
    try {
        const users = await repository.getAll()
        return res.send(users)
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/create"

    const validation = validationResult(req)
    const errors = validation.array()

    try {
        const { email, username } = req.body

        if (!validation.isEmpty()) {
            return next(HttpErrorResponse.BadRequest(errors[0].msg, `${errors[0].msg}, valor atual '${errors[0].value}' parâmetro ${errors[0].location}.${errors[0].param}`, myPath))
        }

        if ((await repository.check({ email })) != null) {
            return next(HttpErrorResponse.BadRequest("email cadastrado", `o email ${email} já é cadastrado`, myPath))
        }

        if ((await repository.check({ username })) != null) {
            return next(HttpErrorResponse.BadRequest("nome de usuário indisponível", `o nome de usuário ${username} já está sendo utilizado`, myPath))
        }

        const createdUser = await repository.create(new User(req.body))
        if (!createdUser) return next(HttpErrorResponse.BadRequest("cadastro não realizado", "não foi possível cadastrar o usuário", myPath))

        return res.send(createdUser)
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const updateUserAvatarController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/update/avatar"

    try {
        const { id } = req.params
        const avatar = req.file ?? null

        if (!id) return next(HttpErrorResponse.BadRequest("parâmetro 'id' ausente", "o id do usuário não foi passado nos parâmetros requisição", myPath))

        // É admin e vai remover o avatar ou o próprio usuário?
        if (req.user!.role != AuthenticationRoles.admin && id != req.user!.id)
            return next(HttpErrorResponse.Unauthorized("sem autorização para alterar o avatar deste usuário", `para alterar o avatar do usuário com id '${id}', você precisa estar logado nesta conta ou ser administrador`, myPath))

        if (req.user!.role == AuthenticationRoles.admin && avatar != null)
            return next(HttpErrorResponse.Unauthorized("sem autorização para alterar o avatar deste usuário", `um administrador não pode mudar o avatar de um usuário, apenas remover`, myPath))

        repository.updateAvatar(id, avatar?.buffer ?? null)
        return res.end()
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const updatePasswordController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/update/password"
    const validation = validationResult(req)
    const errors = validation.array()

    try {
        const { oldPassword, newPassword } = req.body;

        const userIdToUpdatePassword = req.user!.id

        // É o próprio usuário?
        if (req.user!.role != AuthenticationRoles.admin && userIdToUpdatePassword != req.user!.id)
            return next(HttpErrorResponse.Unauthorized("sem autorização para atualizar a senha deste usuário", `para alterar a senha do usuário com id '${userIdToUpdatePassword}', você precisa estar logado nesta conta`, myPath))

        if (!validation.isEmpty()) {
            return next(HttpErrorResponse.BadRequest(errors[0].msg, `${errors[0].msg}, valor atual '${errors[0].value}' parâmetro ${errors[0].location}->${errors[0].param}`, myPath))
        }

        repository.updatePassword(userIdToUpdatePassword, oldPassword, newPassword);
        return res.end()
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const updateUserDataController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/update"
    try {
        const { user } = req.body
        if (!user) return next(HttpErrorResponse.BadRequest("dados ausentes", `dados necessários da requisição ausentes, recebido ${JSON.stringify(req.body)}`, myPath))

        const { id: userIdToUpdate, username } = user
        if (!userIdToUpdate) return next(HttpErrorResponse.BadRequest("parâmetro 'id' ausente", `o id do usuário não foi passado no corpo da requisição. valor atual ${JSON.stringify(user)}`, myPath))

        // É admin ou o próprio usuário?
        if (req.user!.role != AuthenticationRoles.admin && userIdToUpdate != req.user!.id)
            return next(HttpErrorResponse.Unauthorized("sem autorização para atualizar as informações deste usuário", `para atualizar o usuário com id '${userIdToUpdate}', você precisa estar logado nesta conta ou ser administrador`, myPath))

        const updatedUser = await repository.update(new User({ id: userIdToUpdate, username: username ?? null }))
        return res.send(updatedUser)
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const getMyUserDataController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/me"
    try {
        if (!req.user) return next(HttpErrorResponse.NotFound("não autenticado", "você não está autenticado, faça login para poder obter seus dados", myPath));
        const user = await repository.get(req.user.id);
        res.send(user);
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const getUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/{id}"
    try {
        const { id } = req.params

        if (!id) return next(HttpErrorResponse.BadRequest("parâmetro 'id' ausente", "o id do usuário não foi passado nos parâmetros requisição", myPath))

        const user = await repository.get(id)

        if (!user) {
            return next(HttpErrorResponse.NotFound("usuário não encontrado", "não existe usuário com id '" + id + "' cadastrado no banco", myPath))
        }

        return res.send(user)
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const deleteMyUserController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/delete"

    try {
        if (!req.user) return next(HttpErrorResponse.NotFound("não autenticado", "você precisa estar logado para deletar sua conta", myPath))

        await repository.delete(req.user.id)
        return res.end()

    } catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const checkEmailIsBusyController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/check-email"
    try {
        const { email } = req.body;
        if (!email) return next(HttpErrorResponse.BadRequest("parâmetro 'email' ausente", "o email a ser verificado não foi passado na requisição", myPath))

        const userId = await repository.check({ email })
        return res.send(!!userId) // se não pegar o id, é porque o email está livre

    } catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}