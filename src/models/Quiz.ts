import {model, Schema, Types} from "mongoose";
import {QuestionType} from "../types/types";

const QuizSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    dictionaryId: { type: Types.ObjectId, ref: 'Dictionary', required: true },
    resultId: { type: Types.ObjectId, ref: 'QuizResult' },
    wordCount: { type: Number, required: true },
    completedAt: { type: Date },
    questionType: { type: QuestionType, required: true },
}, { timestamps: true });

export const Quiz = model('Quiz', QuizSchema);