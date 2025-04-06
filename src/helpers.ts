import { Response } from 'sync-request-curl';
import { DespatchAdviceUserInputs } from './types/despatchTypes';

export function getBody(res: Response) {
    return JSON.parse(res.body.toString());
}

export function getStatusCode(res: Response) {
    return res.statusCode;
}

export function getTextBody(res: Response): string {
    return res.body.toString();
}

/**
 * Checks if all keys in userInputs are valid (exist in DespatchAdviceUserInputs).
 * Throws a 500 error if any invalid key is found.
 */
export function validateDespatchAdviceUserInputs(userInputs?: Record<string, any>): boolean {
    if (!userInputs) {
        return true;
    }

    const validKeys = new Set<keyof DespatchAdviceUserInputs>([
        'despatchId',
        'despatchUUID',
        'deliveredQuantity',
        'backorderQuantity',
        'backorderReason',
        'shipmentStartDate',
        'shipmentEndDate',
        'lotNumberID',
        'lotExpiryDate',
        'despatchLineNote'
    ]);

    for (const key of Object.keys(userInputs)) {
        if (!validKeys.has(key as keyof DespatchAdviceUserInputs)) {
            return false;
        }
    }

    return true;
}

export function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return String(error);
}
