import { Router, Response, NextFunction } from "express"
import { authRouter } from "./auth";
import { projectRouter } from "./projects";
import { usersRouter } from "./users";

// Routes and Controllers

/* example
error: auth-0001
message: "Incorrect username or password"
detail: "Ensure that the username and password included in the request are correct"
help: "none"
path: "/api/users/:id"
*/
export class HttpErrorResponse {
    status!: number
    message!: string
    detail!: string
    date!: Date
    path!: string

    constructor() {
        this.date = new Date()
    }

    static NotFound(message: string, detail: string, path: string) {
        const errorResponse = new HttpErrorResponse()

        errorResponse.status = 404
        errorResponse.message = message
        errorResponse.detail = detail
        errorResponse.path = path

        return errorResponse
    }

    static BadRequest(message: string, detail: string, path: string) {
        const errorResponse = new HttpErrorResponse()

        errorResponse.status = 400
        errorResponse.message = message
        errorResponse.detail = detail
        errorResponse.path = path

        return errorResponse
    }

    static Unauthorized(message: string, detail: string, path: string) {
        const errorResponse = new HttpErrorResponse()

        errorResponse.status = 401
        errorResponse.message = message
        errorResponse.detail = detail
        errorResponse.path = path

        return errorResponse
    }

    static Internal(message: string, detail: string, path: string) {
        const errorResponse = new HttpErrorResponse()

        errorResponse.status = 500
        errorResponse.message = message
        errorResponse.detail = detail
        errorResponse.path = path

        return errorResponse
    }

    sendResponse(res: Response) {
        return res.status(this.status).send({
            message: this.message,
            detail: this.detail,
            path: this.path,
            status: this.status,
            date: this.date
        })
    }
}

const router = Router()

router.use("/users", usersRouter)
router.use("/projects", projectRouter)
router.use("/auth", authRouter)

export { router };