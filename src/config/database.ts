import mongoose from 'mongoose';

const MONGO_URI: string = process.env.MONGO_URI!;

export async function connectDatabase(): Promise<typeof mongoose> {
    console.log(MONGO_URI);
    mongoose.set('strictQuery', true);
    return mongoose.connect(MONGO_URI, {

    });
}