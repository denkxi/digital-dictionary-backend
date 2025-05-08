// src/controllers/quiz.controller.ts
import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/quiz.service';
import { EQuestionType } from '../types/types';

    export async function startQuiz(req: Request, res: Response, next: NextFunction) {
        try {
            const userId       = req.user!.id;
            const { dictionaryId, wordCount, questionType } = req.body;

            const quiz = await QuizService.startQuiz(
                userId,
                dictionaryId,
                Number(wordCount),
                questionType as EQuestionType
            );
            res.status(201).json({ quizId: quiz._id });
        } catch (err) {
            next(err);
        }
    }

    export async function getQuestions(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const quizId = req.params.id;
            const questions = await QuizService.getQuizQuestions(quizId, userId);
            res.json(questions);
        } catch (err) {
            next(err);
        }
    }

    export async function completeQuiz(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const quizId = req.params.id;
            const answers = req.body as Array<{ questionId: string; userAnswer: string }>;

            const updatedQuiz = await QuizService.completeQuiz(quizId, userId, answers);
            res.json(updatedQuiz.result);
        } catch (err) {
            next(err);
        }
    }

    export async function  listAll(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const quizzes = await QuizService.listAll(userId);
            res.json(quizzes);
        } catch (err) {
            next(err);
        }
    }

    export async function  listUnfinished(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const quizzes = await QuizService.listUnfinished(userId);
            res.json(quizzes);
        } catch (err) {
            next(err);
        }
    }

    export async function  listCompleted(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const quizzes = await QuizService.listCompleted(userId);
            res.json(quizzes);
        } catch (err) {
            next(err);
        }
    }

    export async function  getResult(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const quizId = req.params.id;
            const quiz   = await QuizService.getResult(quizId, userId);
            res.json(quiz);
        } catch (err) {
            next(err);
        }
    }

