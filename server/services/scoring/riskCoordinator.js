/**
 * Risk Coordinator - Merges transaction risk (65%) and graph risk (35%), assigns risk levels & recommended interventions
 */
export function coordinateRisk(transactionScoreObj, graphScoreObj, customConfig = {}) {
  const txWeight = customConfig.transactionWeight || 0.65;
  const graphWeight = customConfig.graphWeight || 0.35;

  const normTx = transactionScoreObj.normalizedTransactionScore || 0;
  const normGraph = graphScoreObj.normalizedGraphScore || 0;

  const rawCombined = (txWeight * normTx) + (graphWeight * normGraph);
  const combinedRiskScore = Math.min(100, Math.max(0, Math.round(rawCombined * 10) / 10));

  // Determine Risk Level
  let riskLevel = 'low';
  if (combinedRiskScore >= 75) {
    riskLevel = 'critical';
  } else if (combinedRiskScore >= 50) {
    riskLevel = 'high';
  } else if (combinedRiskScore >= 25) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Determine Graduated Recommended Action
  let recommendedAction = 'monitor';
  if (riskLevel === 'critical') {
    // If graph density or refund velocity is high, suggest payout freeze or suspension
    recommendedAction = normGraph > 60 ? 'payout_freeze' : 'account_restriction';
  } else if (riskLevel === 'high') {
    recommendedAction = 'temporary_payout_hold';
  } else if (riskLevel === 'medium') {
    recommendedAction = 'step_up_verification';
  } else {
    recommendedAction = 'monitor';
  }

  // Deduplicate and combine all evidence signals
  const allEvidence = [];
  
  (transactionScoreObj.triggeredSignals || []).forEach(sig => {
    allEvidence.push({
      signal: sig.code,
      description: sig.evidence,
      weight: sig.weight,
      category: 'transaction'
    });
  });

  (graphScoreObj.sharedSignals || []).forEach(sig => {
    allEvidence.push({
      signal: sig.type,
      description: sig.description,
      weight: sig.weight,
      category: 'graph'
    });
  });

  return {
    combinedRiskScore,
    transactionRiskScore: normTx,
    graphRiskScore: normGraph,
    riskLevel,
    recommendedAction,
    evidence: allEvidence
  };
}
