import { Project, projects } from "@api"

export interface ICreateProjectFormElements extends HTMLFormControlsCollection {
    name: HTMLInputElement
    file: HTMLInputElement
    image: HTMLInputElement
    description: HTMLTextAreaElement
}

export interface ICreateProjectFormElement extends HTMLFormElement {
    readonly elements: ICreateProjectFormElements
}

export interface ICreateProjectData {
    name: string
    file: File
    image: File | null
    description: string
}

export const createProject = (userId: string, projectData: ICreateProjectData): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            const formData = new FormData();

            formData.append('name', projectData.name);
            formData.append('file', projectData.file);
            formData.append('description', projectData.description);
            if (projectData.image) formData.append('image', projectData.image);

            await projects.create(formData);

            resolve();
        }
        catch (err: any) {
            reject(err);
        }
    })
}

export const getMyProjects = (userId?: string): Promise<Project[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            resolve(await projects.getAllByUser(userId));
        }
        catch (err: any) {
            reject(err);
        }
    })
}

export const deleteProject = (projectId: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            resolve(await projects.delete(projectId));
        }
        catch (err: any) {
            reject(err);
        }
    })
}