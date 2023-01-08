import { pid, exit } from "process"

import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import http from "http"
import cookieParser from "cookie-parser"

import { router } from "@routes/index"
import { ExpressPeerServer } from "peer"
import { errorMiddleware } from "@middleware/error-middleware"
import { appConfig } from "@config/app-config"
import { createFolder, folderExists } from "@utils/files"
import { uploadConfig } from "@config/upload-config"
import { authConfig } from "@config/auth-config"
import { socketConnection } from "socket"

require('dotenv').config()

export function start() {
    console.log(`Running process ${pid}`)

    const app = express()
    const server = http.createServer(app)

    // app.use(function (req, res, next) {
    //     // res.setHeader('charset', 'utf-8')
    //     // res.set("Access-Control-Allow-Credentials", "true")
    //     // res.set("Access-Control-Allow-Origin", appConfig.frontend)
    //     // res.set("Access-Control-Allow-Headers", appConfig.frontend)
    //     // next();
    // });

    app.use("/peer", ExpressPeerServer(server))
    app.use(cors({
        credentials: true,
        origin: appConfig.frontend,
        allowedHeaders: ["Origin, X-Requested-With, Content-Type, Accept"],
        methods: ["GET", "HEAD", "PUT", "PATCH", "DELETE", "POST"],
    }))
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(cookieParser(authConfig.secret_token))
    app.use("/api", router)
    app.get("/", (req, res) => { res.send("SERVER IS RUNNING") })
    app.use(errorMiddleware)

    server.listen(appConfig.port, appConfig.host, async () => {
        Object.values(uploadConfig).forEach(async (dir) => {
            if (!folderExists(dir)) {
                const error = await createFolder(dir)
                if (error) throw new Error("Não foi possível iniciar o Server: " + error)

                console.log(`Folder ${dir} created.`)
            }
        })

        console.log(`Server running at ${appConfig.host}:${appConfig.port}`)
    })

    socketConnection(server)

    const handleServerEnd = (e: Error) => {
        console.log("Unexpected error. Exiting process...")

        if (e) { console.error(`REASON: ${e.message}`) }
        exit()
    }
    server.on('error', handleServerEnd)
    server.on('close', handleServerEnd)
}