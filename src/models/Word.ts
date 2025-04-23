import {model, Schema, Types} from "mongoose";


const WordSchema = new Schema({
    categoryId: { type: Types.ObjectId, ref: 'Category' }, // nullable
    dictionaryId: { type: Types.ObjectId, ref: 'Dictionary', required: true },
    writing: { type: String, required: true },
    pronunciation: { type: String, required: false },
    description: { type: String, required: false },
    isStarred: { type: Boolean, default: false },
    isLearned: { type: Boolean, default: false },
}, { timestamps: true });

export const Word = model('Word', WordSchema);