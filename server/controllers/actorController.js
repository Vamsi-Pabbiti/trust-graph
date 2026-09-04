import Actor from '../models/Actor.js';
import Transaction from '../models/Transaction.js';
import GraphEdge from '../models/GraphEdge.js';

export async function getActors(req, res, next) {
  try {
    const { type, riskStatus, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (riskStatus) query.riskStatus = riskStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { actorId: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Actor.countDocuments(query);
    const actors = await Actor.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      actors,
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

export async function getActorById(req, res, next) {
  try {
    const actor = await Actor.findOne({ actorId: req.params.id });
    if (!actor) {
      return res.status(404).json({ success: false, message: 'Actor not found.' });
    }
    res.json({ success: true, actor });
  } catch (err) {
    next(err);
  }
}

export async function getActorNetwork(req, res, next) {
  try {
    const actorId = req.params.id;
    const edges = await GraphEdge.find({
      $or: [{ sourceNodeId: actorId }, { targetNodeId: actorId }]
    });

    const nodeIds = new Set([actorId]);
    edges.forEach(e => {
      nodeIds.add(e.sourceNodeId);
      nodeIds.add(e.targetNodeId);
    });

    res.json({
      success: true,
      actorId,
      connectedNodeIds: Array.from(nodeIds),
      edges
    });
  } catch (err) {
    next(err);
  }
}

export async function getActorHistory(req, res, next) {
  try {
    const actorId = req.params.id;
    const transactions = await Transaction.find({
      $or: [
        { customerId: actorId },
        { sellerId: actorId },
        { deliveryPartnerId: actorId }
      ]
    }).sort({ orderTime: -1 }).limit(50);

    res.json({
      success: true,
      actorId,
      transactionsCount: transactions.length,
      transactions
    });
  } catch (err) {
    next(err);
  }
}
