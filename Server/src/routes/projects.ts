import { Router } from "express"
import multer from "multer"
import { body, validationResult } from "express-validator"
import { authorizationMiddleware, authorizationMiddlewareWithoutThrow } from "@middleware/authorization-middleware"
import { createProjectController, deleteProjectByIdController, downloadProjectController, getManyProjectsController, getMyProjectsController, getProjectsByIdController, getProjectsImagesController, setProjectStarController, updateProjectDataController } from "controllers/projects"

const projectRouter = Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

projectRouter.patch("/",
    authorizationMiddlewareWithoutThrow,
    getManyProjectsController)

projectRouter.patch("/images",
    body('projectsIDs').exists().withMessage("o campo 'projects' está ausente").isArray().withMessage("o campo 'projects' é inválido"),
    getProjectsImagesController
)

projectRouter.put("/setstar",
    body('projectId').exists().trim().notEmpty().withMessage("o campo 'projectId' está ausente ou é inválido."),
    authorizationMiddleware,
    setProjectStarController)

projectRouter.get("/my", authorizationMiddleware, getMyProjectsController)

projectRouter.post("/create",
    upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]),
    authorizationMiddlewareWithoutThrow,
    body('name').exists().trim().notEmpty().withMessage("o campo 'name' está ausente ou é inválido."),
    body('description').exists().trim().replace(/[ ]+/g, " ").notEmpty().withMessage("o campo 'description' está ausente ou é inválido."),
    createProjectController)

projectRouter.put("/update", updateProjectDataController)
projectRouter.get("/:id", authorizationMiddleware, getProjectsByIdController)
projectRouter.get("/:id/download", downloadProjectController)
projectRouter.delete("/delete/:id", authorizationMiddleware, deleteProjectByIdController)


export { projectRouter }