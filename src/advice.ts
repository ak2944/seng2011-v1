import { DespatchAdviceModel } from '../db-schemas';
import { ADVICE_ID_INVALID } from './errors';

/**
 * Cancels despatch advice given an ID and a reason
 * @param { string } adviceId - the ID of the despatch advice
 * @param reason - The reason for cancellation
 * @returns { message: string } - A message stating the status of the cancellation
 */
export async function cancelAdvice(despatchId: string, reason: string) {
    const advice = await DespatchAdviceModel.findOne({ despatchId });
    if (!advice) {
        throw ADVICE_ID_INVALID;
    }

    advice.cancelled = true;
    advice.cancellationReason = reason;

    await advice.save();

    return { message: 'Despatch Advice cancelled successfully' };
}
