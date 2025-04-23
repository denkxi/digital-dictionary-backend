import { model, Schema, Types} from "mongoose";

const UserDictionarySchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    dictionaryId: { type: Types.ObjectId, ref: 'Dictionary', required: true },
}, { timestamps: true });


export const UserDictionary = model('UserDictionary', UserDictionarySchema);