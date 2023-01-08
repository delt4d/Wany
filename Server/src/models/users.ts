import { db } from "@models/index"
import { Project } from "@models/projects"

export type typeUserId = string

export class User {
    id: typeUserId
    username: string
    email: string
    password: string
    created_date: Date
    avatar: Buffer | null

    constructor(data: any) {
        if (!data) data = {}

        this.id = data.id ?? null
        this.username = data.username ?? null
        this.email = data.email ?? null
        this.password = data.password ?? null
        this.created_date = data.created_date ?? null
        this.avatar = data.avatar != null ? Buffer.from(data.avatar) : null
    }
}

export class UserDao {
    async create(user: User): Promise<typeUserId> {
        const parameters = {
            p_email: user.email,
            p_password: user.password,
            p_username: user.username,
        }

        const result = await db.callProcedure("CreateUser", parameters, "@p_id")
        const userId = Object.values(result.rows)[0]["@p_id"]

        return userId
    }

    async get(id: typeUserId): Promise<User | null> {
        const parameters = { p_id: id }
        const result = await db.callProcedure("SelectUser", parameters)
        const user = new User(Object.values(result.rows)[0][0])

        if (!user.id) return null

        return user
    }

    async getAll(): Promise<User[]> {
        const parameters = {
            p_limit: null
        }
        const result = await db.callProcedure("SelectManyUsers", parameters)
        return Object.values(result.rows)[0].map((rowData: any) => new User(rowData))
    }

    async getProjects(id: typeUserId): Promise<Project[]> {
        const parameters = {
            p_id: id
        }
        const result = await db.callProcedure("SelectUserProjects", parameters)
        return Object.values(result.rows)[0].map((rowData: any) => new Project(rowData))
    }

    async update(user: User): Promise<void> {
        const parameters = {
            p_id: user.id,
            p_username: user.username
        }
        await db.callProcedure("UpdateUser", parameters)
    }

    async updateAvatar(id: typeUserId, file: Buffer | null) {
        await db.query("update users u set u.usr_avatar=? where u.usr_id=?", [file, id])
    }

    async updatePassword(id: typeUserId, oldPassword: string, newPassword: string) {
        await db.query("update users u set u.usr_password=md5(?) where u.usr_password=md5(?) and u.usr_id=?", [newPassword, oldPassword, id])
    }

    async delete(id: typeUserId): Promise<void> {
        const parameters = { p_id: id }
        await db.callProcedure("DeleteUser", parameters)
    }

    async check({ email, password, username }: { email?: string, password?: string, username?: string }) {
        const parameters = { p_email: email ?? null, p_password: password ?? null, p_username: username ?? null }
        const result = await db.query("select u.usr_id as id from users u where u.usr_username=coalesce(:p_username, u.usr_username) and u.usr_email=coalesce(:p_email, u.usr_email) and u.usr_password=coalesce(md5(:p_password), u.usr_password);", parameters)
        const resultRow = Object.values(result.rows)[0]

        return new User(resultRow).id
    }
}

export class UserRepository {
    userDao: UserDao

    constructor() {
        this.userDao = new UserDao()
    }

    async create(user: User): Promise<User | null> {
        const userId = await this.userDao.create(user)
        return await this.userDao.get(userId)
    }

    async get(id: typeUserId): Promise<User | null> {
        return await this.userDao.get(id)
    }

    async getAll(): Promise<User[]> {
        return await this.userDao.getAll()
    }

    async getProjects(id: typeUserId): Promise<Project[]> {
        return await this.userDao.getProjects(id)
    }

    async update(user: User): Promise<User | null> {
        await this.userDao.update(user)
        return await this.userDao.get(user.id)
    }

    async updateAvatar(id: typeUserId, file: Buffer | null): Promise<User> {
        await this.userDao.updateAvatar(id, file)
        const user = await this.userDao.get(id)
        return user!
    }

    async updatePassword(id: typeUserId, oldPassword: string, newPassword: string) {
        await this.userDao.updatePassword(id, oldPassword, newPassword)
    }

    async delete(id: typeUserId): Promise<void> {
        await this.userDao.delete(id)
    }

    async check({ email, password, username }: { email?: string, password?: string, username?: string }) {
        return await this.userDao.check({ email, password, username })
    }
}
