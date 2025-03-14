import { ADVICE_ID_INVALID, INVALID_REASON } from './errors';

const DespatchAdvice = require('../DespatchAdvice');

/**
 * Cancels despatch advice given an ID and a reason
 * @param { string } adviceId - the ID of the despatch advice
 * @param reason - The reason for cancellation
 * @returns { message: string } - A message stating the status of the cancellation
 */
export async function cancelAdvice(adviceId: string, reason: string) {
    if (!isValidReason(reason)) throw INVALID_REASON;

    const advice = await DespatchAdvice.findOne({ adviceId });
    if (!advice) {
        throw ADVICE_ID_INVALID;
    }

    advice.status = 'Cancelled';
    advice.cancellationReason = reason;

    await advice.save();

    return { message: 'Despatch Advice cancelled successfully' };
}

function isValidReason(reason: string) {
    return (reason === 'Valid reason');
}
