import request from 'sync-request-curl';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

export function requestCancel(id: string, reason: string) {
    const input = {
        despatchAdviceId: id,
        cancellationReason: reason
    };
    const req = request('DELETE', SERVER_URL + '/api/despatchAdvice/cancel', { json: input, timeout: TIMEOUT_MS });
    const body = JSON.parse(req.body as string);
    return { statusCode: req.statusCode, body: body };
}
