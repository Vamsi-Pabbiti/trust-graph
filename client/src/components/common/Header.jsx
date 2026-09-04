import React from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, Bell, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const location = useLocation();
  const { user } = useAuth();

  const titleMap = {
    '/dashboard': 'Executive Fraud & Risk Dashboard',
    '/transactions': 'Transaction Explorer & Scoring',
    '/score-live': 'Live Transaction Risk Simulator',
    '/graph': 'Trust Network Graph Explorer',
    '/cases': 'Case Workbench Queue',
    '/appeals': 'Appeals & Dispute Center',
    '/fairness': 'Cohort Fairness & Parity Monitor',
    '/audit': 'Append-Only SHA-256 Audit Trail',
    '/settings': 'System Thresholds & Signal Weights',
    '/architecture': 'System Architecture & Documentation'
  };

  const currentTitle = titleMap[location.pathname] || 'Trust Graph Platform';

  return (
    <header className="h-16 bg-white border-b border-border px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{currentTitle}</h2>
        <div className="flex items-center text-xs text-slate-500 space-x-2 mt-0.5">
          <span>Enterprise Platform</span>
          <span>•</span>
          <span className="flex items-center text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
            <MapPin className="w-3 h-3 mr-1" /> India Region (ap-south-1) - DPDP Ready
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Guardrail Status Pill */}
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>95% Precision Gate Active (96.2%)</span>
        </div>

        {/* Role Badge */}
        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-500 block">Logged in as</span>
          <span className="text-xs font-semibold text-slate-900">{user?.email}</span>
        </div>
      </div>
    </header>
  );
};
