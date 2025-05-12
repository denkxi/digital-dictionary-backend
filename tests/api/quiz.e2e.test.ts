import request from 'supertest';
import app from '../../src/app';
import {
    connectInMemoryDB,
    clearInMemoryDB,
    closeInMemoryDB
} from '../setup';

import { Quiz as QuizModel } from '../../src/models/Quiz';
import {IQuestionDocument, Question as QuestionModel} from '../../src/models/Question';
import { EQuestionType, EWordClass } from '../../src/types/types';

describe('Quiz API', () => {
    let u1token: string;
    let dictId: string;

    beforeAll(async () => {
        process.env.JWT_SECRET = 'test-secret';
        process.env.JWT_EXPIRES_IN = '1h';
        await connectInMemoryDB();
    });

    afterAll(async () => {
        await closeInMemoryDB();
    });

    beforeEach(async () => {
        await clearInMemoryDB();

        await request(app)
            .post('/api/auth/register')
            .send({ name: 'U1', email: 'u1@test.com', password: 'password1' })
            .expect(201);
        const login = await request(app)
            .post('/api/auth/login')
            .send({ email: 'u1@test.com', password: 'password1' })
            .expect(200);
        u1token = login.body.token;

        const dict = await request(app)
            .post('/api/dictionaries')
            .set('Authorization', `Bearer ${u1token}`)
            .send({
                name: 'QuizDict',
                sourceLanguage: 'L1',
                targetLanguage: 'L2',
                isOpen: true
            })
            .expect(201);
        dictId = dict.body._id;

        const words = [
            { writing: 'a', translation: 'A', wordClass: EWordClass.Noun },
            { writing: 'b', translation: 'B', wordClass: EWordClass.Verb },
            { writing: 'c', translation: 'C', wordClass: EWordClass.Adjective },
        ];
        for (const w of words) {
            await request(app)
                .post('/api/words')
                .set('Authorization', `Bearer ${u1token}`)
                .send({ dictionaryId: dictId, ...w })
                .expect(201);
        }
    });

    it('POST /api/quizzes → 201 + quizId', async () => {
        const res = await request(app)
            .post('/api/quizzes')
            .set('Authorization', `Bearer ${u1token}`)
            .send({
                dictionaryId: dictId,
                wordCount: 2,
                questionType: EQuestionType.Translation
            })
            .expect(201);

        expect(res.body).toHaveProperty('quizId');
        // quiz actually in DB
        const q = await QuizModel.findById(res.body.quizId).exec();
        expect(q).not.toBeNull();
        expect(q!.wordCount).toBe(2);
    });

    it('GET /api/quizzes/:id → questions array', async () => {
        const start = await request(app)
            .post('/api/quizzes')
            .set('Authorization', `Bearer ${u1token}`)
            .send({
                dictionaryId: dictId,
                wordCount: 3,
                questionType: EQuestionType.Mixed
            })
            .expect(201);
        const quizId = start.body.quizId;

        const res = await request(app)
            .get(`/api/quizzes/${quizId}`)
            .set('Authorization', `Bearer ${u1token}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(3);
        expect(res.body[0]).toHaveProperty('_id');
        expect(res.body[0]).toHaveProperty('prompt');
        expect(res.body[0]).toHaveProperty('choices');
    });

    it('POST /api/quizzes/:id/submit + GET /api/quizzes/:id/result flow', async () => {
        // start quiz
        const { body: { quizId } } = await request(app)
            .post('/api/quizzes')
            .set('Authorization', `Bearer ${u1token}`)
            .send({
                dictionaryId: dictId,
                wordCount: 3,
                questionType: EQuestionType.Translation
            })
            .expect(201);

        const qs = await QuestionModel.find({ quizId }).lean().exec();
        expect(qs.length).toBe(3);
        const answers = qs.map(q => ({
            questionId: q._id.toString(),
            userAnswer: q.correctAnswer
        }));

        const sub = await request(app)
            .post(`/api/quizzes/${quizId}/submit`)
            .set('Authorization', `Bearer ${u1token}`)
            .send(answers)
            .expect(200);

        expect(sub.body).toMatchObject({
            correctCount: 3,
            incorrectCount: 0,
            totalCount: 3,
            scorePercent: 100
        });

        const res = await request(app)
            .get(`/api/quizzes/${quizId}/result`)
            .set('Authorization', `Bearer ${u1token}`)
            .expect(200);

        expect(res.body).toHaveProperty('completedAt');
        expect(res.body.result.scorePercent).toBe(100);
    });

    it('GET /api/quizzes → all/unfinished/completed', async () => {
        const [q1, q2] = await Promise.all([1,2].map(cnt =>
            request(app)
                .post('/api/quizzes')
                .set('Authorization', `Bearer ${u1token}`)
                .send({ dictionaryId: dictId, wordCount: 2, questionType: EQuestionType.Writing })
                .then(r => r.body.quizId)
        ));

        const qs1 = await QuestionModel
            .find({ quizId: q1 })
            .exec() as IQuestionDocument[];

        const ans1 = qs1.map(q => ({
            questionId: q.id.toString(),
            userAnswer: q.correctAnswer
        }));

        await request(app)
            .post(`/api/quizzes/${q1}/submit`)
            .set('Authorization', `Bearer ${u1token}`)
            .send(ans1)
            .expect(200);

        // listAll
        const all = await request(app)
            .get('/api/quizzes')
            .set('Authorization', `Bearer ${u1token}`)
            .expect(200);
        expect(Array.isArray(all.body)).toBe(true);
        expect(all.body.length).toBe(2);

        // unfinished
        const un = await request(app)
            .get('/api/quizzes/unfinished')
            .set('Authorization', `Bearer ${u1token}`)
            .expect(200);
        expect(Array.isArray(un.body)).toBe(true);
        expect(un.body.length).toBe(1);
        expect(un.body[0]._id).toBe(q2);

        // completed
        const comp = await request(app)
            .get('/api/quizzes/completed')
            .set('Authorization', `Bearer ${u1token}`)
            .expect(200);
        expect(Array.isArray(comp.body)).toBe(true);
        expect(comp.body.length).toBe(1);
        expect(comp.body[0]._id).toBe(q1);
    });
});
