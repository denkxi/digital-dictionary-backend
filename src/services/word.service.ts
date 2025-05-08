import {IWord, IWordDocument, Word} from "../models/Word";
import {Dictionary} from "../models/Dictionary";
import createError from "http-errors";
import {UserDictionary} from "../models/UserDictionary";
import {ListOptions} from "../types/types";
import {SortOrder, Types} from "mongoose";
import {escapeRegex} from "../utils/utils";


export class WordService {
    static async create(userId: string, dictionaryId: string, data: Partial<IWord>): Promise<IWordDocument> {
        console.log(dictionaryId, userId);
        const dict = await Dictionary.findOne({ _id: dictionaryId, createdBy: userId }).exec();
        if (!dict) throw createError(404, 'Dictionary not found or unauthorized');
        const word = new Word({ dictionaryId, ...data});
        return word.save();
    }

    static async listAll(userId: string, dictionaryId: string): Promise<IWordDocument[]> {
        const dict = await Dictionary.findOne({ _id: dictionaryId, isOpen: true }).exec();
        const ownDict = await Dictionary.findOne({ _id: dictionaryId, createdBy: userId }).exec();
        if (!ownDict && !dict) {
            throw createError(403, 'Unauthorized to view words in this dictionary');
        }
        return Word.find({dictionaryId}).sort({ createdAt: -1}).exec();
    }

    static async list(
        userId: string,
        dictionaryId: string,
        {
            search = '',
            sort = 'name-asc',
            wordClass,
            starred,
            learned,
            page,
            limit,
        }: ListOptions
    ): Promise<{
        items: IWordDocument[];
        totalItems: number;
        totalPages: number;
    }> {

        const openDict = await Dictionary.findOne({
            _id: dictionaryId,
            isOpen: true,
        }).exec();
        const ownDict = await Dictionary.findOne({
            _id: dictionaryId,
            createdBy: userId,
        }).exec();
        if (!ownDict && !openDict) {
            throw createError(403, 'Unauthorized to view words in this dictionary');
        }

        const filter: any = { dictionaryId: new Types.ObjectId(dictionaryId) };

        if (wordClass) {
            filter.wordClass = wordClass;
        }
        if (starred) {
            filter.isStarred = true;
        }
        if (learned) {
            filter.isLearned = true;
        }
        if (search) {
            const esc = escapeRegex(search);
            const regex = new RegExp(esc, 'i');
            filter.$or = [
                { writing: regex },
                { translation: regex },
                { pronunciation: regex },
                { definition: regex },
                { useExample: regex },
            ];
        }

        const totalItems = await Word.countDocuments(filter).exec();
        const totalPages = Math.ceil(totalItems / limit);

        let sortObj: Record<string, SortOrder>;
        switch (sort) {
            case 'name-asc':
                sortObj = { writing: 1 };
                break;
            case 'name-desc':
                sortObj = { writing: -1 };
                break;
            case 'date-asc':
                sortObj = { createdAt: 1 };
                break;
            case 'date-desc':
            default:
                sortObj = { createdAt: -1 };
        }

        const items = await Word.find(filter)
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        return { items, totalItems, totalPages };
    }

    static async getById(userId: string, wordId: string): Promise<IWordDocument> {
        const word = await Word.findById(wordId).exec();
        if(!word) throw createError(404, 'Word not found');
        const borrowed = await UserDictionary.findOne({ userId, dictionaryId: word.dictionaryId }).exec();
        if (!borrowed) {
            throw createError(403, 'Unauthorized to access this word');
        }
        return word;
    }

    static async update(userId: string, wordId: string, data: Partial<IWord>): Promise<IWordDocument> {
        const word = await Word.findById(wordId).exec();
        if (!word) throw createError(404, 'Word not found');
        const ownDict = await Dictionary.findOne({ _id: word.dictionaryId, createdBy: userId }).exec();
        if (!ownDict) {
            throw createError(403, 'Unauthorized to modify this word');
        }
        Object.assign(word, data);
        return word.save();
    }

    static async delete(userId: string, wordId: string): Promise<void> {
        const word = await Word.findById(wordId).exec();
        if (!word) throw createError(404, 'Word not found');
        const ownDict = await Dictionary.findOne({ _id: word.dictionaryId, createdBy: userId }).exec();
        if (!ownDict) {
            throw createError(403, 'Unauthorized to delete this word');
        }
        await word.deleteOne();
    }
}