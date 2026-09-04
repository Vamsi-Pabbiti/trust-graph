import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { Briefcase, Filter, Search, UserPlus, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const CaseQueuePage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const navigate = useNavigate();

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/cases', {
        params: { status: statusFilter, riskLevel: riskFilter }
      });
      if (res.success) {
        setCases(res.cases);
      }
    } catch (err) {
      toast.error('Failed to load case queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [statusFilter, riskFilter]);

  const handleAssignSelf = async (caseId, e) => {
    e.stopPropagation();
    try {
      const res = await axiosClient.patch(`/cases/${caseId}/assign`, {
        investigatorEmail: 'investigator@trustgraph.demo'
      });
      if (res.success) {
        toast.success(`Assigned ${caseId} to investigator@trustgraph.demo`);
        fetchCases();
      }
    } catch (err) {
      toast.error('Assignment failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Workbench Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-3">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Investigator Case Queue Workbench</h3>
            <p className="text-xs text-slate-500">Graduated remediation review & decision queue</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white outline-none"
          >
            <option value="">All Case Statuses</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="action_taken">Action Taken</option>
            <option value="appealed">Appealed</option>
            <option value="resolved_legitimate">Resolved Legitimate</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white outline-none"
          >
            <option value="">All Risk Levels</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
          </select>
        </div>
      </div>

      {/* Case Table */}
      <div className="bg-white rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Case ID</th>
                <th className="px-5 py-3.5">Risk Score & Level</th>
                <th className="px-5 py-3.5">Recommended Intervention</th>
                <th className="px-5 py-3.5">Assigned Investigator</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Precision Gate</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">Loading cases...</td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">No cases found matching filters.</td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr
                    key={c.caseId}
                    onClick={() => navigate(`/cases/${c.caseId}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {c.caseId}
                      <span className="block text-[10px] font-normal text-slate-400">Actors: {c.actorIds?.length || 0}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{c.combinedRiskScore}/100</span>
                        <RiskBadge level={c.riskLevel} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 capitalize">
                      {c.recommendedAction?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.assignedInvestigator ? (
                        <span className="text-slate-800 font-medium text-xs">{c.assignedInvestigator}</span>
                      ) : (
                        <button
                          onClick={(e) => handleAssignSelf(c.caseId, e)}
                          className="inline-flex items-center px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded text-[11px] font-medium"
                        >
                          <UserPlus className="w-3 h-3 mr-1" /> Assign Me
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {c.precisionGate?.passed ? (
                        <span className="text-emerald-600 font-medium text-[11px] flex items-center">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Passed (96.2%)
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold text-[11px]">Hard Action Blocked</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700">
                        Review Case
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
