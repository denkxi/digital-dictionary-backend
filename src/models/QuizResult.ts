import {model, Schema } from "mongoose";

const QuizResultSchema = new Schema({
    correctCount: { type: Number, required: true },
    incorrectCount: { type: Number, required: true },
    scorePercentage: { type: Number, required: true },
    durationSeconds: { type: Number, required: true },
}, { timestamps: true });

export const QuizResult = model('QuizResult', QuizResultSchema);