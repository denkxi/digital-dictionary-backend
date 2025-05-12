import request from 'supertest';
import app from '../../src/app';
import {
    connectInMemoryDB,
    clearInMemoryDB,
    closeInMemoryDB
} from '../setup';

describe('Word Category API', () => {
    let token: string;

    beforeAll(async () => {
        process.env.JWT_SECRET = 'test-secret';
        process.env.JWT_EXPIRES_IN = '1h';
        await connectInMemoryDB();

        await request(app)
            .post('/api/auth/register')
            .send({ name: 'CatUser', email: 'cat@user.com', password: 'pw1234' })
            .expect(201);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'cat@user.com', password: 'pw1234' })
            .expect(200);
        token = res.body.token;
    });

    afterEach(async () => {
        await clearInMemoryDB();
    });

    afterAll(async () => {
        await closeInMemoryDB();
    });

    it('POST /api/word-categories → 201 + created category', async () => {
        const res = await request(app)
            .post('/api/word-categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Animals', description: 'All about animals' })
            .expect(201);

        expect(res.body).toHaveProperty('_id');
        expect(res.body).toMatchObject({
            name: 'Animals',
            description: 'All about animals'
        });
    });

    it('GET /api/word-categories/all → 200 all categories (no pagination)', async () => {
        for (const nm of ['One','Two','Three']) {
            await request(app)
                .post('/api/word-categories')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: nm })
                .expect(201);
        }

        const res = await request(app)
            .get('/api/word-categories/all')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(3);
        expect(res.body.map((c:any) => c.name).sort()).toEqual(['One','Three','Two'].sort());
    });

    it('GET /api/word-categories → 200 paginated + filtered + sorted', async () => {
        for (const nm of ['Alpha','Beta','Gamma','Delta','Epsilon']) {
            await request(app)
                .post('/api/word-categories')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: nm })
                .expect(201);
        }

        let res = await request(app)
            .get('/api/word-categories')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body).toHaveProperty('items');
        expect(res.body.items).toHaveLength(5);
        expect(res.body.totalItems).toBe(5);
        expect(res.body.currentPage).toBe(1);
        expect(res.body.totalPages).toBe(1);

        res = await request(app)
            .get('/api/word-categories')
            .query({ search: 'a' })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body.totalItems).toBe(4);

        res = await request(app)
            .get('/api/word-categories')
            .query({ sort: 'name-asc' })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        const names = res.body.items.map((c:any) => c.name);
        expect(names).toEqual([...names].sort());

        res = await request(app)
            .get('/api/word-categories')
            .query({ limit: 2, page: 2, sort: 'name-asc' })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body.items).toHaveLength(2);
        expect(res.body.totalPages).toBe(3);
        expect(res.body.currentPage).toBe(2);
    });

    it('GET /api/word-categories/:id → 200 single category', async () => {
        const post = await request(app)
            .post('/api/word-categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Solo', description: 'Only one' })
            .expect(201);

        const id = post.body._id;
        const res = await request(app)
            .get(`/api/word-categories/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toMatchObject({ _id: id, name: 'Solo', description: 'Only one' });
    });

    it('PATCH /api/word-categories/:id → 200 updates and 404 if unauthorized', async () => {
        const post = await request(app)
            .post('/api/word-categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Mutable', description: 'Old desc' })
            .expect(201);
        const id = post.body._id;

        const patch = await request(app)
            .patch(`/api/word-categories/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated', description: 'New desc' })
            .expect(200);
        expect(patch.body).toMatchObject({ _id: id, name: 'Updated', description: 'New desc' });

        await request(app)
            .post('/api/auth/register')
            .send({ name:'Evil', email:'evil@e.com', password:'secret' })
            .expect(201);
        const evilLogin = await request(app)
            .post('/api/auth/login')
            .send({ email:'evil@e.com', password:'secret' })
            .expect(200);
        const evilToken = evilLogin.body.token;

        await request(app)
            .patch(`/api/word-categories/${id}`)
            .set('Authorization', `Bearer ${evilToken}`)
            .send({ name: 'Hack' })
            .expect(404);
    });

    it('DELETE /api/word-categories/:id → 204 clears it and 404 if already gone or unauthorized', async () => {
        const post = await request(app)
            .post('/api/word-categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'ToDelete' })
            .expect(201);
        const id = post.body._id;

        await request(app)
            .delete(`/api/word-categories/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204);

        await request(app)
            .get(`/api/word-categories/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        await request(app)
            .delete(`/api/word-categories/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });
});
