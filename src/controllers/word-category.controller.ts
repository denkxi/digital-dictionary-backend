import { Request, Response, NextFunction} from "express";
import {WordCategoryService} from "../services/word-category.service";
import {SortOption} from "../types/types";


export async function createCategory(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId= req.user!.id;
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
): Promise<void> {
    try {
        const userId = req.user!.id;
        const search = (req.query.search as string) || '';
        const sort   = (req.query.sort as SortOption) || 'name-asc';
        const page   = parseInt((req.query.page  as string) || '1', 10);
        const limit  = parseInt((req.query.limit as string) || '10', 10);

        const { items, totalItems, totalPages } = await WordCategoryService.list(
            userId,
            { search, sort, page, limit }
        );

        res.status(200).json({ items, totalItems, currentPage: page, totalPages });
    } catch (err) {
        next(err);
    }
}

export async function listAllCategories(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.id;

        const categories = await WordCategoryService.listAllCategories(userId);

        res.json(categories);
    } catch (err) {
        next(err);
    }
}



export async function getCategory(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.id;
        const id = req.params.id;
        const cat = await WordCategoryService.getById(userId, id);
        res.json(cat);
    } catch (err) {
        next(err);
    }
}


export async function updateCategory(
    req: Request<{ categoryId: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.id;
        const id = req.params.categoryId;
        const { name, description } = req.body;
        const cat = await WordCategoryService.update(
            userId,
            id,
            { name, description }
        );
        res.json(cat);
    } catch (err) {
        next(err);
    }
}

export async function deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.id;
        const id= req.params.id;
        await WordCategoryService.delete(userId, id);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}