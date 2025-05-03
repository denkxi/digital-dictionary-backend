import {IWordCategory, IWordCategoryDocument, WordCategory} from "../models/WordCategory";
import createError from "http-errors";


export class WordCategoryService {
    static async list(userId: string) {
        return await WordCategory.find({ createdBy: userId}).sort({ createdAt: -1 }).exec();
    }

    static async create(userId: string, name: string, description?: string) {
        const category = await WordCategory.create({name, description, createdBy: userId});
        return category.save();
    }

    static async getById(id: string, userId: string) {
        const category = await WordCategory.findOne({ _id: id , createdBy: userId });
        if (!category) throw createError(404, 'Category not found');
        return category;
    }

    static async update(
        id: string,
        userId: string,
        data: Partial<Pick<IWordCategory, 'name' | 'description'>>
    ): Promise<IWordCategoryDocument> {
        const cat = await WordCategory.findOneAndUpdate(
            { _id: id, createdBy: userId },
            { $set: data },
            { new: true, runValidators: true }
        ).exec();
        if (!cat) throw createError(404, 'Category not found or unauthorized');
        return cat;
    }

    static async delete(id: string, userId: string): Promise<void> {
        const res = await WordCategory.deleteOne({ _id: id, createdBy: userId }).exec();
        if (res.deletedCount === 0) {
            throw createError(404, 'Category not found or unauthorized');
        }
    }

}