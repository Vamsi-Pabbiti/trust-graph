/**
 * Graph Anomaly Agent - Evaluates network connectivity, shared identifiers, and cluster densities
 */
export function scoreGraphTopology(nodeEdges, targetActorIds = [], allHistoricalEdges = []) {
  // nodeEdges can be an array of GraphEdge objects connected to the current transaction or target actors
  const edges = nodeEdges || [];
  
  let sharedDeviceScore = 0;
  let sharedIpScore = 0;
  let sharedAddressScore = 0;
  let repeatedPairScore = 0;
  let clusterDensityScore = 0;

  const sharedSignals = [];
  const nodeDegrees = {};

  // Count edge occurrences and node degrees
  edges.forEach(edge => {
    nodeDegrees[edge.sourceNodeId] = (nodeDegrees[edge.sourceNodeId] || 0) + 1;
    nodeDegrees[edge.targetNodeId] = (nodeDegrees[edge.targetNodeId] || 0) + 1;

    if (edge.edgeType === 'used_device' && edge.strength > 1) {
      const inc = Math.min(25, edge.strength * 8);
      sharedDeviceScore += inc;
      sharedSignals.push({
        type: 'SHARED_DEVICE',
        weight: inc,
        description: `Device ID ${edge.targetNodeId} shared across ${edge.strength} distinct accounts.`
      });
    }

    if (edge.edgeType === 'used_ip' && edge.strength > 2) {
      const inc = Math.min(20, (edge.strength - 1) * 5);
      sharedIpScore += inc;
      sharedSignals.push({
        type: 'SHARED_IP',
        weight: inc,
        description: `IP Address ${edge.targetNodeId} shared across ${edge.strength} distinct accounts/sellers.`
      });
    }

    if (edge.edgeType === 'used_address' && edge.strength > 3) {
      // Shared address could be family/office, so increment gently
      const inc = Math.min(15, (edge.strength - 2) * 3);
      sharedAddressScore += inc;
      sharedSignals.push({
        type: 'SHARED_ADDRESS',
        weight: inc,
        description: `Delivery address hash ${edge.targetNodeId} associated with ${edge.strength} accounts.`
      });
    }

    if (edge.edgeType === 'shared_suspicious_signal') {
      const inc = Math.min(30, edge.strength * 10);
      repeatedPairScore += inc;
      sharedSignals.push({
        type: 'REPEATED_ACTOR_PAIR',
        weight: inc,
        description: `Repeated high-velocity transactions between customer-seller or seller-delivery pair (${edge.evidence}).`
      });
    }
  });

  // Calculate high-degree node cluster density
  const highDegreeNodes = Object.keys(nodeDegrees).filter(nodeId => nodeDegrees[nodeId] >= 4);
  if (highDegreeNodes.length >= 2) {
    clusterDensityScore = Math.min(20, highDegreeNodes.length * 6);
    sharedSignals.push({
      type: 'HIGH_CLUSTER_DENSITY',
      weight: clusterDensityScore,
      description: `Detected dense interconnected cluster with ${highDegreeNodes.length} high-degree hubs.`
    });
  }

  const rawGraphScore = sharedDeviceScore + sharedIpScore + sharedAddressScore + repeatedPairScore + clusterDensityScore;
  const normalizedGraphScore = Math.min(100, Math.max(0, rawGraphScore));

  return {
    rawGraphScore,
    normalizedGraphScore,
    sharedDeviceScore,
    sharedIpScore,
    sharedAddressScore,
    repeatedPairScore,
    clusterDensityScore,
    sharedSignals,
    nodeDegrees
  };
}
