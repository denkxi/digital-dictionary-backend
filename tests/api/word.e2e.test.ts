import request from 'supertest';
import app from '../../src/app';
import {
    connectInMemoryDB,
    clearInMemoryDB,
    closeInMemoryDB
} from '../setup';
import { EWordClass } from '../../src/types/types';

describe('Word API', () => {
    let user1Token: string;
    let user2Token: string;
    let dictId: string;
    let wordId: string;

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
            .send({ name: 'User1', email: 'u1@test.com', password: 'secret1' })
            .expect(201);
        const login1 = await request(app)
            .post('/api/auth/login')
            .send({ email: 'u1@test.com', password: 'secret1' })
            .expect(200);
        user1Token = login1.body.token;

        await request(app)
            .post('/api/auth/register')
            .send({ name: 'User2', email: 'u2@test.com', password: 'secret2' })
            .expect(201);
        const login2 = await request(app)
            .post('/api/auth/login')
            .send({ email: 'u2@test.com', password: 'secret2' })
            .expect(200);
        user2Token = login2.body.token;

        const dictRes = await request(app)
            .post('/api/dictionaries')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({
                name: 'TestDict',
                sourceLanguage: 'L1',
                targetLanguage: 'L2',
                description: 'desc',
                isOpen: true
            })
            .expect(201);
        dictId = dictRes.body._id;
    });

    it('POST /api/words → 201 + created word', async () => {
        const res = await request(app)
            .post('/api/words')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({
                dictionaryId: dictId,
                writing: 'hello',
                translation: 'tere',
                pronunciation: 'həˈloʊ',
                definition: 'a greeting',
                useExample: 'Hello, world!',
                wordClass: EWordClass.Noun,
                isStarred: true,
                isLearned: false
            })
            .expect(201);

        expect(res.body).toHaveProperty('_id');
        expect(res.body).toMatchObject({
            writing: 'hello',
            translation: 'tere',
            isStarred: true,
            isLearned: false
        });

        wordId = res.body._id;
    });

    it('GET /api/words/all → 200 + all words (open dict, borrower)', async () => {
        await request(app)
            .post('/api/words')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ dictionaryId: dictId, writing: 'a', translation: 'A' })
            .expect(201);
        await request(app)
            .post('/api/words')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ dictionaryId: dictId, writing: 'b', translation: 'B' })
            .expect(201);

        await request(app)
            .post(`/api/dictionaries/${dictId}/borrow`)
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(201);

        const res = await request(app)
            .get('/api/words/all')
            .set('Authorization', `Bearer ${user2Token}`)
            .query({ dictionaryId: dictId })
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
    });

    it('GET /api/words → 200 + paginated list with filters/sort', async () => {
        await Promise.all(
            ['x','y','z'].map((w, i) =>
                request(app)
                    .post('/api/words')
                    .set('Authorization', `Bearer ${user1Token}`)
                    .send({ dictionaryId: dictId, writing: w, translation: w.toUpperCase() })
                    .expect(201)
            )
        );

        const res = await request(app)
            .get('/api/words')
            .set('Authorization', `Bearer ${user1Token}`)
            .query({
                dictionaryId: dictId,
                sort: 'name-desc',
                page: '1',
                limit: '2'
            })
            .expect(200);

        expect(res.body).toHaveProperty('items');
        expect(res.body.items.length).toBe(2);
        expect(res.body).toMatchObject({
            totalItems: 3,
            totalPages: 2,
            currentPage: 1
        });
        expect(res.body.items[0].writing).toBe('z');
    });

    it('GET /api/words/:id → 200 when borrower or owner', async () => {
        const create = await request(app)
            .post('/api/words')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ dictionaryId: dictId, writing: 'hi', translation: 'HI' })
            .expect(201);
        const id = create.body._id;

        await request(app)
            .get(`/api/words/${id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(200);

        await request(app)
            .post(`/api/dictionaries/${dictId}/borrow`)
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(201);

        await request(app)
            .get(`/api/words/${id}`)
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(200);

        await request(app)
            .post('/api/auth/register')
            .send({ name:'U3', email:'u3@t.com', password:'secret3' })
            .expect(201);
        const login3 = await request(app)
            .post('/api/auth/login')
            .send({ email:'u3@t.com', password:'secret3' })
            .expect(200);
        const token3 = login3.body.token;

        await request(app)
            .get(`/api/words/${id}`)
            .set('Authorization', `Bearer ${token3}`)
            .expect(403);
    });

    it('PATCH /api/words/:id → 200 for owner, 403 for others', async () => {
        const create = await request(app)
            .post('/api/words')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ dictionaryId: dictId, writing: 'orig', translation: 'ORIG' })
            .expect(201);
        const id = create.body._id;

        const patch = await request(app)
            .patch(`/api/words/${id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ translation: 'Changed', isLearned: true })
            .expect(200);
        expect(patch.body).toMatchObject({
            _id: id,
            translation: 'Changed',
            isLearned: true
        });

        await request(app)
            .post(`/api/dictionaries/${dictId}/borrow`)
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(201);
        await request(app)
            .patch(`/api/words/${id}`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send({ translation: 'Hack' })
            .expect(403);
    });

    it('DELETE /api/words/:id → 204 for owner only', async () => {
        const create = await request(app)
            .post('/api/words')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ dictionaryId: dictId, writing: 'bye', translation: 'BYE' })
            .expect(201);
        const id = create.body._id;

        await request(app)
            .post('/api/auth/register')
            .send({ name:'U4', email:'u4@t.com', password:'secret4' })
            .expect(201);
        const login4 = await request(app)
            .post('/api/auth/login')
            .send({ email:'u4@t.com', password:'secret4' })
            .expect(200);
        const token4 = login4.body.token;
        await request(app)
            .delete(`/api/words/${id}`)
            .set('Authorization', `Bearer ${token4}`)
            .expect(403);

        await request(app)
            .delete(`/api/words/${id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(204);

        await request(app)
            .get(`/api/words/${id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(404);
    });
});
