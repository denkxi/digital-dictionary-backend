import {model, Schema, Types} from "mongoose";
import {WordClass} from "../types/types";


const WordSchema = new Schema({
    categoryId: { type: Types.ObjectId, ref: 'Category' },
    dictionaryId: { type: Types.ObjectId, ref: 'Dictionary', required: true },
    writing: { type: String, required: true },
    translation: { type: String, required: true },
    pronunciation: { type: String },
    definition: { type: String },
    useExample: { type: String },
    wordClass: { type: WordClass },
    isStarred: { type: Boolean, default: false },
    isLearned: { type: Boolean, default: false },
}, { timestamps: true });

export const Word = model('Word', WordSchema);