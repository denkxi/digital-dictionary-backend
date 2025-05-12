import {IQuizDocument, Quiz} from "../models/Quiz";
import {IDictionarySummary, IUserSummary} from "../types/types";
import {Types} from "mongoose";
import {IQuestionDocument, Question} from "../models/Question";
import {IWordDocument, Word} from "../models/Word";
import createError from "http-errors";
import {UserDictionary} from "../models/UserDictionary";

export class SummaryService {
    static async getUserSummary(userId: string): Promise<IUserSummary> {
        const quizzes = await Quiz.find({
            userId: new Types.ObjectId(userId),
            'result.scorePercent': { $exists: true }
        }).lean().exec() as IQuizDocument[];

        const totalQuizzes = quizzes.length;
        const perfectScores = quizzes.filter(q => q.result!.scorePercent === 100).length;

        const quizIds = quizzes.map(q => q._id);
        const questions = await Question.find({
            quizId: { $in: quizIds }
        }).lean().exec() as IQuestionDocument[];

        const mistakeQuestions = questions.filter(q => q.isCorrect === false);
        const totalMistakes = mistakeQuestions.length;

        const freq: Record<string, number> = {};
        mistakeQuestions.forEach(q => {
            const wid = q.wordId.toString();
            freq[wid] = (freq[wid] || 0) + 1;
        });

        const mostMissedWordIds = Object.entries(freq)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([wordId]) => wordId);

        const totalScore = quizzes.reduce((sum, q) => sum + (q.result!.scorePercent), 0);
        const averageScorePercent = totalQuizzes > 0
            ? Math.round(totalScore / totalQuizzes)
            : 0;

        return {
            userId,
            totalQuizzes,
            perfectScores,
            totalMistakes,
            mostMissedWordIds,
            averageScorePercent
        };
    }

    static async getDictionarySummary(
        userId: string,
        dictionaryId: string
    ): Promise<IDictionarySummary> {
        const ud = await UserDictionary.findOne({
            userId: new Types.ObjectId(userId),
            dictionaryId: new Types.ObjectId(dictionaryId)
        }).exec();

        if (!ud) {
            throw createError(403, 'Unauthorized to view this dictionary');
        }

        const dictOid = new Types.ObjectId(dictionaryId);

        const words = await Word.find({ dictionaryId: dictOid }).lean().exec();
        const totalWords = words.length;
        const learnedWords = words.filter(w => w.isLearned).length;
        const percentageLearned = totalWords > 0
            ? Math.round((learnedWords / totalWords) * 100)
            : 0;

        const quizzes = await Quiz.find({
            dictionaryId: dictOid,
            userId: new Types.ObjectId(userId),
            'result.scorePercent': { $exists: true }
        }).lean().exec();

        const quizzesTaken = quizzes.length;
        const totalScore = quizzes.reduce(
            (sum, q) => sum + (q.result!.scorePercent),
            0
        );
        const averageQuizScore = quizzesTaken > 0
            ? Math.round(totalScore / quizzesTaken)
            : 0;

        return {
            dictionaryId,
            totalWords,
            learnedWords,
            percentageLearned,
            quizzesTaken,
            averageQuizScore
        };
    }
}