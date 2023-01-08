import { AuthenticationRoles } from '@middleware/authorization-middleware';
import { typeUserId } from '@models/users';
import express from 'express';
import { Multer } from 'multer';

export { }

declare global {
    namespace Express {
        // interface Request {
        //     files?:
        //     {
        //         [fieldname: string]: Multer.File[]
        //     } | Multer.File[] | undefined;
        // }
        export interface Request {
            user?: {
                id: typeUserId,
                role: AuthenticationRoles
            }
        }
    }
}