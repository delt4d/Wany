import { uploadConfig } from "@config/upload-config"
import { Project, ProjectRepository } from "@models/projects"
import { HttpErrorResponse } from "@routes/index"
import { Criptography } from "@utils/criptography"
import { createFile, deleteFile, duplicateFile, joinPath } from "@utils/files"
import { NextFunction, Request, Response } from "express"
import { validationResult } from "express-validator"

const repository = new ProjectRepository()
const path = "/api/projects"

export const getManyProjectsController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path
    try {
        const data = {
            offset: req.body.offset ?? 10,
            startIndex: req.body.startIndex ?? 0,
            search: req.body.search.trim().replaceAll(/[ ]+/g, " ") ?? "",
            userId: req.user?.id ?? ""
        }
        const projects = await repository.getAll(data)
        return res.send(projects)
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const getProjectsImagesController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/images"
    const validation = validationResult(req)
    const errors = validation.array()
    try {
        if (!validation.isEmpty()) {
            return next(HttpErrorResponse.BadRequest(errors[0].msg, `${errors[0].msg}, valor atual '${errors[0].value}' parâmetro ${errors[0].location}.${errors[0].param}`, myPath))
        }
        const { projectsIDs } = req.body
        const result = await repository.getProjectsImages(projectsIDs ?? null)
        return res.send(result)
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const setProjectStarController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/setstar"
    const validation = validationResult(req)
    const errors = validation.array()
    try {
        if (!validation.isEmpty()) {
            return next(HttpErrorResponse.BadRequest(errors[0].msg, `${errors[0].msg}, valor atual '${errors[0].value}' parâmetro ${errors[0].location}.${errors[0].param}`, myPath))
        }
        const { projectId } = req.body;
        const userId = req.user?.id ?? "";

        await repository.setStar(projectId, userId);
        return res.end();
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const getMyProjectsController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/my"

    try {
        const projects = await repository.getByUser(req.user!.id)
        return res.send(projects)
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const createProjectController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/create"
    const validation = validationResult(req)
    const errors = validation.array()

    try {
        if (!req.files || Array.isArray(req.files)) {
            return next(HttpErrorResponse.BadRequest("arquivos ausentes", "os arquivos da requisição estão ausentes.", myPath))
        }

        if (!validation.isEmpty()) {
            return next(HttpErrorResponse.BadRequest(errors[0].msg, `${errors[0].msg}, valor atual '${errors[0].value}' parâmetro ${errors[0].location}.${errors[0].param}`, myPath))
        }

        const { name, description } = req.body
        const userId = req.user!.id;
        const file = req.files.file[0]
        const image = req.files.image[0]

        if (!name && !file && !image) return next(HttpErrorResponse.BadRequest("dados ausentes", `dados necessários da requisição ausentes, recebido ${JSON.stringify(req.body)}.`, myPath))

        const data = {
            name,
            userId,
            file: file.buffer,
            fileName: Criptography.generateUUIDV4() + file.originalname.substring(file.originalname.indexOf('.')),
            image: image?.buffer,
            description
        }

        const filePath = joinPath(uploadConfig.projectsFolder, data.fileName)
        const createdProject = await repository.create(new Project(data))

        if (!createdProject) {
            return next(HttpErrorResponse.BadRequest("projeto não criado", "não foi possível criar o projeto.", myPath))
        }

        createFile(filePath, data.file)
            .then(async () => {
                if (!createdProject) {
                    return next(HttpErrorResponse.BadRequest("projeto não criado", "não foi possível criar o projeto.", myPath))
                }
                return res.send(createdProject)
            })
            .catch((err: any) => {
                return next(HttpErrorResponse.Internal("falha ao fazer o upload", "não foi possível realizar o upload:" + err.message + ".", myPath))
            })
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const updateProjectDataController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/update"
    try {
        const project: any = req.body.project
        if (!project) return next(HttpErrorResponse.BadRequest("dados ausentes", `dados necessários da requisição ausentes, recebido ${JSON.stringify(req.body)}.`, myPath))

        const { id, name, description } = project

        if (!id) return next(HttpErrorResponse.BadRequest("parâmetro 'id' ausente", `o id do projeto não foi passado no corpo da requisição. valor atual ${JSON.stringify(project)}.`, myPath))
        if (typeof id != "string") return next(HttpErrorResponse.BadRequest("atributo 'id' de tipo incorreto", `o id do projeto é do tipo '${typeof id}', esperado 'string'.`, myPath))

        const updateProject = await repository.update(new Project({ id, name: name ?? null, description: description ?? null }))

        return res.send(updateProject)
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const getProjectsByIdController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/{id}"
    try {
        const { id } = req.params

        if (!id)
            return next(HttpErrorResponse.BadRequest("parâmetro 'id' ausente", "o id do projeto não foi passado nos parâmetros requisição.", myPath))

        if (typeof id != "string")
            return next(HttpErrorResponse.BadRequest("parâmetro 'id' de tipo incorreto", `o id do projeto é do tipo '${typeof id}', esperado 'string'.`, myPath))

        const userId = req.user!.id;

        const project = await repository.get(id, userId)
        return res.send(project)
    }
    catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}

export const downloadProjectController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const project = await repository.get(id)
        const projectFileExt = project.filePath.substring(project.filePath.lastIndexOf('.'), project.filePath.length)
        const projectPath = joinPath(uploadConfig.projectsFolder, project.filePath)
        const newProjectPath = await duplicateFile(projectPath, joinPath(uploadConfig.tempFolder, project.name + projectFileExt))

        res.download(newProjectPath, () => {
            deleteFile(newProjectPath)
        })
    }
    catch (err: any) {
        return res.sendStatus(404)
    }
}

export const deleteProjectByIdController = async (req: Request, res: Response, next: NextFunction) => {
    const myPath = path + "/delete/{id}"
    try {
        const { id } = req.params;

        if (!id)
            return next(HttpErrorResponse.BadRequest("parâmetro 'id' ausente", "o id do projeto não foi passado nos parâmetros requisição.", myPath))

        if (typeof id != "string")
            return next(HttpErrorResponse.BadRequest("parâmetro 'id' de tipo incorreto", `o id do projeto é do tipo '${typeof id}', esperado 'string'.`, myPath))

        const projects = await repository.getByUser(req.user!.id)
        const findProject = projects.find(p => p.id == id)

        if (findProject) {
            await repository.delete(id)
            deleteFile(joinPath(uploadConfig.projectsFolder, findProject.filePath))
            return res.end()
        }
        return next(HttpErrorResponse.Unauthorized("não é possível excluir este projeto", `você não tem permissão para excluir o projeto ${id}.`, myPath))

    } catch (err: any) {
        return next(HttpErrorResponse.Internal("erro não tratado", err.message, myPath))
    }
}