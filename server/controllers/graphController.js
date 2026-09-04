import GraphEdge from '../models/GraphEdge.js';
import Actor from '../models/Actor.js';
import Transaction from '../models/Transaction.js';
import FraudCase from '../models/FraudCase.js';

export async function getFullGraph(req, res, next) {
  try {
    const { nodeType, riskLevel, limit = 150 } = req.query;
    
    // Fetch edges
    const edges = await GraphEdge.find().limit(parseInt(limit));
    
    // Collect all distinct node IDs
    const nodeIds = new Set();
    edges.forEach(e => {
      nodeIds.add(e.sourceNodeId);
      nodeIds.add(e.targetNodeId);
    });

    const nodeIdArray = Array.from(nodeIds);

    // Fetch corresponding actors
    const actors = await Actor.find({ actorId: { $in: nodeIdArray } });
    const actorMap = {};
    actors.forEach(a => { actorMap[a.actorId] = a; });

    // Fetch corresponding transactions
    const txs = await Transaction.find({ transactionId: { $in: nodeIdArray } });
    const txMap = {};
    txs.forEach(t => { txMap[t.transactionId] = t; });

    // Build nodes list
    const nodes = nodeIdArray.map(id => {
      if (actorMap[id]) {
        const a = actorMap[id];
        return {
          id: a.actorId,
          label: `${a.name} (${a.type})`,
          type: a.type,
          city: a.city,
          riskStatus: a.riskStatus,
          actionStatus: a.actionStatus,
          cohort: a.cohort,
          details: a
        };
      }
      if (txMap[id]) {
        const t = txMap[id];
        return {
          id: t.transactionId,
          label: `Tx: ${t.transactionId} (₹${t.amount})`,
          type: 'transaction',
          riskStatus: t.riskLevel,
          amount: t.amount,
          details: t
        };
      }
      if (id.startsWith('DEV-')) {
        return { id, label: `Device: ${id}`, type: 'device', riskStatus: 'medium' };
      }
      if (id.startsWith('IP-')) {
        return { id, label: `IP: ${id}`, type: 'ip_address', riskStatus: 'medium' };
      }
      if (id.startsWith('ADDR-')) {
        return { id, label: `Address: ${id}`, type: 'delivery_address', riskStatus: 'low' };
      }
      return { id, label: id, type: 'unknown', riskStatus: 'low' };
    });

    // Filter by node type if requested
    let filteredNodes = nodes;
    if (nodeType && nodeType !== 'all') {
      filteredNodes = nodes.filter(n => n.type === nodeType);
    }
    if (riskLevel && riskLevel !== 'all') {
      filteredNodes = filteredNodes.filter(n => n.riskStatus === riskLevel);
    }

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = edges.filter(e => filteredNodeIds.has(e.sourceNodeId) || filteredNodeIds.has(e.targetNodeId));

    res.json({
      success: true,
      nodesCount: filteredNodes.length,
      edgesCount: filteredEdges.length,
      nodes: filteredNodes,
      edges: filteredEdges
    });
  } catch (err) {
    next(err);
  }
}

export async function getGraphClusters(req, res, next) {
  try {
    const clusters = [
      {
        clusterId: 'RING-01',
        name: 'Visakhapatnam Return Abuse Ring',
        actorCount: 8,
        deviceCount: 1,
        sharedDeviceId: 'DEV-VIZAG-99',
        riskLevel: 'critical',
        clusterRiskScore: 94.5,
        description: 'Single device sharing 8 distinct customer accounts submitting fake empty parcel refund claims.'
      },
      {
        clusterId: 'RING-02',
        name: 'Hyderabad Rating Inflator Ring',
        actorCount: 12,
        deviceCount: 2,
        sharedIpId: 'IP-HYD-102.44',
        riskLevel: 'high',
        clusterRiskScore: 82.0,
        description: 'Seller self-ordering burst across 12 customer accounts sharing office Wi-Fi IP and payment cards.'
      },
      {
        clusterId: 'RING-03',
        name: 'Bengaluru GPS Delivery Fraud Ring',
        actorCount: 5,
        deviceCount: 3,
        sharedPartnerId: 'DP-BLR-04',
        riskLevel: 'high',
        clusterRiskScore: 78.4,
        description: 'Delivery partner repeatedly marking high-value electronics as delivered 8.4 km away from target destination.'
      }
    ];

    res.json({ success: true, count: clusters.length, clusters });
  } catch (err) {
    next(err);
  }
}

export async function getGraphForCase(req, res, next) {
  try {
    const fraudCase = await FraudCase.findOne({ caseId: req.params.caseId });
    if (!fraudCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    const targetIds = [...(fraudCase.actorIds || []), ...(fraudCase.transactionIds || [])];
    const edges = await GraphEdge.find({
      $or: [
        { sourceNodeId: { $in: targetIds } },
        { targetNodeId: { $in: targetIds } }
      ]
    });

    res.json({ success: true, caseId: fraudCase.caseId, targetIds, edges });
  } catch (err) {
    next(err);
  }
}

export async function getGraphForActor(req, res, next) {
  try {
    const actorId = req.params.actorId;
    const edges = await GraphEdge.find({
      $or: [{ sourceNodeId: actorId }, { targetNodeId: actorId }]
    });

    res.json({ success: true, actorId, edges });
  } catch (err) {
    next(err);
  }
}
