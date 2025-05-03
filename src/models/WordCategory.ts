import {model, Schema, Types, Document} from "mongoose";


export interface IWordCategory {
    name: string;
    description?: string;
    createdBy: Types.ObjectId;
}

export interface IWordCategoryDocument extends IWordCategory, Document {}

const WordCategorySchema = new Schema<IWordCategoryDocument>({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const WordCategory = model<IWordCategoryDocument>('WordCategory', WordCategorySchema);