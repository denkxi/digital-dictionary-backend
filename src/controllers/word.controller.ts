import {NextFunction, Request, Response} from "express";
import {WordService} from "../services/word.service";
import {EWordClass, SortOption} from "../types/types";


export async function createWord(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const { dictionaryId } = req.params;
        const word = await WordService.create(userId, dictionaryId, req.body);
        res.status(201).json(word);
    }
    catch (error) {
        next(error);
    }
}

export async function listAllWords(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const dictionaryId = req.query.dictionaryId as string | undefined;
        if (!dictionaryId) {
            res.status(400).json({ error: 'Missing dictionaryId in query' });
            return;
        }
        const words = await WordService.listAll(req.user!.id, dictionaryId);
        res.json(words);
    } catch (err) {
        next(err);
    }
}

export async function listWords(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const dictionaryId = req.query.dictionaryId as string | undefined;
        const search       = (req.query.search      as string) || '';
        const sort = (req.query.sort as SortOption) || 'name-asc';
        const pageStr      = (req.query.page        as string) || '1';
        const limitStr     = (req.query.limit       as string) || '10';
        const wordClass    = req.query.wordClass   as EWordClass | undefined;
        const starred      = req.query.starred      === 'true';   // булевый
        const learned      = req.query.learned      === 'true';   // булевый

        if (!dictionaryId) {
            res.status(400).json({ error: 'Missing dictionaryId in query' });
            return
        }

        const page  = parseInt(pageStr, 10);
        const limit = parseInt(limitStr, 10);

        const { items, totalItems, totalPages } = await WordService.list(
            userId,
            dictionaryId,
            {
                search,
                sort,
                wordClass,
                starred,
                learned,
                page,
                limit
            }
        );

        res.json({ items, totalItems, currentPage: page, totalPages });
    } catch (err) {
        next(err);
    }
}

export async function getWord(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        const word = await WordService.getById(userId, id);
        res.json(word);
    }
    catch (error) {
        next(error);
    }
}

export async function updateWord(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        const word = await WordService.update(userId, id, req.body);
        res.json(word);
    }
    catch (error) {
        next(error);
    }
}

export async function deleteWord(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        await WordService.delete(userId, id);
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}