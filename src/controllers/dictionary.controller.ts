import {NextFunction, Request, Response} from "express";


export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {

        res.status(200).json("ALl dictionaries");
    }
    catch (error){
        next(error);
    }
}