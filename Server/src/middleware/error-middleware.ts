import { HttpErrorResponse } from "@routes/index";
import express from "express";

export function errorMiddleware(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
    if (res.headersSent) {
        next(err);
        return;
    }
    if (err instanceof HttpErrorResponse) {
        err.sendResponse(res);
        return;
    }

    const internalErrorResponse = HttpErrorResponse.Internal("erro inesperado", err.message || "Ocorreu um erro e não foi possível obter as informações de erro necessárias", "unknown");
    internalErrorResponse.sendResponse(res);
}