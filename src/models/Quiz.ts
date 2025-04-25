import {model, Schema, Types} from "mongoose";
import {QuestionType} from "../types/types";

const QuizSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    dictionaryId: { type: Types.ObjectId, ref: 'Dictionary', required: true },
    questionType: { type: QuestionType, required: true },
    wordCount: { type: Number, required: true },
    result: {
        type: {
            correctCount: { type: Number, required: true },
            incorrectCount: { type: Number, required: true },
            totalCount: { type: Number, required: true },
            scorePercent: { type: Number, required: true },
            durationSeconds: { type: Number, required: false },
        }},
    completedAt: { type: Date },
}, { timestamps: true });

export const Quiz = model('Quiz', QuizSchema);