import Appeal from '../models/Appeal.js';
import FraudCase from '../models/FraudCase.js';
import Actor from '../models/Actor.js';
import AuditEvent from '../models/AuditEvent.js';
import SystemConfiguration from '../models/SystemConfiguration.js';
import { calculateEventHash } from '../utils/hashChain.js';

export async function getAppeals(req, res, next) {
  try {
    const { status, priority, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { appealId: { $regex: search, $options: 'i' } },
        { caseId: { $regex: search, $options: 'i' } },
        { actorId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Appeal.countDocuments(query);
    const appeals = await Appeal.find(query)
      .sort({ dueAt: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      appeals,
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

export async function getAppealById(req, res, next) {
  try {
    const appeal = await Appeal.findOne({ appealId: req.params.id });
    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found.' });
    }
    res.json({ success: true, appeal });
  } catch (err) {
    next(err);
  }
}

export async function submitAppeal(req, res, next) {
  try {
    const { caseId, actorId, reason, supportingEvidence } = req.body;
    if (!caseId || !actorId || !reason) {
      return res.status(400).json({ success: false, message: 'caseId, actorId, and reason are required.' });
    }

    const config = await SystemConfiguration.findOne() || {};
    const slaHours = config.appealSlaHours || 48;
    const dueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const appealId = `APL-${Date.now()}`;
    const appeal = await Appeal.create({
      appealId,
      caseId,
      actorId,
      reason,
      supportingEvidence: supportingEvidence || [],
      status: 'submitted',
      priority: 'high',
      dueAt
    });

    // Update case status to appealed
    await FraudCase.updateOne({ caseId }, { status: 'appealed' });

    // Audit Event
    const lastAudit = await AuditEvent.findOne().sort({ timestamp: -1, createdAt: -1 });
    const prevHash = lastAudit ? lastAudit.currentHash : 'GENESIS_HASH';
    const eventId = `EVT-${Date.now()}`;
    const timestamp = new Date();
    const actionStr = `APPEAL_SUBMITTED_${appealId}`;
    const currentHash = calculateEventHash(eventId, caseId, actionStr, timestamp, prevHash);

    await AuditEvent.create({
      eventId,
      caseId,
      actorId,
      action: 'APPEAL_SUBMITTED',
      reason: `Actor ${actorId} submitted appeal: ${reason.substring(0, 100)}`,
      performedBy: req.user ? req.user.email : actorId,
      previousHash: prevHash,
      currentHash,
      timestamp
    });

    res.status(201).json({ success: true, appeal });
  } catch (err) {
    next(err);
  }
}

export async function updateAppealStatus(req, res, next) {
  try {
    const { status, reviewerNote } = req.body;
    const appeal = await Appeal.findOne({ appealId: req.params.id });
    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found.' });
    }

    appeal.status = status;
    appeal.reviewedBy = req.user.email;
    if (reviewerNote) appeal.reviewerNote = reviewerNote;
    appeal.reviewedAt = new Date();
    await appeal.save();

    res.json({ success: true, appeal });
  } catch (err) {
    next(err);
  }
}

export async function resolveAppeal(req, res, next) {
  try {
    const { decision, reviewerNote } = req.body; // decision: 'accept' or 'reject'
    const appeal = await Appeal.findOne({ appealId: req.params.id });
    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found.' });
    }

    const isAccept = decision === 'accept';
    appeal.status = isAccept ? 'accepted' : 'rejected';
    appeal.reviewedBy = req.user.email;
    appeal.reviewerNote = reviewerNote || `Appeal ${isAccept ? 'accepted - actor status restored' : 'rejected - action maintained'}`;
    appeal.reviewedAt = new Date();
    await appeal.save();

    // Update case & actor
    if (isAccept) {
      await FraudCase.updateOne(
        { caseId: appeal.caseId }, 
        { status: 'resolved_legitimate', currentAction: 'case_closed_legitimate' }
      );
      await Actor.updateOne(
        { actorId: appeal.actorId }, 
        { actionStatus: 'active', riskStatus: 'low' }
      );
    } else {
      await FraudCase.updateOne(
        { caseId: appeal.caseId }, 
        { status: 'resolved_fraud_confirmed' }
      );
    }

    // Audit Event
    const lastAudit = await AuditEvent.findOne().sort({ timestamp: -1, createdAt: -1 });
    const prevHash = lastAudit ? lastAudit.currentHash : 'GENESIS_HASH';
    const eventId = `EVT-${Date.now()}`;
    const timestamp = new Date();
    const actionStr = `APPEAL_RESOLVED_${decision.toUpperCase()}`;
    const currentHash = calculateEventHash(eventId, appeal.caseId, actionStr, timestamp, prevHash);

    await AuditEvent.create({
      eventId,
      caseId: appeal.caseId,
      actorId: appeal.actorId,
      action: `APPEAL_RESOLVED_${decision.toUpperCase()}`,
      reason: appeal.reviewerNote,
      performedBy: req.user.email,
      previousHash: prevHash,
      currentHash,
      timestamp
    });

    res.json({ success: true, appeal });
  } catch (err) {
    next(err);
  }
}
