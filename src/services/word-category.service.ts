import {IWordCategory, IWordCategoryDocument, WordCategory} from "../models/WordCategory";
import createError from "http-errors";
import {SortOrder, Types} from "mongoose";
import {escapeRegex} from "../utils/utils";
import {ListOptions} from "../types/types";


export class WordCategoryService {
    static async list(
        userId: string,
        { search = '', sort = 'name-asc', page, limit }: ListOptions
    ): Promise<{
        items: IWordCategoryDocument[];
        totalItems: number;
        totalPages: number;
    }> {
        const filter: any = { createdBy: new Types.ObjectId(userId) };
        if (search) {
            const esc = escapeRegex(search);
            filter.name = { $regex: esc, $options: 'i' };
        }

        const totalItems = await WordCategory.countDocuments(filter).exec();
        const totalPages = Math.ceil(totalItems / limit);

        let sortObj: Record<string, SortOrder>;
        switch (sort) {
            case 'name-asc':
                sortObj = { name: 1 };
                break;
            case 'name-desc':
                sortObj = { name: -1 };
                break;
            case 'date-asc':
                sortObj = { createdAt: 1 };
                break;
            case 'date-desc':
            default:
                sortObj = { createdAt: -1 };
        }

        const items = await WordCategory.find(filter)
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        return { items, totalItems, totalPages };
    }

    static async listAllCategories(
        userId: string
    ): Promise<IWordCategoryDocument[]> {
        return WordCategory
            .find({ createdBy: userId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    static async create(
        userId: string,
        name: string,
        description?: string
    ): Promise<IWordCategoryDocument> {
        const cat = new WordCategory({ name, description, createdBy: userId });
        return cat.save();
    }


    static async getById(
        userId: string,
        id: string
    ): Promise<IWordCategoryDocument> {
        const cat = await WordCategory.findOne({ _id: id, createdBy: userId }).exec();
        if (!cat) throw createError(404, 'Category not found');
        return cat;
    }

    static async update(
        userId: string,
        id: string,
        data: Partial<Pick<IWordCategoryDocument, 'name' | 'description'>>
    ): Promise<IWordCategoryDocument> {
        const cat = await WordCategory.findOneAndUpdate(
            { _id: id, createdBy: userId },
            { $set: data },
            { new: true, runValidators: true }
        ).exec();
        if (!cat) throw createError(404, 'Category not found or unauthorized');
        return cat;
    }

    static async delete(userId: string, id: string): Promise<void> {
        const result = await WordCategory.deleteOne({ _id: id, createdBy: userId }).exec();
        if (result.deletedCount === 0) throw createError(404, 'Category not found or unauthorized');
    }

}