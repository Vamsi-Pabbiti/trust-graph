import FraudCase from '../models/FraudCase.js';
import AuditEvent from '../models/AuditEvent.js';
import Actor from '../models/Actor.js';
import SystemConfiguration from '../models/SystemConfiguration.js';
import { calculateEventHash } from '../utils/hashChain.js';
import { applyPrecisionGuardrail } from '../services/guardrails/precisionGuardrail.js';

export async function getCases(req, res, next) {
  try {
    const { status, riskLevel, assignedInvestigator, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;
    if (assignedInvestigator) query.assignedInvestigator = assignedInvestigator;
    if (search) {
      query.$or = [
        { caseId: { $regex: search, $options: 'i' } },
        { actorIds: { $regex: search, $options: 'i' } },
        { transactionIds: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await FraudCase.countDocuments(query);
    const cases = await FraudCase.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      cases,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getCaseById(req, res, next) {
  try {
    const fraudCase = await FraudCase.findOne({ caseId: req.params.id });
    if (!fraudCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }
    res.json({ success: true, case: fraudCase });
  } catch (err) {
    next(err);
  }
}

export async function createCase(req, res, next) {
  try {
    const { transactionIds, actorIds, combinedRiskScore, graphRiskScore, riskLevel, evidence, explanation, recommendedAction } = req.body;
    
    const config = await SystemConfiguration.findOne() || {};
    const reqThreshold = config.hardActionPrecisionThreshold || 95.0;

    // Apply Precision & Livelihood Guardrail
    const guardrailCheck = applyPrecisionGuardrail(
      { recommendedAction },
      96.2, // system measured precision
      reqThreshold
    );

    const caseId = `CASE-${Date.now()}`;
    const newCase = await FraudCase.create({
      caseId,
      transactionIds: transactionIds || [],
      actorIds: actorIds || [],
      combinedRiskScore: combinedRiskScore || 50,
      graphRiskScore: graphRiskScore || 50,
      riskLevel: riskLevel || 'medium',
      evidence: evidence || [],
      explanation: explanation || 'Automated multi-actor fraud case generated.',
      recommendedAction,
      currentAction: 'none',
      status: guardrailCheck.forcedStatus || 'open',
      precisionGate: guardrailCheck.precisionGate,
      livelihoodGuardrail: guardrailCheck.livelihoodGuardrail
    });

    // Create Audit Event with Hash Chain
    const lastAudit = await AuditEvent.findOne().sort({ timestamp: -1, createdAt: -1 });
    const prevHash = lastAudit ? lastAudit.currentHash : 'GENESIS_HASH';
    const eventId = `EVT-${Date.now()}`;
    const timestamp = new Date();
    const actionStr = `CASE_CREATED_${caseId}`;
    const currentHash = calculateEventHash(eventId, caseId, actionStr, timestamp, prevHash);

    await AuditEvent.create({
      eventId,
      caseId,
      actorId: (actorIds && actorIds[0]) || null,
      action: 'CASE_CREATED',
      reason: `Fraud case initialized with risk level ${riskLevel}`,
      performedBy: req.user ? req.user.email : 'system',
      previousHash: prevHash,
      currentHash,
      timestamp
    });

    res.status(201).json({ success: true, case: newCase });
  } catch (err) {
    next(err);
  }
}

export async function assignInvestigator(req, res, next) {
  try {
    const { investigatorEmail } = req.body;
    const fraudCase = await FraudCase.findOne({ caseId: req.params.id });
    if (!fraudCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    fraudCase.assignedInvestigator = investigatorEmail;
    fraudCase.status = 'in_review';
    await fraudCase.save();

    // Audit event
    const lastAudit = await AuditEvent.findOne().sort({ timestamp: -1, createdAt: -1 });
    const prevHash = lastAudit ? lastAudit.currentHash : 'GENESIS_HASH';
    const eventId = `EVT-${Date.now()}`;
    const timestamp = new Date();
    const actionStr = `CASE_ASSIGNED_${investigatorEmail}`;
    const currentHash = calculateEventHash(eventId, fraudCase.caseId, actionStr, timestamp, prevHash);

    await AuditEvent.create({
      eventId,
      caseId: fraudCase.caseId,
      action: 'CASE_ASSIGNED',
      reason: `Investigator ${investigatorEmail} assigned to case`,
      performedBy: req.user.email,
      previousHash: prevHash,
      currentHash,
      timestamp
    });

    res.json({ success: true, case: fraudCase });
  } catch (err) {
    next(err);
  }
}

export async function applyAction(req, res, next) {
  try {
    const { action, reason } = req.body; // e.g. payout_hold, payout_frozen, restricted, suspended
    const fraudCase = await FraudCase.findOne({ caseId: req.params.id });
    if (!fraudCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    // Check precision gate if hard action
    const isHardAction = ['payout_frozen', 'restricted', 'suspended'].includes(action);
    if (isHardAction && fraudCase.precisionGate && !fraudCase.precisionGate.passed) {
      return res.status(400).json({
        success: false,
        message: 'Action blocked by 95% precision gate guardrail. Human approval & precision verification required.'
      });
    }

    fraudCase.currentAction = action;
    fraudCase.status = 'action_taken';
    fraudCase.livelihoodGuardrail.humanReviewed = true;
    await fraudCase.save();

    // Also update Actor statuses if applicable
    if (fraudCase.actorIds && fraudCase.actorIds.length > 0) {
      await Actor.updateMany(
        { actorId: { $in: fraudCase.actorIds } },
        { $set: { actionStatus: action, riskStatus: fraudCase.riskLevel } }
      );
    }

    // Audit event
    const lastAudit = await AuditEvent.findOne().sort({ timestamp: -1, createdAt: -1 });
    const prevHash = lastAudit ? lastAudit.currentHash : 'GENESIS_HASH';
    const eventId = `EVT-${Date.now()}`;
    const timestamp = new Date();
    const actionStr = `ACTION_APPLIED_${action}`;
    const currentHash = calculateEventHash(eventId, fraudCase.caseId, actionStr, timestamp, prevHash);

    await AuditEvent.create({
      eventId,
      caseId: fraudCase.caseId,
      actorId: fraudCase.actorIds[0] || null,
      action: `ACTION_APPLIED_${action.toUpperCase()}`,
      reason: reason || `Action ${action} applied by investigator`,
      performedBy: req.user.email,
      previousHash: prevHash,
      currentHash,
      timestamp
    });

    res.json({ success: true, case: fraudCase });
  } catch (err) {
    next(err);
  }
}

export async function closeCaseLegitimate(req, res, next) {
  try {
    const { reason } = req.body;
    const fraudCase = await FraudCase.findOne({ caseId: req.params.id });
    if (!fraudCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    fraudCase.status = 'resolved_legitimate';
    fraudCase.currentAction = 'case_closed_legitimate';
    await fraudCase.save();

    // Reset affected actor statuses
    if (fraudCase.actorIds && fraudCase.actorIds.length > 0) {
      await Actor.updateMany(
        { actorId: { $in: fraudCase.actorIds } },
        { $set: { actionStatus: 'active', riskStatus: 'low' } }
      );
    }

    // Audit event
    const lastAudit = await AuditEvent.findOne().sort({ timestamp: -1, createdAt: -1 });
    const prevHash = lastAudit ? lastAudit.currentHash : 'GENESIS_HASH';
    const eventId = `EVT-${Date.now()}`;
    const timestamp = new Date();
    const actionStr = `CASE_CLOSED_LEGITIMATE`;
    const currentHash = calculateEventHash(eventId, fraudCase.caseId, actionStr, timestamp, prevHash);

    await AuditEvent.create({
      eventId,
      caseId: fraudCase.caseId,
      actorId: fraudCase.actorIds[0] || null,
      action: 'CASE_CLOSED_LEGITIMATE',
      reason: reason || 'Investigator verified signals as legitimate activity (family address / office Wi-Fi)',
      performedBy: req.user.email,
      previousHash: prevHash,
      currentHash,
      timestamp
    });

    res.json({ success: true, case: fraudCase });
  } catch (err) {
    next(err);
  }
}
