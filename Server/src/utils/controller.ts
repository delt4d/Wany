import { HttpErrorResponse } from '@routes/index';
import {Request, Response, NextFunction} from 'express';

type CreateErrorCallback = typeof createError;
type CallbackError = {
    invoker: (message: string, detail: string, path: string) => HttpErrorResponse;
    message: string;
    detail: string;
};
type CallbackResult<T> = T | CallbackError;
type Callback<T> = (req: Request, error: CreateErrorCallback, res: Response) => CallbackResult<T> | Promise<CallbackResult<T>>;

export const controller = <T>(path: string, callback: Callback<T>) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await Promise.resolve(callback(req, createError, res));
            
            if (isCallbackError(result)) {
                const error = result.invoker(result.message, result.detail, path);
                next(error);
                return;
            }
            else if (result == undefined)
            {
                res.end();
                return;
            }

            res.send(result);
        }
        catch (err: any) {
            console.error('Error in controller:', err);
            next(HttpErrorResponse.Internal("erro não tratado", err.message, path));
        }
    }

function createError(
    invoker: (message: string, detail: string, path: string) => HttpErrorResponse, 
    message: string, 
    detail: string): CallbackError {
    return { invoker, message, detail }
}

function isCallbackError(obj: any): obj is CallbackError {
    return obj 
        && typeof obj === 'object' 
        && 'invoker' in obj 
        && 'message' in obj 
        && 'detail' in obj;
}