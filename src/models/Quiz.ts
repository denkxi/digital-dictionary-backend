import {model, Schema, Types, Document} from "mongoose";
import {EQuestionType } from "../types/types";

export interface IQuiz {
    userId: Types.ObjectId;
    dictionaryId: Types.ObjectId;
    questionType: EQuestionType;
    wordCount: number;
    result?: {
        correctCount: number;
        incorrectCount: number;
        scorePercent: number;
        totalCount: number;
        durationSeconds?: number;
    }
    completedAt?: Date;
}
export interface IQuizDocument extends IQuiz, Document {
    createdAt: Date;
    updatedAt: Date;
}

const ResultSchema = new Schema<NonNullable<IQuiz['result']>>(
    {
        correctCount:   { type: Number, required: true },
        incorrectCount: { type: Number, required: true },
        totalCount:     { type: Number, required: true },
        scorePercent:   { type: Number, required: true },
        durationSeconds: { type: Number },
    },
    { _id: false }
);

const QuizSchema = new Schema<IQuizDocument>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dictionaryId: { type: Schema.Types.ObjectId, ref: 'Dictionary', required: true },
    questionType: { type: String, enum: Object.values(EQuestionType), required: true },
    wordCount: { type: Number, required: true },
    result: { type: ResultSchema},
    completedAt: { type: Date },
}, { timestamps: true });

export const Quiz = model<IQuizDocument>('Quiz', QuizSchema);