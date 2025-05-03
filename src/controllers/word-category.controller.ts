import { Request, Response, NextFunction} from "express";
import {WordCategoryService} from "../services/word-category.service";


export async function createCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;
        const { name, description } = req.body;
        const cat = await WordCategoryService.create(userId, name, description);
        res.status(201).json(cat);
    } catch (err) {
        next(err);
    }
}

export async function listCategories(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;
        const cats = await WordCategoryService.list(userId);
        res.json(cats);
    } catch (err) {
        next(err);
    }
}

export async function getCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;
        const id = req.params.id;
        const cat = await WordCategoryService.getById(id, userId);
        res.json(cat);
    } catch (err) {
        next(err);
    }
}

export async function updateCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;
        const id = req.params.id;
        const data = req.body;
        const cat = await WordCategoryService.update(id, userId, data);
        res.json(cat);
    } catch (err) {
        next(err);
    }
}

export async function deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;
        const id = req.params.id;
        await WordCategoryService.delete(id, userId);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}