import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/quiz.service';
import {EQuestionType, QuizWithName} from '../types/types';
import {DictionaryService} from "../services/dictionary.service";
import {Question} from "../models/Question";

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

    export async function getQuestionsAndQuiz(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const quizId = req.params.id;
            const questions = await QuizService.getQuizQuestions(quizId, userId);
            const quiz = await QuizService.getQuiz(quizId);
            const dictionary = await DictionaryService.getOwnById(quiz.dictionaryId.toString(), userId);
            res.json({
                quiz: {
                    ...quiz,
                    dictionaryName: dictionary.name,
                },
                questions,
            });
        } catch (err) {
            next(err);
        }
    }

    export async function completeQuiz(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const quizId = req.params.id;
            const answers = req.body.answers as Array<{ questionId: string; answer: string }>;

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

export async function getResult(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const quizId = req.params.id;
        const quiz   = await QuizService.getQuizWithResult(quizId, userId);
        const dict = await DictionaryService.getOwnById(quiz.dictionaryId.toString(), userId);
        const questions = await Question.find({ quizId}).lean().exec();
        res.json({
            quiz:
        { ...quiz, dictionaryName: dict.name},
            questions,
    });
    } catch (err) {
        next(err);
    }
}

