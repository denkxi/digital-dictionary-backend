import {model, Schema, Types, Document} from "mongoose";
import { EQuestionType } from "../types/types";

export interface IQuestion {
    quizId:        Types.ObjectId;
    wordId:        Types.ObjectId;
    prompt:        string;
    choices:       string[];
    questionType: EQuestionType;
    correctAnswer: string;
    userAnswer?:   string;
    isCorrect?:    boolean;
}

export interface IQuestionDocument extends IQuestion, Document {}


const QuestionSchema = new Schema<IQuestionDocument>({
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    wordId: { type: Schema.Types.ObjectId, ref: 'Word', required: true },
    prompt: { type: String, required: true },
    choices: {
        type: [String],
        minLength: 4,
        maxLength: 4,
    },
    questionType: { type: String, enum: EQuestionType, required: true },
    correctAnswer: { type: String, required: true },
    userAnswer: { type: String },
    isCorrect: { type: Boolean },
}, { timestamps: true });

export const Question = model<IQuestionDocument>('Question', QuestionSchema);