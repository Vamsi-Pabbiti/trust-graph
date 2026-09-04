import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { RiskBadge } from '../components/common/Badge';
import { Network, Filter, ZoomIn, ZoomOut, RefreshCw, X, ShieldAlert, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export const TrustNetworkPage = () => {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nodeTypeFilter, setNodeTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const [gRes, cRes] = await Promise.all([
        axiosClient.get('/graph', { params: { nodeType: nodeTypeFilter, riskLevel: riskFilter } }),
        axiosClient.get('/graph/clusters')
      ]);
      if (gRes.success) setGraphData(gRes);
      if (cRes.success) setClusters(cRes.clusters);
    } catch (err) {
      toast.error('Failed to load graph data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [nodeTypeFilter, riskFilter]);

  // Position nodes deterministically in a ring/grid for SVG visualization
  const width = 800;
  const height = 500;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 190;

  const nodesWithCoords = graphData.nodes.map((node, i) => {
    const angle = (i / Math.max(1, graphData.nodes.length)) * 2 * Math.PI;
    const x = cx + radius * Math.cos(angle) + ((i % 3) * 15 - 15);
    const y = cy + radius * Math.sin(angle) + ((i % 2) * 15 - 15);
    return { ...node, x, y };
  });

  const nodeMap = {};
  nodesWithCoords.forEach(n => { nodeMap[n.id] = n; });

  const getNodeColor = (type, riskStatus) => {
    if (riskStatus === 'critical') return '#DC2626';
    if (riskStatus === 'high') return '#F59E0B';
    if (type === 'customer') return '#4F46E5';
    if (type === 'seller') return '#0284C7';
    if (type === 'delivery_partner') return '#7C3AED';
    if (type === 'device') return '#E11D48';
    if (type === 'ip_address') return '#D97706';
    return '#64748B';
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-3">
          <Network className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Interactive Multi-Actor Graph Topology</h3>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <label className="font-semibold text-slate-600">Filter Node Type:</label>
          <select
            value={nodeTypeFilter}
            onChange={(e) => setNodeTypeFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white outline-none"
          >
            <option value="all">All Node Types</option>
            <option value="customer">Customers</option>
            <option value="seller">Sellers</option>
            <option value="delivery_partner">Delivery Partners</option>
            <option value="device">Devices</option>
            <option value="ip_address">IP Addresses</option>
          </select>

          <label className="font-semibold text-slate-600 ml-2">Risk Status:</label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white outline-none"
          >
            <option value="all">All Risk Tiers</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
          </select>
        </div>
      </div>

      {/* Main Canvas & Inspector Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Network Visualizer */}
        <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-border shadow-2xs relative min-h-[520px] flex flex-col">
          {/* Zoom controls */}
          <div className="absolute top-6 right-6 z-10 bg-white border border-slate-200 rounded-lg shadow-2xs p-1 flex space-x-1">
            <button onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.2))} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
            <button onClick={() => setZoomLevel(1)} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Reset"><RefreshCw className="w-4 h-4" /></button>
          </div>

          {/* Graph Legend */}
          <div className="flex flex-wrap gap-3 text-[11px] mb-3 px-2">
            <span className="flex items-center text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-1.5"></span> Customer</span>
            <span className="flex items-center text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-sky-600 mr-1.5"></span> Seller</span>
            <span className="flex items-center text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 mr-1.5"></span> Delivery Partner</span>
            <span className="flex items-center text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 mr-1.5"></span> Shared Device</span>
            <span className="flex items-center text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 mr-1.5"></span> Shared IP</span>
          </div>

          <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center relative">
            {loading ? (
              <div className="text-slate-400 text-xs">Loading Graph Topology...</div>
            ) : (
              <svg width="100%" height="480" viewBox={`0 0 ${width} ${height}`} className="cursor-grab">
                <g transform={`scale(${zoomLevel})`} transform-origin="center">
                  {/* Draw Edges */}
                  {graphData.edges.map((edge, idx) => {
                    const source = nodeMap[edge.sourceNodeId];
                    const target = nodeMap[edge.targetNodeId];
                    if (!source || !target) return null;
                    const isSuspicious = edge.edgeType === 'shared_suspicious_signal';
                    return (
                      <line
                        key={idx}
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={isSuspicious ? '#DC2626' : '#94A3B8'}
                        strokeWidth={isSuspicious ? 2 : 1}
                        strokeDasharray={isSuspicious ? '4,4' : 'none'}
                        opacity={0.7}
                      />
                    );
                  })}

                  {/* Draw Nodes */}
                  {nodesWithCoords.map((node) => {
                    const color = getNodeColor(node.type, node.riskStatus);
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => setSelectedNode(node)}
                        className="cursor-pointer"
                      >
                        <circle
                          r={isSelected ? 16 : 11}
                          fill={color}
                          stroke="#FFFFFF"
                          strokeWidth={isSelected ? 3 : 2}
                          className="transition-all hover:scale-125"
                        />
                        <text
                          y={20}
                          textAnchor="middle"
                          fill="#0F172A"
                          fontSize="9 font-semibold"
                          className="pointer-events-none select-none"
                        >
                          {node.id}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>
        </div>

        {/* Right Drawer: Selected Node Details & Suspicious Cluster List */}
        <div className="lg:col-span-4 space-y-6">
          {/* Node Details Inspector */}
          {selectedNode ? (
            <div className="bg-white p-5 rounded-xl border border-border shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="font-bold text-slate-900 text-sm">Node Inspection</h4>
                <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Node ID</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedNode.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Label / Name</span>
                  <span className="font-semibold text-slate-800">{selectedNode.label}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Node Type</span>
                  <span className="capitalize font-semibold text-indigo-600">{selectedNode.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Risk Level</span>
                  <RiskBadge level={selectedNode.riskStatus} />
                </div>
                {selectedNode.city && (
                  <div>
                    <span className="text-slate-400 block">City</span>
                    <span className="font-medium text-slate-800">{selectedNode.city}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-xl border border-border shadow-2xs text-center text-slate-400 text-xs">
              Select any graph node on the canvas to inspect evidence details.
            </div>
          )}

          {/* Active Suspicious Fraud Clusters */}
          <div className="bg-white p-5 rounded-xl border border-border shadow-2xs space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center">
              <ShieldAlert className="w-4 h-4 text-rose-600 mr-2" />
              High-Risk Suspicious Clusters ({clusters.length})
            </h4>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {clusters.map((c) => (
                <div key={c.clusterId} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <RiskBadge level={c.riskLevel} />
                  </div>
                  <p className="text-slate-600 text-[11px] leading-tight">{c.description}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>{c.actorCount} Connected Actors</span>
                    <span className="text-rose-600 font-bold">Cluster Score: {c.clusterRiskScore}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
