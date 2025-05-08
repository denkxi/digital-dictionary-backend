// src/routes/quiz.routes.ts
import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticateAccessToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { EQuestionType } from '../types/types';
import {
    completeQuiz,
    getQuestions,
    getResult, listAll,
    listCompleted,
    listUnfinished,
    startQuiz
} from "../controllers/quiz.controller";

const router = Router();
router.use(authenticateAccessToken);

router.post(
    '/',
    [
        body('dictionaryId').isMongoId(),
        body('wordCount').isInt({ min: 1 }),
        body('questionType').isIn(Object.values(EQuestionType)),
    ],
    validateRequest,
    startQuiz
);

router.get('/', listAll);

router.get('/unfinished', listUnfinished);

router.get('/completed', listCompleted);

router.get(
    '/:id',
    [param('id').isMongoId()],
    validateRequest,
    getQuestions
);

router.post(
    '/:id/submit',
    [
        param('id').isMongoId(),
        body().isArray(),
        body('*.questionId').isMongoId(),
        body('*.userAnswer').isString().notEmpty(),
    ],
    validateRequest,
    completeQuiz
);

router.get(
    '/:id/result',
    [param('id').isMongoId()],
    validateRequest,
    getResult
);

export default router;
