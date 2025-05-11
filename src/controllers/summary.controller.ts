import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { SummaryService } from '../services/summary.service';

export async function userSummary(
    req: Request, res: Response, next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.id;
        const summary = await SummaryService.getUserSummary(userId);
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

export async function dictionarySummary(
    req: Request, res: Response, next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.id;
        const { dictionaryId } = req.query as { dictionaryId?: string };

        if (!dictionaryId) {
            return next(createError(400, 'Missing dictionaryId'));
        }

        const summary = await SummaryService.getDictionarySummary(userId, dictionaryId);
        res.json(summary);
    } catch (err) {
        next(err);
    }
}
