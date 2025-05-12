import request from 'supertest';
import app from '../../src/app';
import {
    connectInMemoryDB,
    clearInMemoryDB,
    closeInMemoryDB,
} from '../setup';

describe('Dictionary API', () => {
    let user1Token: string;
    let user2Token: string;
    let dict1Id: string;
    let dict2Id: string;

    beforeAll(async () => {
        process.env.JWT_SECRET = 'test-secret';
        process.env.JWT_EXPIRES_IN = '1h';
        await connectInMemoryDB();
        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Alice', email: 'alice@example.com', password: 'secret' })
            .expect(201);
        const login1 = await request(app)
            .post('/api/auth/login')
            .send({ email: 'alice@example.com', password: 'secret' })
            .expect(200);
        user1Token = login1.body.token;

        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Bob', email: 'bob@example.com', password: 'secret' })
            .expect(201);
        const login2 = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@example.com', password: 'secret' })
            .expect(200);
        user2Token = login2.body.token;
    });

    afterEach(async () => {
        await clearInMemoryDB();
    });

    afterAll(async () => {
        await closeInMemoryDB();
    });

    it('POST /api/dictionaries → 201 + created dictionary', async () => {
        const res = await request(app)
            .post('/api/dictionaries')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({
                name: 'MyDict',
                sourceLanguage: 'Estonian',
                targetLanguage: 'English',
                description: 'Test dict',
                isOpen: true,
            })
            .expect(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toMatchObject({
            name: 'MyDict',
            sourceLanguage: 'Estonian',
            targetLanguage: 'English',
            description: 'Test dict',
            isOpen: true,
        });
        dict1Id = res.body._id;
    });

    it('GET /api/dictionaries/created-by-me → 200 own dictionaries', async () => {
        await request(app)
            .post('/api/dictionaries')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({
                name: 'Dict2',
                sourceLanguage: 'E', targetLanguage: 'T',
                description: 'd', isOpen: false,
            })
            .expect(201);
        const res = await request(app)
            .get('/api/dictionaries/created-by-me')
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toHaveProperty('_id');
    });

    it('GET /api/dictionaries/:id → 200 own by id and 404 if not own', async () => {
        const create = await request(app)
            .post('/api/dictionaries')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({
                name: 'Private',
                sourceLanguage: 'A', targetLanguage: 'B',
                description: 'd', isOpen: false,
            })
            .expect(201);
        const id = create.body._id;
        await request(app)
            .get(`/api/dictionaries/${id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(200);
        await request(app)
            .get(`/api/dictionaries/${id}`)
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(404);
    });

    it('PUT /api/dictionaries/:id → 201 updates and 403 if unauthorized', async () => {
        const create = await request(app)
            .post('/api/dictionaries')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({
                name: 'UpDict',
                sourceLanguage: 'X', targetLanguage: 'Y',
                description: 'old', isOpen: true,
            })
            .expect(201);
        const id = create.body._id;
        await request(app)
            .patch(`/api/dictionaries/${id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ name: 'UpDict2', sourceLanguage: 'X2', targetLanguage: 'Y2', description: 'new', isOpen: false })
            .expect(201)
            .then(r => {
                expect(r.body).toMatchObject({ name: 'UpDict2', isOpen: false });
            });
        await request(app)
            .patch(`/api/dictionaries/${id}`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send({ name: 'Hack' })
            .expect(404);
    });

    it('GET /api/dictionaries/all-open → 200 only others open dictionaries', async () => {
        await request(app)
            .post('/api/dictionaries')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ name: 'Open1', sourceLanguage: 'A','targetLanguage':'B',description:'d',isOpen:true })
            .expect(201);
        await request(app)
            .post('/api/dictionaries')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ name: 'Closed1', sourceLanguage: 'A','targetLanguage':'B',description:'d',isOpen:false })
            .expect(201);
        const other = await request(app)
            .post('/api/dictionaries')
            .set('Authorization', `Bearer ${user2Token}`)
            .send({ name: 'OtherOpen', sourceLanguage: 'C','targetLanguage':'D',description:'d',isOpen:true })
            .expect(201);
        await request(app)
            .get('/api/dictionaries/all-open')
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(200)
            .then(r => {
                expect(r.body).toHaveLength(1);
                expect(r.body[0]._id).toBe(other.body._id);
            });
    });

    it('POST /api/dictionaries/:id/borrow + GET /api/dictionaries → user dictionaries', async () => {
        const d = await request(app)
            .post('/api/dictionaries')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ name: 'BorrowMe', sourceLanguage:'SI','targetLanguage':'TA', isOpen:true })
            .expect(201);
        const id = d.body._id;
        await request(app)
            .post(`/api/dictionaries/${id}/borrow`)
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(201)
            .then(r => expect(r.body._id).toBe(id));
        await request(app)
            .get('/api/dictionaries')
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(200)
            .then(r => {
                expect(r.body.some((x: any) => x._id === id)).toBe(true);
            });
    });

    it('DELETE /api/dictionaries/:id/return → removes from user dictionaries', async () => {
        const d = await request(app)
            .post('/api/dictionaries')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ name:'ToReturn',sourceLanguage:'TL','targetLanguage':'TR', isOpen:true })
            .expect(201);
        const id = d.body._id;
        await request(app)
            .post(`/api/dictionaries/${id}/borrow`)
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(201);
        await request(app)
            .delete(`/api/dictionaries/${id}/return`)
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(204);
        await request(app)
            .get('/api/dictionaries')
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(200)
            .then(r => expect(r.body.some((x: any) => x._id === id)).toBe(false));
    });

    it('DELETE /api/dictionaries/:id → deletes and cascades userDictionaries', async () => {
        const d = await request(app)
            .post('/api/dictionaries')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ name:'DelDict',sourceLanguage:'A','targetLanguage':'B', isOpen:true })
            .expect(201);
        const id = d.body._id;
        await request(app)
            .post(`/api/dictionaries/${id}/borrow`)
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(201);
        await request(app)
            .delete(`/api/dictionaries/${id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(204);
        await request(app)
            .get('/api/dictionaries')
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(200)
            .then(r => expect(r.body.every((x: any) => x._id !== id)).toBe(true));
    });
});
