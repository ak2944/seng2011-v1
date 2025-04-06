import request from 'sync-request-curl';
import { url, port } from '../config.json';
import { getBody, getStatusCode } from '../helpers';
const SERVER_URL = `${url}:${port}`;

describe('POST /login', () => {
    test('Valid username returns a JWT token', () => {
        const result = request('POST', SERVER_URL + '/login', {
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: 'testuser' }),
        });
        expect(getStatusCode(result)).toStrictEqual(200);
        const body = getBody(result);
        expect(body).toHaveProperty('accessToken');
    });

    test('Missing username returns error', () => {
        const result = request('POST', SERVER_URL + '/login', {
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}), // No username provided
        });
        expect(getStatusCode(result)).toStrictEqual(400);
        expect(getBody(result)).toStrictEqual({ message: 'Username is required' });
    });
});

// describe('Mock User works', () => {
//     test('Valid mock user', () => {
//         const result = request('POST', SERVER_URL + '/add-mock-user');

//         expect(getStatusCode(result)).toStrictEqual(201);
//         expect(getBody(result)).toStrictEqual({
//             message: expect.any(String),
//             user: expect.any(Object),
//         });
//     });
// });
