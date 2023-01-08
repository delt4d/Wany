import { HttpErrorResponse } from "@routes/index";
import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err)
    }
    if (err instanceof HttpErrorResponse) {
        return err.sendResponse(res)
    }

    return HttpErrorResponse.Internal("erro inesperado", err.message || "Ocorreu um erro e não foi possível obter as informações de erro necessárias", "unknown").sendResponse(res)
}