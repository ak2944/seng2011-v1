import { requestCancel } from '../requestWrap';

let id: string;
beforeEach(() => {
    id = 'hi'; // TODO change to generate id properly
});

describe('api/despatchAdvice/cancel', () => {
    test('Working correctly', () => {
        const response = requestCancel(id, 'Felt like it');
        expect(response.statusCode).toStrictEqual(200);
        expect(response.body).toStrictEqual({ message: expect.any(String) });
    });
});
