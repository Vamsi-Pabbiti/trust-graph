/**
 * Explanation Engine - Generates human-readable, explainable fraud summaries
 */
export function generateCaseExplanation(caseData, txData, graphData) {
  const riskLevel = (caseData.riskLevel || 'medium').toUpperCase();
  const score = caseData.combinedRiskScore || 0;
  
  const signals = caseData.evidence || [];
  const signalBullets = signals.map(s => `• ${s.description} (Contribution: +${s.weight} pts)`).join('\n');

  let explanation = `[${riskLevel} RISK - SCORE ${score}/100]\n\n`;
  explanation += `This case was flagged based on multi-actor fraud analysis combining individual transaction signals (65% weight) and network graph topology (35% weight).\n\n`;
  
  if (signals.length > 0) {
    explanation += `Key Triggered Evidence Signals:\n${signalBullets}\n\n`;
  } else {
    explanation += `No critical individual signals triggered; score derived from subtle multi-edge network density.\n\n`;
  }

  if (caseData.recommendedAction === 'payout_freeze' || caseData.recommendedAction === 'suspension') {
    explanation += `Recommended Intervention: ${caseData.recommendedAction.toUpperCase()}. Income-affecting actions are subject to 95% precision verification and 72-hour temporary limits with active appeal rights.`;
  } else if (caseData.recommendedAction === 'step_up_verification') {
    explanation += `Recommended Intervention: Step-up Identity & Delivery Verification before order processing.`;
  } else {
    explanation += `Recommended Intervention: Route case to human investigator workbench for verification.`;
  }

  return explanation;
}
