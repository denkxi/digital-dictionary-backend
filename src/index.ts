import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI!;

async function start() {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    app.get('/', async (_req, res) => {
        const count = await db.collection('test').countDocuments();
        res.send(`Docs in collection: ${count}`);
    });

    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

start().catch(err => {
    console.error(err);
    process.exit(1);
});
