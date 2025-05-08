import {model, Schema, Types, Document} from "mongoose";
import {EWordClass} from "../types/types";

export interface IWord {
    dictionaryId: Types.ObjectId,
    categoryId?: Types.ObjectId,
    writing: string,
    translation: string,
    pronunciation?: string,
    definition?: string,
    useExample?: string,
    wordClass?: EWordClass,
    isStarred: boolean,
    isLearned: boolean,
}

export interface IWordDocument extends IWord, Document {}

const WordSchema = new Schema<IWordDocument>({
    dictionaryId: { type: Schema.Types.ObjectId, ref: 'Dictionary', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    writing: { type: String, required: true },
    translation: { type: String, required: true },
    pronunciation: { type: String },
    definition: { type: String },
    useExample: { type: String },
    wordClass: { type: String, enum: Object.values(EWordClass) },
    isStarred: { type: Boolean, default: false },
    isLearned: { type: Boolean, default: false },
}, { timestamps: true });

export const Word = model<IWordDocument>('Word', WordSchema);