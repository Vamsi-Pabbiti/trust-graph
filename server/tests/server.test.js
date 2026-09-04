import { describe, it, expect } from 'vitest';
import { scoreTransaction } from '../services/scoring/transactionScorer.js';
import { scoreGraphTopology } from '../services/graph/graphAnalyzer.js';
import { coordinateRisk } from '../services/scoring/riskCoordinator.js';
import { applyPrecisionGuardrail } from '../services/guardrails/precisionGuardrail.js';
import { calculateEventHash, verifyAuditChain } from '../utils/hashChain.js';
import { calculateFairnessMetrics } from '../services/agents/fairnessAgent.js';

describe('TRUST GRAPH Backend Core Logic Tests', () => {
  
  it('1. scoreTransaction should correctly calculate risk weights and signals', () => {
    const txData = {
      refundCount30Days: 4, // +18
      chargebackCount: 2,   // +18
      sellerRatingBurst: 0,
      gpsDeviationKm: 6.2,  // +20
      proofOfDeliveryMismatch: true, // +22
      amount: 25000,        // +8
      accountAgeDays: 5     // +8
    };

    const result = scoreTransaction(txData);
    expect(result.normalizedTransactionScore).toBe(94); // 18+18+20+22+8+8 = 94
    expect(result.triggeredSignals.length).toBe(6);
  });

  it('2. scoreGraphTopology should detect shared devices and calculate graph score', () => {
    const edges = [
      { sourceNodeId: 'CUST-001', targetNodeId: 'DEV-001', edgeType: 'used_device', strength: 4 },
      { sourceNodeId: 'CUST-002', targetNodeId: 'DEV-001', edgeType: 'used_device', strength: 4 },
      { sourceNodeId: 'CUST-001', targetNodeId: 'SELL-001', edgeType: 'shared_suspicious_signal', strength: 2, evidence: 'Collusion' }
    ];

    const graphResult = scoreGraphTopology(edges);
    expect(graphResult.normalizedGraphScore).toBeGreaterThan(30);
    expect(graphResult.sharedSignals.length).toBeGreaterThan(0);
  });

  it('3. coordinateRisk should combine 65% tx risk + 35% graph risk and clamp to 0-100', () => {
    const txObj = { normalizedTransactionScore: 100, triggeredSignals: [] };
    const graphObj = { normalizedGraphScore: 80, sharedSignals: [] };

    const coord = coordinateRisk(txObj, graphObj);
    expect(coord.combinedRiskScore).toBe(93); // 0.65*100 + 0.35*80 = 93
    expect(coord.riskLevel).toBe('critical');
    expect(coord.recommendedAction).toBe('payout_freeze');
  });

  it('4. applyPrecisionGuardrail should block automated hard action when measured precision < 95%', () => {
    const riskAssessment = { recommendedAction: 'suspension' };
    
    // Test precision < 95%
    const guardrailBlocked = applyPrecisionGuardrail(riskAssessment, 92.5, 95.0);
    expect(guardrailBlocked.precisionGate.passed).toBe(false);
    expect(guardrailBlocked.precisionGate.automatedHardActionBlocked).toBe(true);
    expect(guardrailBlocked.finalAction).toBe('investigator_route');

    // Test precision >= 95%
    const guardrailPassed = applyPrecisionGuardrail(riskAssessment, 96.5, 95.0);
    expect(guardrailPassed.precisionGate.passed).toBe(true);
    expect(guardrailPassed.precisionGate.automatedHardActionBlocked).toBe(false);
    expect(guardrailPassed.finalAction).toBe('suspension');
  });

  it('5. verifyAuditChain should validate unbroken SHA-256 hash chains and catch tampering', () => {
    const timestamp = new Date();
    const hash1 = calculateEventHash('EVT-001', 'CASE-001', 'CASE_CREATED', timestamp, 'GENESIS_HASH');
    const hash2 = calculateEventHash('EVT-002', 'CASE-001', 'ACTION_APPLIED', timestamp, hash1);

    const validChain = [
      { eventId: 'EVT-001', caseId: 'CASE-001', action: 'CASE_CREATED', timestamp, previousHash: 'GENESIS_HASH', currentHash: hash1 },
      { eventId: 'EVT-002', caseId: 'CASE-001', action: 'ACTION_APPLIED', timestamp, previousHash: hash1, currentHash: hash2 }
    ];

    const resultValid = verifyAuditChain(validChain);
    expect(resultValid.isValid).toBe(true);

    // Tamper test
    const tamperedChain = [...validChain];
    tamperedChain[1] = { ...tamperedChain[1], action: 'TAMPERED_ACTION' };

    const resultTampered = verifyAuditChain(tamperedChain);
    expect(resultTampered.isValid).toBe(false);
  });

  it('6. calculateFairnessMetrics should calculate cohort action rates and parity gaps', () => {
    const actors = [
      { actorId: 'SELL-001', type: 'seller', businessSize: 'small', tenureMonths: 3, actionStatus: 'payout_hold' },
      { actorId: 'SELL-002', type: 'seller', businessSize: 'enterprise', tenureMonths: 24, actionStatus: 'active' }
    ];
    const cases = [];

    const fairness = calculateFairnessMetrics(actors, cases);
    expect(fairness.cohorts.length).toBeGreaterThan(0);
    expect(fairness.parityGap).toBeGreaterThanOrEqual(0);
  });

});
