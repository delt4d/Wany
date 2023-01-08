import { db } from "."
import { typeUserId, User, UserDao, UserRepository } from "./users"

export type typeProjectId = string

export class Project {
    id: typeProjectId
    name: string
    description: string
    created_date: Date
    filePath: string
    file: Buffer
    image: Buffer | null
    userId: typeUserId
    user: User | null
    putStar: boolean
    allStars: number
    totalCount: number | null

    constructor(data: any) {
        if (!data) data = {}

        this.id = data.id ?? null
        this.name = data.name ?? null
        this.description = data.description ?? ""
        this.created_date = data.created_date ?? null
        this.filePath = data.fileName ?? data.filePath ?? null
        this.file = data.file ?? null
        this.image = data.image != null ? Buffer.from(data.image) : null
        this.userId = data.userId ?? null
        this.user = data.user ?? null
        this.putStar = data.putStar ?? false
        this.allStars = data.allStars ?? 0
        this.totalCount = data.totalCount ?? null

        const ref = this

        function mapToUser(mapData: Array<string>) {
            var user: any = {}
            for (let item of mapData) {
                user[item] = data["user_" + item]
            }
            ref.user = new User(user)
        }
        if (!this.user) mapToUser(["email", "username", "avatar", "created_date"])
    }
}

export class ProjectDao {
    async create(project: Project): Promise<typeProjectId> {
        const parameters = {
            p_name: project.name ?? null,
            p_file: project.filePath ?? null,
            p_image: project.image ?? null,
            p_description: project.description ?? null,
            p_userId: project.userId ?? null
        }
        const result = await db.callProcedure("CreateProject", parameters, "@p_id")
        return Object.values(result.rows)[0]["@p_id"]
    }

    async get(id: typeProjectId, userId?: typeUserId): Promise<Project> {
        const parameters = { p_id: id, p_user: userId ?? "" }
        const result = await db.callProcedure("SelectProject", parameters)
        return new Project(Object.values(result.rows)[0][0])
    }

    async getByUser(userId: typeUserId): Promise<Project[]> {
        const parameters = {
            p_id: userId
        }
        const result = await db.callProcedure("SelectUserProjects", parameters)
        return Object.values(result.rows)[0].map((rowData: any) => new Project(rowData))
    }

    async getProjectsImages(projectsIDs: typeProjectId[]): Promise<Project[]> {
        const parameters = { p_list: projectsIDs }
        const result = await db.callProcedure("SelectProjectsImages", parameters)
        return Object.values(result.rows)[0].map((rowData: any) => new Project(rowData))
    }

    async download(id: typeProjectId): Promise<Project> {
        const parameters = {
            p_id: id
        }
        const result = await db.query("select p.proj_name as name, p.proj_file as filePath from projects p where p.proj_id=?", [parameters.p_id])
        return new Project(Object.values(result.rows)[0][0])
    }

    async getAll(data: { search: string, offset: number, startIndex: number, userId: string }): Promise<Project[]> {
        const parameters = {
            p_limit: data.offset,
            p_search: data.search,
            p_start_index: data.startIndex,
            p_user: data.userId
        }
        const result = await db.callProcedure("SelectManyProjects", parameters)
        return Object.values(result.rows)[0].map((rowData: any) => new Project(rowData))
    }

    async update(project: Project): Promise<void> {
        const parameters = {
            p_name: project.name,
            p_file: project.filePath
        }
        await db.callProcedure("UpdateProject", parameters)
    }

    async delete(id: typeProjectId): Promise<void> {
        const parameters = {
            p_id: id
        }
        await db.callProcedure("DeleteProject", parameters)
    }

    async getFilePath(id: typeProjectId): Promise<string> {
        const parameters = {
            p_id: id
        }
        const result = await db.query("select p.file as filePath from projects where proj_id=?", [parameters.p_id])
        return Object.values(result.rows)[0]["filePath"]
    }

    async setStar(id: typeProjectId, userId: typeUserId): Promise<void> {
        const parameters = {
            p_user: userId,
            p_projec: id
        }
        await db.callProcedure("SetProjectStar", parameters)
    }
}

export class ProjectRepository {
    projectDao: ProjectDao
    userDao: UserDao

    constructor() {
        this.projectDao = new ProjectDao()
        this.userDao = new UserDao()
    }

    async create(project: Project): Promise<Project> {
        const id = await this.projectDao.create(project)
        return await this.projectDao.get(id)
    }

    async get(id: typeProjectId, userId?: typeUserId): Promise<Project> {
        return await this.projectDao.get(id, userId)
    }

    async getByUser(userId: typeUserId): Promise<Project[]> {
        return await this.projectDao.getByUser(userId)
    }

    async getProjectsImages(projectsIDs: typeProjectId[]) {
        return await this.projectDao.getProjectsImages(projectsIDs);
    }

    async download(id: typeProjectId): Promise<Project> {
        return await this.projectDao.download(id)
    }

    async getAll(data: { search: string, offset: number, startIndex: number, userId: string }): Promise<Project[]> {
        return await this.projectDao.getAll(data)
    }

    async update(project: Project): Promise<Project> {
        await this.projectDao.update(project)
        return await this.projectDao.get(project.id)
    }

    async delete(id: typeProjectId): Promise<void> {
        await this.projectDao.delete(id)
    }

    async getFilePath(id: typeProjectId): Promise<void> {
        await this.projectDao.getFilePath(id)
    }

    async setStar(id: typeProjectId, userId: typeUserId): Promise<void> {
        await this.projectDao.setStar(id, userId);
    }
}