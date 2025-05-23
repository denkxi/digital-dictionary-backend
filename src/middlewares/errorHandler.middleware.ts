import {NextFunction, Request, Response} from "express";


export function errorHandlerMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(err);

    const status = err.status || 500;
    const message = err.message || 'Internal server error';

    res.status(status).json({
        error: message,
    });
}