/**
 * Fairness Agent - Evaluates intervention rates across cohorts and computes parity gaps
 */
export function calculateFairnessMetrics(actors = [], cases = []) {
  // Group actors by business size
  const cohorts = {
    small_sellers: { name: 'Small / Micro Sellers', total: 0, actions: 0, falsePositives: 0, appealsAccepted: 0 },
    large_sellers: { name: 'Large / Enterprise Sellers', total: 0, actions: 0, falsePositives: 0, appealsAccepted: 0 },
    new_sellers: { name: 'New Sellers (< 6 Mos)', total: 0, actions: 0, falsePositives: 0, appealsAccepted: 0 },
    established_sellers: { name: 'Established Sellers (> 6 Mos)', total: 0, actions: 0, falsePositives: 0, appealsAccepted: 0 },
    delivery_partners: { name: 'Delivery Partners', total: 0, actions: 0, falsePositives: 0, appealsAccepted: 0 }
  };

  // Map cases by affected actor IDs
  const actorCaseMap = {};
  cases.forEach(c => {
    (c.actorIds || []).forEach(aid => {
      if (!actorCaseMap[aid]) actorCaseMap[aid] = [];
      actorCaseMap[aid].push(c);
    });
  });

  actors.forEach(actor => {
    const actorCases = actorCaseMap[actor.actorId] || [];
    const hasAction = actor.actionStatus !== 'active' || actorCases.some(c => c.currentAction !== 'none');
    const isFalsePositive = actorCases.some(c => c.status === 'resolved_legitimate');

    const updateCohort = (key) => {
      cohorts[key].total += 1;
      if (hasAction) cohorts[key].actions += 1;
      if (isFalsePositive) cohorts[key].falsePositives += 1;
    };

    if (actor.type === 'seller') {
      if (['micro', 'small'].includes(actor.businessSize)) {
        updateCohort('small_sellers');
      } else {
        updateCohort('large_sellers');
      }

      if (actor.tenureMonths < 6) {
        updateCohort('new_sellers');
      } else {
        updateCohort('established_sellers');
      }
    } else if (actor.type === 'delivery_partner') {
      updateCohort('delivery_partners');
    }
  });

  // Calculate Action Rates & Parity Gaps
  const cohortResults = Object.keys(cohorts).map(key => {
    const c = cohorts[key];
    const actionRate = c.total > 0 ? Math.round((c.actions / c.total) * 1000) / 10 : 0;
    const fpRate = c.actions > 0 ? Math.round((c.falsePositives / c.actions) * 1000) / 10 : 0;
    return {
      key,
      name: c.name,
      totalActors: c.total,
      actionsCount: c.actions,
      actionRate,
      falsePositiveRate: fpRate
    };
  });

  // Calculate Parity Gap between Small and Large Sellers
  const smallRate = cohortResults.find(c => c.key === 'small_sellers')?.actionRate || 0;
  const largeRate = cohortResults.find(c => c.key === 'large_sellers')?.actionRate || 0;
  const parityGap = Math.round(Math.abs(smallRate - largeRate) * 10) / 10;

  const parityWarning = parityGap > 15.0 ? {
    flagged: true,
    message: `Disproportionate Impact Warning: Parity gap between Small Sellers (${smallRate}%) and Large Sellers (${largeRate}%) is ${parityGap}%, exceeding the 15% threshold.`
  } : {
    flagged: false,
    message: `Parity gap between cohorts is ${parityGap}%, within acceptable equity boundaries.`
  };

  return {
    cohorts: cohortResults,
    parityGap,
    parityWarning,
    disclaimer: 'Fairness metrics are calculated dynamically over active cohorts. Demographic parity does not imply equal risk distribution, but highlights areas requiring investigator bias review.'
  };
}
