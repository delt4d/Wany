import { AuthenticationRoles } from "@middleware/authorization-middleware";
import { User, UserRepository } from "@models/users";
import { HttpErrorResponse } from "@routes/index";
import { controller } from "@utils/controller";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

const repository = new UserRepository()
const path = "/api/users"

export const getManyUsersController = controller(path, (req) => {
    const users = repository.getAll();
    return users;
});

export const createUserController = controller(path + "/create", async (req, error) => {
    const validation = validationResult(req);
    const errors = validation.array();
    
    const { email, username } = req.body;

    if (!validation.isEmpty()) {
        for (let err of errors) {
            if (err.type === 'field')
                return error(
                    HttpErrorResponse.BadRequest,
                    err.msg,
                    `${err.msg}, valor atual '${err.value}' parâmetro ${err.location}.${err.path}`);
        }

        return error(
            HttpErrorResponse.BadRequest, 
            errors[0].msg,
            errors[0].msg);
    }

    if ((await repository.check({ email })) != null) {
        return error(
          HttpErrorResponse.BadRequest,
          "email cadastrado",
          `o email ${email} já é cadastrado`  
        );
    }

    if ((await repository.check({ username })) != null) {
        return error(
            HttpErrorResponse.BadRequest,
            "nome de usuário indisponível", 
            `o nome de usuário ${username} já está sendo utilizado`
        );
    }

    const createdUser = await repository.create(new User(req.body));

    if (!createdUser) return error(
        HttpErrorResponse.BadRequest,
        "cadastro não realizado", 
        "não foi possível cadastrar o usuário"
    );

    return createdUser;
});

export const updateUserAvatarController = controller(path + "/update/avatar", async (req, error) => {
    const { id } = req.params
    const avatar = req.file ?? null

    if (!id) return error(
        HttpErrorResponse.BadRequest,
        "parâmetro 'id' ausente",
        "o id do usuário não foi passado nos parâmetros requisição"
    );

    // É admin e vai remover o avatar ou o próprio usuário?
    if (req.user!.role != AuthenticationRoles.admin && id != req.user!.id)
        return error(
            HttpErrorResponse.Unauthorized,
            "sem autorização para alterar o avatar deste usuário",
            `para alterar o avatar do usuário com id '${id}', você precisa estar logado nesta conta ou ser administrador`
        );

    if (req.user!.role == AuthenticationRoles.admin && avatar != null)
        return error(
            HttpErrorResponse.Unauthorized,
            "sem autorização para alterar o avatar deste usuário",
            `um administrador não pode mudar o avatar de um usuário, apenas remover`
        );

    await repository.updateAvatar(id, avatar?.buffer ?? null)
});

export const updatePasswordController = controller(path + "/update/password", async (req, error) => {
    const validation = validationResult(req)
    const errors = validation.array()

    const { oldPassword, newPassword } = req.body;
    const userIdToUpdatePassword = req.user!.id

    // É o próprio usuário?
    if (req.user!.role != AuthenticationRoles.admin && userIdToUpdatePassword != req.user!.id)
        return error(
            HttpErrorResponse.Unauthorized,
            "sem autorização para atualizar a senha deste usuário",
            `para alterar a senha do usuário com id '${userIdToUpdatePassword}', você precisa estar logado nesta conta`
        );

    if (!validation.isEmpty()) {
        for (let err of errors) {
            if (err.type === 'field')
                return error(
                    HttpErrorResponse.BadRequest,
                    err.msg,
                    `${err.msg}, valor atual '${err.value}' parâmetro ${err.location}.${err.path}`);
        }

        return error(
            HttpErrorResponse.BadRequest, 
            errors[0].msg,
            errors[0].msg);
    }

    await repository.updatePassword(userIdToUpdatePassword, oldPassword, newPassword);
});

export const updateUserDataController = controller(path + "/update", async (req, error) => {
    const { user } = req.body
    if (!user) return error(
        HttpErrorResponse.BadRequest,
        "dados ausentes",
        `dados necessários da requisição ausentes, recebido ${JSON.stringify(req.body)}`
    );

    const { id: userIdToUpdate, username } = user
    if (!userIdToUpdate) return error(
        HttpErrorResponse.BadRequest,
        "parâmetro 'id' ausente",
        `o id do usuário não foi passado no corpo da requisição. valor atual ${JSON.stringify(user)}`
    );

    // É admin ou o próprio usuário?
    if (req.user!.role != AuthenticationRoles.admin && userIdToUpdate != req.user!.id)
        return error(
            HttpErrorResponse.Unauthorized,
            "sem autorização para atualizar as informações deste usuário",
            `para atualizar o usuário com id '${userIdToUpdate}', você precisa estar logado nesta conta ou ser administrador`
        );

    const updatedUser = await repository.update(new User({ id: userIdToUpdate, username: username ?? null }))
    return updatedUser;
});

export const getMyUserDataController = controller(path + "/me", async (req, error) => {
    if (!req.user) return error(
        HttpErrorResponse.NotFound,
        "não autenticado",
        "você não está autenticado, faça login para poder obter seus dados"
    );
    const user = await repository.get(req.user.id);
    return user;
});

export const getUserByIdController = controller(path + "/{id}", async (req, error) => {
    const { id } = req.params

    if (!id) return error(
        HttpErrorResponse.BadRequest,
        "parâmetro 'id' ausente",
        "o id do usuário não foi passado nos parâmetros requisição"
    );

    const user = await repository.get(id)

    if (!user) {
        return error(
            HttpErrorResponse.NotFound,
            "usuário não encontrado",
            "não existe usuário com id '" + id + "' cadastrado no banco"
        );
    }

    return user;
});

export const deleteMyUserController = controller(path + "/delete", async (req, error) => {
    if (!req.user) return error(
        HttpErrorResponse.NotFound,
        "não autenticado",
        "você precisa estar logado para deletar sua conta"
    );

    await repository.delete(req.user.id)
    return null;
});

export const checkEmailIsBusyController = controller(path + "/check-email", async (req, error) => {
    const { email } = req.body;
    if (!email) return error(
        HttpErrorResponse.BadRequest,
        "parâmetro 'email' ausente",
        "o email a ser verificado não foi passado na requisição"
    );

    const userId = await repository.check({ email })
    return !!userId // se não pegar o id, é porque o email está livre
});