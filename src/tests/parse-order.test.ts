import request from 'sync-request-curl';
import { url, port } from '../config.json';
import { getBody, getStatusCode } from '../helpers';
const SERVER_URL = `${url}:${port}`;

export function requestOrderParse(xmlString: string) {
    const response = request('POST', SERVER_URL + '/api/v1/order/parse', {
        headers: {
            'Content-Type': 'application/xml',
        },
        body: xmlString,
    });
    return response;
}

describe('POST /api/v1/order/parse', () => {
    test('Valid UBL Order => 200 and parsedOrder JSON', () => {
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

        const result = requestOrderParse(validXml);

        expect(getStatusCode(result)).toStrictEqual(200);
        expect(getBody(result)).toMatchObject({
            parsedOrder: {
                orderId: 'AEG012345',
                salesOrderId: 'CON0095678',
                orderUUID: '6E09886B-DC6E-439F-82D1-7CCAC7F4E3B1',
                orderIssueDate: '2005-06-20',
            }
        });
    });

    test('No XML => 400', () => {
        const result = requestOrderParse('');
        expect(getStatusCode(result)).toStrictEqual(400);
        expect(getBody(result)).toStrictEqual({ error: 'No XML found in request body.' });
    });

    test('Invalid XML => 500 parse error', () => {
        const invalidXml = '<Order <BadlyFormed >> hello';

        const result = requestOrderParse(invalidXml);
        expect(getStatusCode(result)).toStrictEqual(500);
        // We just check there's an error property:
        expect(getBody(result)).toEqual({
            error: expect.any(String),
        });
    });

    test('Not a valid UBL Order => 400', () => {
        const notOrderXml = `
            <?xml version="1.0"?>
            <Foo>
            <cbc:ID>123</cbc:ID>
            </Foo>
        `;

        const result = requestOrderParse(notOrderXml);
        expect(getStatusCode(result)).toStrictEqual(500);
        expect(getBody(result)).toStrictEqual({
            error: 'Error: XML is not a valid UBL Order.'
        });
    });
});
