import { getBody } from '../helpers';
import { requestCancel } from '../requestWrap';
import { ParsedOrder } from '../types/orderTypes';
import { requestOrderParse } from './parse-order.test';

const validXml = `
            <?xml version="1.0" encoding="UTF-8"?>
            <Order xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
                xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
                xmlns="urn:oasis:names:specification:ubl:schema:xsd:Order-2">
            <cbc:ID>AEG012345</cbc:ID>
            <cbc:SalesOrderID>CON0095678</cbc:SalesOrderID>
            <cbc:UUID>6E09886B-DC6E-439F-82D1-7CCAC7F4E3B1</cbc:UUID>
            <cbc:IssueDate>2005-06-20</cbc:IssueDate>
            </Order>
        `;

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

let parsedOrder: ParsedOrder;
beforeAll(() => {
    // Assumes requestOrderParse is export
    parsedOrder = getBody(requestOrderParse(validXml));
});

const id = validUserInputs.despatchId;
beforeEach(() => {
    requestGenerate(parsedOrder, validUserInputs);
});

describe('api/despatchAdvice/cancel', () => {
    test('Working correctly', () => {
        const response = requestCancel(id, 'Valid reason');
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
