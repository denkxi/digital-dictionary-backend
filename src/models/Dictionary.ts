import {model, Schema, Types, Document} from "mongoose";

export interface IDictionary {
    sourceLanguage: string;
    targetLanguage: string;
    description?: string
    createdBy: Types.ObjectId;
    isOpen: boolean;
}

export interface IDictionaryDocument extends IDictionary, Document {}

const DictionarySchema = new Schema({
    sourceLanguage: { type: String, required: true },
    targetLanguage: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    isOpen: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Dictionary = model<IDictionaryDocument>('Dictionary', DictionarySchema);