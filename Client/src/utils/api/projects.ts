import { getErrorResponse } from "@helpers/get-error";
import { api } from ".";
import { User } from "./users";

export type Project = {
    id: string
    name: string
    image: {
        type: string
        data: Buffer
    }
    file: string
    user: User
    created_date?: Date
    putStar: boolean
    allStars: number
    description: string
}

export const projects = {
    create: function (project: FormData): Promise<void> {
        return new Promise(function (resolve, reject) {
            api.post('/projects/create', project)
                .then(response => { resolve(); })
                .catch(response => reject(getErrorResponse(response)))
        });
    },
    delete: function (id: string): Promise<void> {
        return new Promise(function (resolve, reject) {
            api.delete(`/projects/delete/${id}`)
                .then(response => { resolve(); })
                .catch(response => reject(getErrorResponse(response)))
        });
    },
    get: function (id: string): Promise<Project> {
        return new Promise(async function (resolve, reject) {
            api.get<Project>(`/projects/${id}`)
                .then(response => {
                    resolve(response.data);
                })
                .catch(response => reject(getErrorResponse(response)))
        });
    },
    getAll: function (data: any): Promise<(Project & { totalCount: number })[]> {
        return new Promise(async function (resolve, reject) {
            api({
                url: "/projects",
                method: "patch",
                data: {
                    search: data.search ?? "",
                    startIndex: data.startIndex ?? 0,
                    offset: data.offset ?? 10,
                    userId: data.userId ?? null,
                }
            })
                .then(response => { resolve(response.data); })
                .catch(response => reject(getErrorResponse(response)));
        });
    },
    getAllByUser: function (userId?: string): Promise<Project[]> {
        return new Promise(async function (resolve, reject) {
            api.get<Project[]>("/projects/my", {
                data: { userId }
            })
                .then(response => { resolve(response.data) })
                .catch(response => reject(getErrorResponse(response)));
        });
    },
    getImages: function (projectsIdList: string[]): Promise<Project[]> {
        return new Promise(async function (resolve, reject) {
            api.patch<Project[]>("/projects/images", { projectsIDs: projectsIdList })
                .then(response => { resolve(response.data) })
                .catch(response => reject(getErrorResponse(response)));
        })
    },
    download: async function (id: string) {
        window.open(api.getUri() + `/projects/${id}/download`, '_blank');
    },
    setStar: function (projectId: string): Promise<void> {
        return new Promise(async function (resolve, reject) {
            api.put('/projects/setstar', { projectId })
                .then(response => { resolve() })
                .catch(response => reject(getErrorResponse(response)))
        })
    }
}