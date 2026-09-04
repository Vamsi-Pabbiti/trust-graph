import React from 'react';
import { Layers, Network, ShieldCheck, Scale, History, Lock, FileText } from 'lucide-react';

export const ArchitecturePage = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-2xs space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">System Architecture & Technical Specs</h2>
        <p className="text-xs text-slate-500">Comprehensive overview of the TRUST GRAPH multi-actor fraud engine</p>
      </div>

      {/* Multi-Agent Table */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center">
          <Layers className="w-4 h-4 text-indigo-600 mr-2" /> Multi-Agent Responsibilities
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-border font-semibold uppercase">
              <tr>
                <th className="px-4 py-2.5">Agent Module</th>
                <th className="px-4 py-2.5">Implementation Type</th>
                <th className="px-4 py-2.5">Primary Responsibilities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-900">Transaction Risk Agent</td>
                <td className="px-4 py-2.5 text-indigo-600 font-semibold">Algorithmic Rule Engine</td>
                <td className="px-4 py-2.5 text-slate-600">Evaluates 12+ signals (+18 refund velocity, +18 chargebacks, +17 rating bursts, +20 GPS deviation, +22 POD mismatch).</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-900">Customer Behavior Agent</td>
                <td className="px-4 py-2.5 text-indigo-600 font-semibold">Algorithmic Sequence Scorer</td>
                <td className="px-4 py-2.5 text-slate-600">Detects rapid return abuse velocity, device re-registration, and suspicious delivery address reuse.</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-900">Seller Integrity Agent</td>
                <td className="px-4 py-2.5 text-indigo-600 font-semibold">Algorithmic Pattern Scorer</td>
                <td className="px-4 py-2.5 text-slate-600">Detects rating burst spikes, self-ordering cycles, shared Wi-Fi IP clusters, and payout anomalies.</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-900">Delivery Integrity Agent</td>
                <td className="px-4 py-2.5 text-indigo-600 font-semibold">Geo-Spatial Scorer</td>
                <td className="px-4 py-2.5 text-slate-600">Detects delivery GPS mismatches (&gt;5km), photo proof discrepancies, and repeat partner complaint clusters.</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-900">Graph Anomaly Agent</td>
                <td className="px-4 py-2.5 text-indigo-600 font-semibold">Graph Topology Engine</td>
                <td className="px-4 py-2.5 text-slate-600">Calculates node degrees, shared identifier frequency (devices, IPs, addresses), and dense connected clusters.</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-900">Risk Coordinator</td>
                <td className="px-4 py-2.5 text-indigo-600 font-semibold">Weighted Scoring Merging</td>
                <td className="px-4 py-2.5 text-slate-600">Merges transaction risk (65%) and graph risk (35%), clamps combined score (0-100), and assigns graduated action.</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-900">Fairness Agent</td>
                <td className="px-4 py-2.5 text-indigo-600 font-semibold">Statistical Parity Scorer</td>
                <td className="px-4 py-2.5 text-slate-600">Computes cohort intervention rates, parity gaps between small vs large sellers, and flags disproportionate impact.</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-900">Guardrail & Self-Check Agent</td>
                <td className="px-4 py-2.5 text-indigo-600 font-semibold">Safety & SLA Enforcement</td>
                <td className="px-4 py-2.5 text-slate-600">Enforces 95% historical precision gate to block automated hard actions and maintains 72h livelihood limits.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Residency & Privacy Statement */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center">
          <Lock className="w-4 h-4 text-emerald-600 mr-2" /> Data Residency & DPDP Compliance Statement
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The application displays <strong>“India Region (ap-south-1)”</strong>. True compliance under the Indian Digital Personal Data Protection (DPDP) Act depends on deploying databases, logs, backups, and API services within approved India-region cloud infrastructure (e.g. AWS ap-south-1 or GCP asia-south1). All demo data is strictly synthetic with no real PII used.
        </p>
      </div>
    </div>
  );
};
