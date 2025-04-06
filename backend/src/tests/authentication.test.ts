import mongoose from 'mongoose';
import request from 'sync-request-curl';
import bcrypt from 'bcrypt';
import { User } from '../user';
import { getBody, getStatusCode } from '../helpers';
import { url, port, MONGODB_URI } from '../config.json';

jest.setTimeout(30000); // Up to 30s if needed

const SERVER_URL = `${url}:${port}`;

const testEmail = 'testuser@example.com';
const testPassword = 'password123';

beforeAll(async () => {
    // 1) Connect to DB
    await mongoose.connect(MONGODB_URI);

    // 2) Clean up any existing user
    await User.deleteOne({ email: testEmail });

    // 3) Create test user with hashed password
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    await User.create({
        name: 'Test user',
        email: testEmail,
        password: hashedPassword,
    });
});

afterAll(async () => {
    // Remove test user
    await User.deleteOne({ email: testEmail });

    // Close DB connection
    await mongoose.disconnect();
});

describe('POST /login', () => {
    test('Valid email and password returns a JWT token', () => {
        const result = request('POST', `${SERVER_URL}/login`, {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: testPassword }),
        });

        expect(getStatusCode(result)).toBe(200);

        const body = getBody(result);
        expect(body).toHaveProperty('accessToken');
    });

    test('Missing email and password returns error', () => {
        const result = request('POST', `${SERVER_URL}/login`, {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        expect(getStatusCode(result)).toBe(400);
        expect(getBody(result)).toStrictEqual({
            message: 'Email and password are required',
        });
    });

    test('Incorrect password returns error', () => {
        const result = request('POST', `${SERVER_URL}/login`, {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: 'wrongpass' }),
        });

        expect(getStatusCode(result)).toBe(400);
        expect(getBody(result)).toStrictEqual({
            message: 'Invalid username or password',
        });
    });

    test('Nonexistent user returns error', () => {
        const result = request('POST', `${SERVER_URL}/login`, {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'doesnotexist@example.com',
                password: 'whatever',
            }),
        });

        expect(getStatusCode(result)).toBe(400);
        expect(getBody(result)).toStrictEqual({
            message: 'Invalid username or password',
        });
    });
});
