/**
 * Evaluates individual transaction risk based on configurable weights and deterministic rules
 */
export function scoreTransaction(txData, weights = {}) {
  const defaultWeights = {
    refundCount30Days: 18,
    chargebackCount: 18,
    sellerRatingBurst: 17,
    gpsDeviationKm: 20,
    proofOfDeliveryMismatch: 22,
    nightOrder: 6,
    highValue: 8,
    youngAccount: 8
  };

  const w = { ...defaultWeights, ...weights };
  const triggeredSignals = [];
  let rawScore = 0;

  // 1. Refund velocity
  if (txData.refundCount30Days >= 3) {
    rawScore += w.refundCount30Days;
    triggeredSignals.push({
      code: 'REFUND_VELOCITY_HIGH',
      name: 'High Refund Velocity',
      weight: w.refundCount30Days,
      evidence: `Customer has requested ${txData.refundCount30Days} refunds in the last 30 days (Threshold: >= 3).`
    });
  }

  // 2. Chargeback count
  if (txData.chargebackCount >= 2) {
    rawScore += w.chargebackCount;
    triggeredSignals.push({
      code: 'CHARGEBACK_REPEAT',
      name: 'Repeated Chargebacks',
      weight: w.chargebackCount,
      evidence: `${txData.chargebackCount} chargebacks recorded on file.`
    });
  }

  // 3. Seller rating burst
  if (txData.sellerRatingBurst >= 8) {
    rawScore += w.sellerRatingBurst;
    triggeredSignals.push({
      code: 'RATING_BURST_ABNORMAL',
      name: 'Abnormal Rating Burst',
      weight: w.sellerRatingBurst,
      evidence: `Seller received a burst of ${txData.sellerRatingBurst} 5-star ratings within a 2-hour window.`
    });
  }

  // 4. GPS deviation
  if (txData.gpsDeviationKm >= 5.0) {
    rawScore += w.gpsDeviationKm;
    triggeredSignals.push({
      code: 'GPS_DEVIATION_HIGH',
      name: 'Significant GPS Mismatch',
      weight: w.gpsDeviationKm,
      evidence: `Delivery partner scanned delivery ${txData.gpsDeviationKm} km away from registered order destination.`
    });
  }

  // 5. Proof of Delivery Mismatch
  if (txData.proofOfDeliveryMismatch) {
    rawScore += w.proofOfDeliveryMismatch;
    triggeredSignals.push({
      code: 'POD_MISMATCH',
      name: 'Proof of Delivery Mismatch',
      weight: w.proofOfDeliveryMismatch,
      evidence: 'Photo or signature provided for delivery does not match customer address verification.'
    });
  }

  // 6. Night order (Midnight - 4 AM)
  const orderHour = txData.orderTime ? new Date(txData.orderTime).getHours() : new Date().getHours();
  if (orderHour >= 0 && orderHour < 4) {
    rawScore += w.nightOrder;
    triggeredSignals.push({
      code: 'NIGHT_ORDER',
      name: 'Late Night Order Placement',
      weight: w.nightOrder,
      evidence: `Order placed during off-peak hours at ${orderHour}:00 IST.`
    });
  }

  // 7. High value order (> ₹20,000)
  if (txData.amount > 20000) {
    rawScore += w.highValue;
    triggeredSignals.push({
      code: 'HIGH_VALUE_ORDER',
      name: 'High Transaction Value',
      weight: w.highValue,
      evidence: `Transaction amount ₹${txData.amount.toLocaleString('en-IN')} exceeds standard high-value threshold (₹20,000).`
    });
  }

  // 8. Young account (< 7 days)
  if (txData.accountAgeDays < 7) {
    rawScore += w.youngAccount;
    triggeredSignals.push({
      code: 'YOUNG_ACCOUNT',
      name: 'New Account Activity',
      weight: w.youngAccount,
      evidence: `Account age is only ${txData.accountAgeDays} days old.`
    });
  }

  // Clamp raw transaction score to 0-100
  const normalizedTransactionScore = Math.min(100, Math.max(0, rawScore));

  return {
    rawScore,
    normalizedTransactionScore,
    triggeredSignals
  };
}
