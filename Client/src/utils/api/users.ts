import { getErrorResponse } from "@helpers/get-error";
import { api } from ".";

export type User = {
    id: string
    username: string
    email: string
    password?: string
    created_date?: Date
    avatar: {
        type: string,
        data: Buffer
    } | null// avatar: Buffer
}

export interface IRegisterUserResponseData {
    user: User
}

export const users = {
    get: function (userId?: string): Promise<User | null> {
        return new Promise(async function (resolve, reject) {
            api({
                url: `/users/${userId ?? "me"}`,
                method: "get"
            })
                .then(response => {
                    const user: User = response.data;
                    resolve(user);
                })
                .catch(response => reject(getErrorResponse(response)))
        })
    },
    create: function (email: string, password: string, username: string): Promise<User> {
        return new Promise(async function (resolve, reject) {
            api({
                url: "/users/create",
                method: "post",
                data: { email, password, username }
            })
                .then(response => {
                    const user: User = response.data;
                    resolve(user);
                })
                .catch(response => reject(getErrorResponse(response)))
        })
    },
    login: function (email: string, password: string): Promise<string> {
        return new Promise(async function (resolve, reject) {
            api({
                url: "/auth/login",
                method: "patch",
                data: { email, password }
            })
                .then(response => {
                    // o token é armazenado em um cookie inacessível
                    const userId = response.data;
                    resolve(userId)
                })
                .catch(response => reject(getErrorResponse(response)))
        })
    },
    logout: function (): Promise<void> {
        return new Promise(async function (resolve, reject) {
            api({
                url: "/auth/logout",
                method: "patch",
            })
                .then(response => {
                    resolve()
                })
                .catch(response => reject(getErrorResponse(response)))
        })
    },
    emailBusy: function (email: string): Promise<boolean> {
        return new Promise(async function (resolve, reject) {
            api({
                url: '/users/email_is_busy',
                data: { email },
                method: 'patch'
            })
                .then((response) => { resolve(response.data); })
                .catch((response) => {
                    console.log(response)
                    reject(getErrorResponse(response));
                });
        })
    },
    setAvatar: function (userId: string, file: File): Promise<void> {
        return new Promise(async function (resolve, reject) {
            const formData = new FormData();
            formData.append('avatar', file);

            api({
                url: `/users/update/avatar/${userId}`,
                data: formData,
                method: "put"
            })
                .then(() => { resolve(); })
                .catch(response => reject(getErrorResponse(response)))
        })
    }
}