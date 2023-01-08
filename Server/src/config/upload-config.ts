import { joinPath } from "@utils/files";

import dotenv from 'dotenv'
dotenv.config()

const baseFolder = joinPath(__dirname, '..', '..', '..', 'UPLOADS')
const tempFolder = joinPath(baseFolder, 'temp')
const projectsFolder = joinPath(baseFolder, 'projects')

export const uploadConfig = {
    baseFolder: process.env.UPLOAD_BASE_FOLDER ?? baseFolder,
    tempFolder: process.env.UPLOAD_TEMP_FOLDER ?? tempFolder,
    projectsFolder: process.env.UPLOAD_PROJECTS_FOLDER ?? projectsFolder
}