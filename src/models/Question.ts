import {model, Schema, Types} from "mongoose";
import {QuestionType} from "../types/types";

const QuestionSchema = new Schema({
    quizId: { type: Types.ObjectId, ref: 'Quiz', required: true },
    wordId: { type: Types.ObjectId, ref: 'Word', required: true },
    prompt: { type: String, required: true },
    choices: { type: Array, required: true },
    questionType: { type: QuestionType, required: true },
    correctAnswer: { type: String, required: true },
    userAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
}, { timestamps: true });

export const Question = model('Question', QuestionSchema);