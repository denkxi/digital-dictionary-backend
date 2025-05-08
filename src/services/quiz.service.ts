import {IQuizDocument, Quiz} from "../models/Quiz";
import {IQuestionDocument, Question} from "../models/Question";
import {EQuestionType} from "../types/types";
import {Types} from "mongoose";
import {IWordDocument, Word} from "../models/Word";
import {fallbackType, getAnswerForType, getPromptForType, randomQuestionType} from "../utils/utils";
import createError from "http-errors";
import {UserDictionary} from "../models/UserDictionary";


export class QuizService {

    static async startQuiz(
        userId: string,
        dictionaryId: string,
        wordCount: number,
        questionType: EQuestionType
    ): Promise<IQuizDocument> {

        const ud = await UserDictionary.findOne({ userId, dictionaryId });
        if (!ud) throw createError(404, 'Dictionary not found or unauthorized');

        const quiz = await Quiz.create({ userId, dictionaryId, wordCount, questionType });

        const words = await Word.aggregate<IWordDocument>([
            { $match: { dictionaryId: new Types.ObjectId(dictionaryId) } },
            { $sample: { size: wordCount } },
        ]);

        for (const w of words) {
            let actualType = questionType;
            if (questionType === EQuestionType.Mixed) {
                actualType = randomQuestionType();
            }

            const correct = getAnswerForType(w, actualType);
            const prompt  = getPromptForType(w, actualType);

            if (!correct) {
                actualType = fallbackType(w, [EQuestionType.Translation, EQuestionType.Writing, EQuestionType.Pronunciation]);
            }

            const realCorrect = getAnswerForType(w, actualType);
            const realPrompt  = getPromptForType(w, actualType);

            const others = await Word.aggregate<IWordDocument>([
                { $match: {
                        dictionaryId: new Types.ObjectId(dictionaryId),
                        _id: { $ne: w._id },
                    }
                },
                { $sample: { size: 3 } },
            ]);
            const fake = others.map(o => getAnswerForType(o, actualType)).filter(a => !!a) as string[];

            const choices = [realCorrect, ...fake]
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);

            await Question.create({
                quizId:        quiz._id,
                wordId:        w._id,
                prompt:        realPrompt,
                choices,
                questionType:  actualType,
                correctAnswer: realCorrect,
            });
        }

        return quiz;
    }

    static async getQuizQuestions(quizId: string, userId: string): Promise<Pick<IQuestionDocument, '_id' | 'prompt' | 'choices'>[]> {
        const quiz = await Quiz.findOne({ _id: quizId, userId}).exec();
        if (!quiz) throw createError(404, 'Quiz not found');

        return await Question.find({ quizId })
            .select('_id prompt choices')
            .lean()
            .exec();
    }

    static async completeQuiz(quizId: string, userId: string, answers: Array<{ questionId: string, userAnswer: string}>): Promise<IQuizDocument> {
        const quiz = await Quiz.findOne({ _id: quizId, userId }).exec();
        if (!quiz) throw createError(404, 'Quiz not found');
        if (quiz.completedAt) throw createError(400, 'Quiz already completed');

        // const start = quiz.createdAt.getTime();
        let correct = 0;

        for (const { questionId, userAnswer } of answers) {
            const q = await Question.findById(questionId).exec();
            if (!q) continue;
            q.userAnswer = userAnswer;
            q.isCorrect = q.correctAnswer === userAnswer;
            await q.save();
            if (q.isCorrect) correct++;
        }

        const total = answers.length;
        // const duration = Math.floor((Date.now() - start) / 1000);

        quiz.result = {
            correctCount: correct,
            incorrectCount: total - correct,
            totalCount: total,
            scorePercent: Math.round((correct / total) * 100),
        }

        quiz.completedAt = new Date();

        await quiz.save();
        return quiz;
    }

    static async listAll(userId: string): Promise<IQuizDocument[]> {
        return Quiz.find({ userId})
            .sort({ createdAt: -1})
            .lean()
            .exec();
    }

    static async listUnfinished(userId: string): Promise<IQuizDocument[]> {
        return Quiz.find({ userId, completedAt: {$exists: false} })
            .sort({createdAt: -1})
            .lean()
            .exec();
    }

    static async listCompleted(userId: string): Promise<IQuizDocument[]> {
        return Quiz.find({ userId, completedAt: {$exists: true} })
            .sort({createdAt: -1})
            .lean()
            .exec();
    }

    static async getResult(quizId: string, userId: string): Promise<IQuizDocument> {
        const quiz = await Quiz.findOne({ _id: quizId, userId }).exec();
        if (!quiz) throw createError(404, 'Quiz not found');
        if (!quiz.completedAt) throw createError(400, 'Quiz not yet completed');
        return quiz;
    }
}