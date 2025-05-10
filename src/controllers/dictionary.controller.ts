import {NextFunction, Request, Response} from "express";
import {DictionaryService} from "../services/dictionary.service";


export async function createDictionary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const createdBy = req.user!.id;
        const { name, sourceLanguage, targetLanguage, description, isOpen } = req.body;
        const dict = await DictionaryService.create(
            name,
            sourceLanguage,
            targetLanguage,
            createdBy,
            description,
            isOpen);
        res.status(201).json(dict);
    }
    catch(error) {
        next(error);
    }
}

export async function listOwn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        const dictionaries = await DictionaryService.listOwn(req.user!.id);
        res.json(dictionaries);
    }
    catch(error) {
        next(error);
    }
}

export async function listOpen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        const dictionaries = await DictionaryService.listOpen(req.user!.id);
        res.json(dictionaries);
    }
    catch(error) {
        next(error);
    }
}

export async function getOwnById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        const dictionaries = await DictionaryService.getOwnById(req.params.id, req.user!.id);
        res.json(dictionaries);
    }
    catch(error) {
        next(error);
    }
}

export async function getPublicById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        const dictionaries = await DictionaryService.getPublicById(req.params.id, req.user!.id);
        res.json(dictionaries);
    }
    catch(error) {
        next(error);
    }
}

export async function updateDictionary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        const { name, sourceLanguage, targetLanguage, description, isOpen } = req.body;
        const dictionaries = await DictionaryService.update(
            req.params.id,
            req.user!.id,
            { name, sourceLanguage, targetLanguage, description, isOpen });
        res.status(201).json(dictionaries);
    }
    catch(error) {
        next(error);
    }
}

export async function deleteDictionary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        await DictionaryService.delete(req.params.id, req.user!.id);
        res.status(204).json({success: true}).end();
    }
    catch(error) {
        next(error);
    }
}

export async function borrowDictionary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        const ud = await DictionaryService.borrowDictionary(req.params.id, req.user!.id);
        res.status(201).json(ud.dictionary);
    }
    catch(error) {
        next(error);
    }
}

export async function listUserDictionaries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        const dictionaries = await DictionaryService.listUserDictionaries(req.user!.id);
        res.json(dictionaries);
    }
    catch(error) {
        next(error);
    }
}

export async function listAllDictionaries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        const dictionaries = await DictionaryService.listAllDictionaries();
        res.json(dictionaries);
    }
    catch(error) {
        next(error);
    }
}

export async function returnDictionary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        await DictionaryService.returnDictionary(req.params.id, req.user!.id);
        res.status(204).end();
    }
    catch(error) {
        next(error);
    }
}