import { requestCancel } from '../requestWrap';

let id: string;
beforeEach(() => {
    id = 'hi'; // TODO change to generate id properly
});

describe('api/despatchAdvice/cancel', () => {
    test('Working correctly', () => {
        const response = requestCancel(id, 'Valid reason'); // TODO define valid reason
        expect(response.statusCode).toStrictEqual(200);
        expect(response.body).toStrictEqual({ message: expect.any(String) });
    });

    test('Invalid reason', () => {
        const response = requestCancel(id, 'No');
        expect(response.statusCode).toStrictEqual(400);
        expect(response.body).toStrictEqual({ error: expect.any(String) });
    });

    test('Advice not found', () => {
        const response = requestCancel(id + ' ', 'Valid reason');
        expect(response.statusCode).toStrictEqual(404);
        expect(response.body).toStrictEqual({ error: expect.any(String) });
    });
});
