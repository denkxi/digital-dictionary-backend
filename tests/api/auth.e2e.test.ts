import request from 'supertest';
import app from '../../src/app';
import {clearInMemoryDB, closeInMemoryDB, connectInMemoryDB} from "../setup";

describe('Auth API', () => {
    beforeAll(async () => {
        await connectInMemoryDB();
    });

    afterEach(async () => {
        await clearInMemoryDB();
    });

    afterAll(async () => {
        await closeInMemoryDB();
    });

    it('POST /api/auth/register → 201 + user without passwordHash', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Alice', email: 'a@e.com', password: 'pass1234' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('POST /api/auth/login → 200 + set-cookie', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Bob', email: 'b@e.com', password: 'secret' });
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'b@e.com', password: 'secret' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        const cookies = res.get('Set-Cookie') as string[];
        expect(Array.isArray(cookies)).toBe(true);
        expect(cookies.join('; ')).toMatch(/refreshToken=.*; HttpOnly/);
    });

    it('POST /api/auth/refresh → 200 new tokens', async () => {
        const loginRes = await request(app)
            .post('/api/auth/register')
            .send({ name: 'C', email: 'c@e.com', password: 'secret' })
            .then(() => request(app).post('/api/auth/login').send({ email: 'c@e.com', password: 'secret' }));
        const cookie = loginRes.headers['set-cookie'];
        const res = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', cookie)
            .send();
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        const cookies = res.get('Set-Cookie') as string[];
        expect(cookies).toBeDefined();
        expect(cookies.join('; ')).toMatch(/refreshToken=.*; HttpOnly/);

    });

    it('POST /api/auth/logout → 204 clears cookie', async () => {
        const cookie = (await request(app)
                .post('/api/auth/register')
                .send({ name: 'D', email: 'd@e.com', password: 'secret' })
                .then(() => request(app).post('/api/auth/login').send({ email: 'd@e.com', password: 'secret' }))
        ).headers['set-cookie'];
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', cookie)
            .send();
        const logoutCookies = res.get('Set-Cookie') as string[];
        expect(logoutCookies.join('; ')).toMatch(/refreshToken=;/);
    });
});
