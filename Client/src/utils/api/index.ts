import axios, { AxiosRequestConfig } from "axios";
import { projects, Project, } from "./projects";
import { users, User } from "./users";
import { notifications, Notification } from './notifications';
// import { API_ENDPOINT } from "../../utils/constants";
import { API_ENDPOINT } from "@constants";

const api = axios.create({
    baseURL: API_ENDPOINT
});

api.defaults.withCredentials = true;

export {
    api,
    users,
    projects,
    notifications,
    type User,
    type Project,
    type Notification
}