import fs from "fs"
import path from "path";

type error = string;


export function joinPath(...paths: string[]) {
    return new String(path.join(...paths)).replaceAll("\\", "/")
}

export const folderExists = (dir: string): boolean => {
    return fs.existsSync(dir) ? true : false
}

export const createFolder = (dir: string): Promise<error | null> => {
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, { recursive: true }, (error) => {
            if (!error) return resolve(null)
            reject(error.message)
        })
    })
}

export const renameOrMoveFile = (path: string, destPath: string): Promise<error | string> => {
    return new Promise((resolve, reject) => {
        fs.rename(path, destPath, (error) => {
            if (!error) return resolve(destPath)
            reject(error.message)
        })
    })
}

export const duplicateFile = (path: string, destPath: string): Promise<error | string> => {
    return new Promise((resolve, reject) => {
        fs.copyFile(path, destPath, (error) => {
            if (!error) return resolve(destPath)
            reject(error.message)
        })
    })
}

export const createFile = (filepath: string, data: string | NodeJS.ArrayBufferView) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filepath, data, (error) => {
            if (!error) return resolve(null)
            reject(error.message)
        })
    })
}

export const deleteFile = (filePath: string): Promise<error | null> => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (error) => {
            if (!error) return resolve(null)
            else reject(error.message)
        })
    })
}