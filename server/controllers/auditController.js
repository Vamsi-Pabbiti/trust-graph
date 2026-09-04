import AuditEvent from '../models/AuditEvent.js';
import { verifyAuditChain } from '../utils/hashChain.js';

export async function getAuditEvents(req, res, next) {
  try {
    const { action, search, page = 1, limit = 30 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (search) {
      query.$or = [
        { eventId: { $regex: search, $options: 'i' } },
        { caseId: { $regex: search, $options: 'i' } },
        { actorId: { $regex: search, $options: 'i' } },
        { performedBy: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditEvent.countDocuments(query);
    const events = await AuditEvent.find(query)
      .sort({ timestamp: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      events,
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

export async function getAuditEventsForCase(req, res, next) {
  try {
    const events = await AuditEvent.find({ caseId: req.params.caseId }).sort({ timestamp: 1 });
    res.json({ success: true, caseId: req.params.caseId, count: events.length, events });
  } catch (err) {
    next(err);
  }
}

export async function verifyAuditChainHandler(req, res, next) {
  try {
    const events = await AuditEvent.find().sort({ timestamp: 1, createdAt: 1 });
    const verification = verifyAuditChain(events);

    res.json({
      success: true,
      totalEventsAudited: events.length,
      ...verification
    });
  } catch (err) {
    next(err);
  }
}
