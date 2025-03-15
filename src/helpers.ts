import { Response } from 'sync-request-curl';

export function getBody(res: Response) {
    return JSON.parse(res.body.toString());
}
  
export function getStatusCode(res: Response) {
    return res.statusCode;
}
  