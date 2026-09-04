/**
 * Guardrail and Self-Check Agent
 * Evaluates automated recommendations against precision gates (95% threshold) and livelihood guardrails.
 */
export function applyPrecisionGuardrail(riskAssessment, currentSystemPrecision = 96.2, requiredThreshold = 95.0) {
  const isHardAction = ['payout_freeze', 'account_restriction', 'suspension'].includes(riskAssessment.recommendedAction);
  
  const precisionGate = {
    measuredPrecision: currentSystemPrecision,
    requiredPrecision: requiredThreshold,
    passed: true,
    automatedHardActionBlocked: false,
    blockingReason: ''
  };

  let finalAction = riskAssessment.recommendedAction;
  let forcedStatus = 'open';

  if (isHardAction) {
    if (currentSystemPrecision < requiredThreshold) {
      precisionGate.passed = false;
      precisionGate.automatedHardActionBlocked = true;
      precisionGate.blockingReason = `Automated ${riskAssessment.recommendedAction} blocked because measured system precision (${currentSystemPrecision}%) is below the required 95.0% guardrail threshold. Escalating to human investigator review.`;
      
      // Downgrade automated action to human investigator routing
      finalAction = 'investigator_route';
      forcedStatus = 'in_review';
    }
  }

  const livelihoodGuardrail = {
    isTemporary: true,
    expiryHours: 72,
    appealEnabled: true,
    humanReviewed: false
  };

  return {
    finalAction,
    forcedStatus,
    precisionGate,
    livelihoodGuardrail
  };
}
