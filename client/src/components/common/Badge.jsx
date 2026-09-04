import React from 'react';

export const RiskBadge = ({ level }) => {
  const l = (level || 'low').toLowerCase();
  const styles = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[l] || styles.low}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${l === 'critical' ? 'bg-rose-600 animate-pulse' : (l === 'high' ? 'bg-amber-500' : (l === 'medium' ? 'bg-blue-500' : 'bg-emerald-500'))}`}></span>
      {l.toUpperCase()}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const s = (status || 'open').toLowerCase();
  const styles = {
    open: 'bg-blue-50 text-blue-700 border-blue-200',
    in_review: 'bg-purple-50 text-purple-700 border-purple-200',
    escalated: 'bg-amber-50 text-amber-700 border-amber-200',
    action_taken: 'bg-rose-50 text-rose-700 border-rose-200',
    appealed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    resolved_legitimate: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    resolved_fraud_confirmed: 'bg-gray-100 text-gray-800 border-gray-300',
    submitted: 'bg-amber-50 text-amber-700 border-amber-200',
    under_review: 'bg-purple-50 text-purple-700 border-purple-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[s] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {s.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
};
