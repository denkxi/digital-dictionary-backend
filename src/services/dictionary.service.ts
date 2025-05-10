import {Dictionary, IDictionaryDocument} from "../models/Dictionary";
import createError from "http-errors";
import {IUserDictionaryDocument, UserDictionary} from "../models/UserDictionary";

export class DictionaryService {
    static async create(sourceLanguage: string,
                        targetLanguage: string,
                        createdBy: string,
                        description: string,
                        isOpen: boolean) {
        const dict = new Dictionary({ sourceLanguage, targetLanguage, createdBy, description, isOpen });
        const saved = await dict.save();
        await new UserDictionary({userId: createdBy, dictionaryId: saved._id}).save();
        return saved;
    }

    static async hasAccess(userId: string, dictionaryId: string): Promise<boolean> {
        const ud = await UserDictionary.findOne({ dictionaryId, userId: userId });
        return !!ud;

    }

    static async listOwn(userId: string): Promise<IDictionaryDocument[]> {
        return Dictionary.find({createdBy: userId}).sort({createdAt: -1}).exec();
    }

    static async listOpen(userId: string): Promise<IDictionaryDocument[]> {
        return Dictionary.find({ isOpen: true, createdBy: {$ne: userId}}).sort({createdAt: -1}).exec();
    }

    static async getOwnById(id: string, userId: string): Promise<IDictionaryDocument> {
        const dict = await Dictionary.findOne({ _id: id, createdBy: userId }).exec();
        if (!dict) throw createError(404, 'Dictionary not found');
        return dict;
    }

    static async getPublicById(id: string, userId: string): Promise<IDictionaryDocument> {
        const dict = await Dictionary.findOne({ _id: id, isOpen: true, createdBy: { $ne: userId } }).exec();
        if (!dict) throw createError(404, 'Public dictionary not found');
        return dict;
    }

    static async delete(id: string, userId: string): Promise<void> {
        const result = await Dictionary.deleteOne({ id, createdBy: userId }).exec();
        if (result.deletedCount === 0) throw createError(404, 'Dictionary not found or unauthorized');
        await UserDictionary.deleteMany({ dictionaryId: id }).exec();
    }

    static async update(id: string,
                        userId: string,
                        data: Partial<Pick<IDictionaryDocument, 'sourceLanguage' | 'targetLanguage' | 'description' | 'isOpen'>>){
        const dict = await Dictionary.findOneAndUpdate(
            { _id: id, createdBy: userId },
            {$set: data},
            { new: true, runValidators: true }
        ).exec();
        if (!dict) throw createError(404, 'Dictionary not found or unauthorized');
        return dict;
    }

    static async borrowDictionary(dictionaryId: string, userId: string, ): Promise<IUserDictionaryDocument> {
        const dict = await Dictionary.findById(dictionaryId);
        if(!dict) throw createError(404, 'Dictionary not found');
        if(!dict.isOpen) throw createError(403, 'Dictionary is not open for borrowing');
        const ud = new UserDictionary({userId, dictionaryId});
        return ud.save();
    }

    static async listUserDictionaries(userId: string): Promise<IUserDictionaryDocument[]> {
        return UserDictionary
            .find({userId})
            .populate('dictionary')
            .sort({ createdAt: -1})
            .exec();
    }

    static async listAllDictionaries(userId: string): Promise<IDictionaryDocument[]> {
        return Dictionary.find().exec();
    }


    static async returnDictionary(dictionaryId: string, userId: string,): Promise<void> {
        const result = await UserDictionary.deleteOne({ userId, dictionaryId }).exec();
        if (result.deletedCount === 0) throw createError(404, 'UserDictionary not found');
    }
}