import request from 'supertest';
import mongoose, {Types} from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { EQuestionType } from '../../src/types/types';
import { Question as QuestionModel, IQuestionDocument } from '../../src/models/Question';

let mongo: MongoMemoryServer;
let token: string;
let dictId: string;

beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await request(app).post('/api/auth/register').send({ name: 'U', email: 'u@e.com', password: 'password' });
    const res = await request(app).post('/api/auth/login').send({ email: 'u@e.com', password: 'password' });
    token = res.body.token!;
    const d = await request(app)
        .post('/api/dictionaries')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'D', sourceLanguage: 'EN', targetLanguage: 'EE', isOpen: true });
    dictId = d.body._id;
    await Promise.all([
        request(app).post('/api/words').set('Authorization', `Bearer ${token}`).send({
            dictionaryId: dictId,
            writing: 'apple',
            translation: 'õun',
        }),
        request(app).post('/api/words').set('Authorization', `Bearer ${token}`).send({
            dictionaryId: dictId,
            writing: 'banana',
            translation: 'banaan',
        }),
    ]);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
});

it('…statistics variant B', async () => {
    const [q1, q2] = await Promise.all([1,2].map(async () => {
        const r = await request(app)
            .post('/api/quizzes')
            .set('Authorization', `Bearer ${token}`)
            .send({ dictionaryId: dictId, wordCount: 2, questionType: EQuestionType.Mixed })
            .expect(201);
        return r.body.quizId as string;
    }));

    const qs1 = await QuestionModel.find({ quizId: q1 }).lean().exec() as IQuestionDocument[];
    const ans1 = qs1.map(q => ({
        questionId: (q._id as Types.ObjectId).toString(),
        userAnswer: q.correctAnswer!,
    }));

    await request(app)
        .post(`/api/quizzes/${q1}/submit`)
        .set('Authorization', `Bearer ${token}`)
        .send(ans1)
        .expect(200);

    const us = await request(app)
        .get('/api/statistics/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    expect(us.body).toMatchObject({
        totalQuizzes: 1,
        perfectScores: 1,
        totalMistakes: 0,
        mostMissedWordIds: [],
        averageScorePercent: 100
    });

    const ds = await request(app)
        .get('/api/statistics/dictionary')
        .query({ dictionaryId: dictId })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    expect(ds.body).toMatchObject({
        dictionaryId: dictId,
        totalWords: 2,
        learnedWords: 0,
        percentageLearned: 0,
        quizzesTaken: 1,
        averageQuizScore: 100
    });
});
