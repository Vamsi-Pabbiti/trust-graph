import Transaction from '../models/Transaction.js';
import GraphEdge from '../models/GraphEdge.js';
import SystemConfiguration from '../models/SystemConfiguration.js';
import { scoreTransaction } from '../services/scoring/transactionScorer.js';
import { scoreGraphTopology } from '../services/graph/graphAnalyzer.js';
import { coordinateRisk } from '../services/scoring/riskCoordinator.js';

export async function getTransactions(req, res, next) {
  try {
    const { riskLevel, historicalLabel, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (riskLevel) query.riskLevel = riskLevel;
    if (historicalLabel) query.historicalLabel = historicalLabel;
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { sellerId: { $regex: search, $options: 'i' } },
        { deliveryPartnerId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ orderTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      transactions,
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

export async function getTransactionById(req, res, next) {
  try {
    const transaction = await Transaction.findOne({ transactionId: req.params.id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    res.json({ success: true, transaction });
  } catch (err) {
    next(err);
  }
}

export async function scoreSingleTransaction(req, res, next) {
  try {
    const txData = req.body;
    const config = await SystemConfiguration.findOne() || {};
    const weights = config.scoringWeights || {};

    // 1. Transaction Risk Agent
    const txScoreObj = scoreTransaction(txData, weights);

    // 2. Query Graph Topology for shared links (device, IP, address)
    const relatedEdges = await GraphEdge.find({
      $or: [
        { sourceNodeId: txData.customerId },
        { sourceNodeId: txData.sellerId },
        { sourceNodeId: txData.deliveryPartnerId },
        { targetNodeId: txData.deviceId },
        { targetNodeId: txData.ipAddress },
        { targetNodeId: txData.addressHash }
      ]
    });

    // 3. Graph Anomaly Agent
    const graphScoreObj = scoreGraphTopology(relatedEdges, [txData.customerId, txData.sellerId, txData.deliveryPartnerId]);

    // 4. Risk Coordinator
    const riskCoord = coordinateRisk(txScoreObj, graphScoreObj);

    res.json({
      success: true,
      transactionId: txData.transactionId || `TX-${Date.now()}`,
      scoringResult: {
        transactionRiskScore: riskCoord.transactionRiskScore,
        graphRiskScore: riskCoord.graphRiskScore,
        combinedRiskScore: riskCoord.combinedRiskScore,
        riskLevel: riskCoord.riskLevel,
        recommendedAction: riskCoord.recommendedAction,
        triggeredSignals: txScoreObj.triggeredSignals,
        graphSignals: graphScoreObj.sharedSignals,
        evidence: riskCoord.evidence
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createTransaction(req, res, next) {
  try {
    const txData = req.body;
    const config = await SystemConfiguration.findOne() || {};
    
    // Auto-calculate risk
    const txScoreObj = scoreTransaction(txData, config.scoringWeights);
    const relatedEdges = await GraphEdge.find({
      $or: [
        { sourceNodeId: txData.customerId },
        { sourceNodeId: txData.sellerId },
        { sourceNodeId: txData.deliveryPartnerId },
        { targetNodeId: txData.deviceId },
        { targetNodeId: txData.ipAddress },
        { targetNodeId: txData.addressHash }
      ]
    });
    const graphScoreObj = scoreGraphTopology(relatedEdges);
    const riskCoord = coordinateRisk(txScoreObj, graphScoreObj);

    const transaction = await Transaction.create({
      ...txData,
      transactionRiskScore: riskCoord.transactionRiskScore,
      graphRiskScore: riskCoord.graphRiskScore,
      combinedRiskScore: riskCoord.combinedRiskScore,
      riskLevel: riskCoord.riskLevel,
      triggeredSignals: txScoreObj.triggeredSignals
    });

    res.status(201).json({ success: true, transaction });
  } catch (err) {
    next(err);
  }
}

export async function bulkScoreTransactions(req, res, next) {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ success: false, message: 'Expected array of transactions.' });
    }

    const results = transactions.map(tx => {
      const txScoreObj = scoreTransaction(tx);
      const graphScoreObj = scoreGraphTopology([]);
      const riskCoord = coordinateRisk(txScoreObj, graphScoreObj);
      return {
        transactionId: tx.transactionId,
        combinedRiskScore: riskCoord.combinedRiskScore,
        riskLevel: riskCoord.riskLevel
      };
    });

    res.json({ success: true, processedCount: results.length, results });
  } catch (err) {
    next(err);
  }
}
