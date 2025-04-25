import { model, Schema, Types} from "mongoose";
import {IDictionaryDocument} from "./Dictionary";

export interface IUserDictionary {
    userId: Types.ObjectId;
    dictionaryId: Types.ObjectId;
}

export interface IUserDictionaryDocument extends IUserDictionary, Document {
    dictionary?: IDictionaryDocument;
}

const UserDictionarySchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    dictionaryId: { type: Types.ObjectId, ref: 'Dictionary', required: true },
}, { timestamps: true });

UserDictionarySchema.index({ userId: 1, dictionaryId: 1 }, { unique: true });
UserDictionarySchema.virtual('dictionary', {
    ref: 'Dictionary',
    localField: 'dictionaryId',
    foreignField: '_id',
    justOne: true,
});

export const UserDictionary = model<IUserDictionaryDocument>('UserDictionary', UserDictionarySchema);