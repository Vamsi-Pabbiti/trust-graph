import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Zap, 
  Network, 
  Briefcase, 
  Scale, 
  ShieldAlert, 
  History, 
  Settings, 
  Layers,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Transaction Explorer', path: '/transactions', icon: Search },
    { label: 'Live Scoring Simulator', path: '/score-live', icon: Zap },
    { label: 'Trust Network Graph', path: '/graph', icon: Network },
    { label: 'Case Workbench Queue', path: '/cases', icon: Briefcase },
    { label: 'Appeals Center', path: '/appeals', icon: Scale },
    { label: 'Cohort Fairness', path: '/fairness', icon: ShieldAlert },
    { label: 'Audit Trail (SHA-256)', path: '/audit', icon: History },
    { label: 'System Configuration', path: '/settings', icon: Settings },
    { label: 'Architecture & Docs', path: '/architecture', icon: Layers }
  ];

  return (
    <aside className="w-64 bg-white border-r border-border min-h-screen flex flex-col fixed left-0 top-0 z-30 shadow-sm">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border bg-slate-50/50">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white mr-3 shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 tracking-tight leading-none text-base">TRUST GRAPH</h1>
          <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">Fraud Engine MVP</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 mr-3 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-border bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
              <span className="inline-block text-[10px] font-medium bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded capitalize">
                {user?.role || 'Investigator'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
