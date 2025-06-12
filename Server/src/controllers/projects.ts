import { uploadConfig } from "@config/upload-config"
import { Project, ProjectRepository } from "@models/projects"
import { HttpErrorResponse } from "@routes/index"
import { Criptography } from "@utils/criptography"
import { createFile, deleteFile, duplicateFile, joinPath } from "@utils/files"
import { controller } from "@utils/controller"
import { validationResult } from "express-validator"

const repository = new ProjectRepository()
const path = "/api/projects"

export const getManyProjectsController = controller(path, async (req, error) => {
    const data = {
        offset: req.body.offset ?? 10,
        startIndex: req.body.startIndex ?? 0,
        search: req.body.search?.trim().replaceAll(/[ ]+/g, " ") ?? "",
        userId: req.user?.id ?? ""
    }
    const projects = await repository.getAll(data);
    return projects;
});

export const getProjectsImagesController = controller(path + "/images", async (req, error) => {
    const validation = validationResult(req)
    const errors = validation.array()
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
    const { projectsIDs } = req.body
    const result = await repository.getProjectsImages(projectsIDs ?? null)
    return result
});

export const setProjectStarController = controller(path + "/setstar", async (req, error) => {
    const validation = validationResult(req)
    const errors = validation.array()
    
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

    const { projectId } = req.body;
    const userId = req.user?.id ?? "";

    await repository.setStar(projectId, userId);
});

export const getMyProjectsController = controller(path + "/my", async (req, error) => {
    const projects = await repository.getByUser(req.user!.id);
    return projects;
});

export const createProjectController = controller(path + "/create", async (req, error) => {
    const validation = validationResult(req);
    const errors = validation.array();

    if (!req.files || Array.isArray(req.files)) {
        return error(
            HttpErrorResponse.BadRequest,
            "arquivos ausentes",
            "os arquivos da requisição estão ausentes."
        );
    }

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

    const { name, description } = req.body;
    const userId = req.user!.id;
    const file = req.files.file[0];
    const image = req.files.image[0];

    if (!name && !file && !image) return error(
        HttpErrorResponse.BadRequest,
        "dados ausentes",
        `dados necessários da requisição ausentes, recebido ${JSON.stringify(req.body)}.`
    );

    const data = {
        name,
        userId,
        file: file.buffer,
        fileName: Criptography.generateUUIDV4() + file.originalname.substring(file.originalname.indexOf('.')),
        image: image?.buffer,
        description
    }

    const filePath = joinPath(uploadConfig.projectsFolder, data.fileName);
    const createdProject = await repository.create(new Project(data));

    if (!createdProject) {
        return error(
            HttpErrorResponse.BadRequest,
            "projeto não criado",
            "não foi possível criar o projeto."
        );
    }

    await createFile(filePath, data.file);

    return createdProject;
});

export const updateProjectDataController = controller(path + "/update", async (req, error) => {
    const project: any = req.body.project;

    if (!project) return error(
        HttpErrorResponse.BadRequest,
        "dados ausentes",
        `dados necessários da requisição ausentes, recebido ${JSON.stringify(req.body)}.`
    );

    const { id, name, description } = project;

    if (!id) return error(
        HttpErrorResponse.BadRequest,
        "parâmetro 'id' ausente",
        `o id do projeto não foi passado no corpo da requisição. valor atual ${JSON.stringify(project)}.`
    );

    if (typeof id != "string") return error(
        HttpErrorResponse.BadRequest,
        "atributo 'id' de tipo incorreto",
        `o id do projeto é do tipo '${typeof id}', esperado 'string'.`
    );

    const updateProject = await repository.update(new Project({ id, name: name ?? null, description: description ?? null }));
    return updateProject;
});

export const getProjectsByIdController = controller(path + "/{id}", async (req, error) => {
    const { id } = req.params;

    if (!id)
        return error(
            HttpErrorResponse.BadRequest,
            "parâmetro 'id' ausente",
            "o id do projeto não foi passado nos parâmetros requisição."
        );

    if (typeof id != "string")
        return error(
            HttpErrorResponse.BadRequest,
            "parâmetro 'id' de tipo incorreto",
            `o id do projeto é do tipo '${typeof id}', esperado 'string'.`
        );

    const userId = req.user!.id;

    const project = await repository.get(id, userId);
    return project;
});

export const downloadProjectController = controller(path + "/download/{id}", async (req, error, res) => {
    const { id } = req.params
    const project = await repository.get(id)
    const projectFileExt = project.filePath.substring(project.filePath.lastIndexOf('.'), project.filePath.length)
    const projectPath = joinPath(uploadConfig.projectsFolder, project.filePath)
    const newProjectPath = await duplicateFile(projectPath, joinPath(uploadConfig.tempFolder, project.name + projectFileExt))
    res.download(newProjectPath, () => { deleteFile(newProjectPath); });
});

export const deleteProjectByIdController = controller(path + "/delete/{id}", async (req, error) => {
    const { id } = req.params;

    if (!id)
        return error(
            HttpErrorResponse.BadRequest,
            "parâmetro 'id' ausente",
            "o id do projeto não foi passado nos parâmetros requisição."
        );

    if (typeof id != "string")
        return error(
            HttpErrorResponse.BadRequest,
            "parâmetro 'id' de tipo incorreto",
            `o id do projeto é do tipo '${typeof id}', esperado 'string'.`
        );

    const projects = await repository.getByUser(req.user!.id)
    const findProject = projects.find(p => p.id == id)

    if (!findProject) {
        return error(
            HttpErrorResponse.Unauthorized,
            "não é possível excluir este projeto",
            `você não tem permissão para excluir o projeto ${id}.`
        );
    }

    await repository.delete(id);

    const _ = deleteFile(joinPath(uploadConfig.projectsFolder, findProject.filePath));
});