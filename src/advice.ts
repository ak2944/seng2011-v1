import { ADVICE_ID_INVALID } from './errors';

const DespatchAdvice = require('../DespatchAdvice');

/**
 * Cancels despatch advice given an ID and a reason
 * @param { string } adviceId - the ID of the despatch advice
 * @param reason - The reason for cancellation
 * @returns { message: string } - A message stating the status of the cancellation
 */
export async function cancelAdvice(despatchUUID: string, reason: string) {
    const advice = await DespatchAdvice.findOne({ despatchUUID });
    if (!advice) {
        throw ADVICE_ID_INVALID;
    }

    advice.status = 'Cancelled';
    advice.cancellationReason = reason;

    await advice.save();

    return { message: 'Despatch Advice cancelled successfully' };
}
