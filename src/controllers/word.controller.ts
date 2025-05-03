import {NextFunction, Request, Response} from "express";
import {IWord, Word} from "../models/Word";
import {WordService} from "../services/word.service";


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

export async function listWords(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const { dictionaryId } = req.params;
        const words = await WordService.list(userId, dictionaryId);
        res.json(words);
    }
    catch (error) {
        next(error);
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