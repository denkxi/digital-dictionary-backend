import {model, Schema, Types} from "mongoose";


const WordCategorySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const WordCategory = model('WordCategory', WordCategorySchema);