import { getBody } from '../helpers';
import { requestCancel } from '../requestWrap';
import { requestGenerateDespatchAdvice, validXml } from './despatch-generate.test';
import { requestOrderParse } from './parse-order.test';
import { v4 as uuidv4 } from 'uuid';

const validUserInputs = {
    despatchId: '123456',
    deliveredQuantity: '5',
    backorderQuantity: '20',
    backorderReason: 'Overstocked',
    shipmentStartDate: '2005-06-21',
    shipmentEndDate: '2005-06-28',
    lotNumberID: '10',
    lotExpiryDate: '2006-10-10',
    despatchLineNote: 'none'
};

let testXml: string;
beforeEach(() => {
    const randomUUID = uuidv4();
    testXml = validXml.replace('6E09886B-DC6E-439F-82D1-7CCAC7F4E3B1', randomUUID);
});

describe('api/despatchAdvice/cancel', () => {
    test('Working correctly', () => {
        const { parsedOrder } = getBody(requestOrderParse(testXml));
        requestGenerateDespatchAdvice(parsedOrder, validUserInputs);
        const response = requestCancel(parsedOrder.orderId, 'Valid reason');
        expect(response.statusCode).toStrictEqual(200);
        expect(response.body).toStrictEqual({ message: expect.any(String) });
    });

    test('Advice not found', () => {
        const { parsedOrder } = getBody(requestOrderParse(testXml));
        requestGenerateDespatchAdvice(parsedOrder, validUserInputs);
        const response = requestCancel('This is not the correct ID', 'Valid reason');
        expect(response.statusCode).toStrictEqual(400);
        expect(response.body).toStrictEqual({ error: expect.any(String) });
    });
});
