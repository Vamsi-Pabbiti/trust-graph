import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Key, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    try {
      const res = await login(demoEmail, demoPass);
      if (res.success) {
        toast.success(`Logged in with Demo Account (${res.user.role.toUpperCase()})`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Demo login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">TRUST GRAPH Sign In</h2>
          <p className="text-xs text-slate-500 mt-1">Multi-Actor Fraud & Remediation Platform</p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-indigo-900 mb-2 flex items-center">
            <UserCheck className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> One-Click Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@trustgraph.demo', 'Admin@123')}
              className="px-3 py-2 bg-white border border-indigo-200 hover:border-indigo-400 rounded-lg text-xs font-medium text-slate-700 hover:text-indigo-600 shadow-2xs transition-all text-left"
            >
              <span className="block font-bold text-indigo-700">Admin Account</span>
              <span className="text-[10px] text-slate-500">Full Config Access</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('investigator@trustgraph.demo', 'Investigator@123')}
              className="px-3 py-2 bg-white border border-indigo-200 hover:border-indigo-400 rounded-lg text-xs font-medium text-slate-700 hover:text-indigo-600 shadow-2xs transition-all text-left"
            >
              <span className="block font-bold text-indigo-700">Investigator</span>
              <span className="text-[10px] text-slate-500">Case Review Workbench</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@trustgraph.demo"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm text-sm transition-colors flex items-center justify-center"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workbench'}
            {!loading && <ArrowRight className="w-4 h-4 ml-1.5" />}
          </button>
        </form>
      </div>
    </div>
  );
};
