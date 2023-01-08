import { Router } from "express"
import multer from "multer"
import { body } from "express-validator"
import { authorizationMiddleware, authorizationMiddlewareWithoutThrow } from "@middleware/authorization-middleware"
import { checkEmailIsBusyController, createUserController, deleteMyUserController, getManyUsersController, getMyUserDataController, getUserByIdController, updatePasswordController, updateUserAvatarController } from "controllers/users"

const storage = multer.memoryStorage();
const upload = multer({ storage });
const usersRouter = Router()

usersRouter.get("/", getManyUsersController)

usersRouter.post("/create",
    body('email').exists().isEmail().normalizeEmail().withMessage("email inválido"),
    body('username').exists().not().isEmpty().trim().escape().withMessage("nome de usuário inválido"),
    body('password')
        .exists().trim()
        .isLength({ min: 8, max: 50 }).not().isEmpty().withMessage("senha inválida")
        .isStrongPassword().withMessage("senha fraca"),
    createUserController)

usersRouter.put("/update/avatar/:id", upload.single("avatar"), authorizationMiddleware, updateUserAvatarController)

usersRouter.put("/update/password",
    authorizationMiddleware,
    body("oldPassword").exists().trim().notEmpty().withMessage("senha antiga é inválida"),
    body("newPassword").exists().trim().isLength({ min: 8, max: 50 }).notEmpty().isStrongPassword().withMessage("nova senha inválida"),
    updatePasswordController)

usersRouter.put("/update", authorizationMiddleware, updateUserAvatarController)

usersRouter.get("/me", authorizationMiddlewareWithoutThrow, getMyUserDataController)

usersRouter.get("/:id", getUserByIdController)

usersRouter.delete("/delete",
    authorizationMiddlewareWithoutThrow,
    deleteMyUserController)

usersRouter.patch("/email_is_busy", checkEmailIsBusyController)

export { usersRouter }