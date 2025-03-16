import { ParsedOrder } from './orderTypes';

/**
 * The shape of extra user data needed
 * to generate a Despatch Advice.
 */
export interface DespatchAdviceUserInputs {
    despatchId?: string;
    despatchUUID?: string;
    deliveredQuantity?: string;
    backorderQuantity?: string;
    backorderReason?: string;
    shipmentStartDate?: string;
    shipmentEndDate?: string;
    lotNumberID?: string;
    lotExpiryDate?: string;
    despatchLineNote?: string;
    // ...anything else you want
}

/**
 * Combined payload for generating Despatch Advice.
 */
export interface DespatchAdviceRequestBody {
    parsedOrder: ParsedOrder;
    userInputs?: DespatchAdviceUserInputs;
}
