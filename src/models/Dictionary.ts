import {model, Schema, Types} from "mongoose";


const DictionarySchema = new Schema({
    sourceLanguage: { type: String, required: true },
    targetLanguage: { type: String, required: true },
    description: { type: String, required: false },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Dictionary = model('Dictionary', DictionarySchema);