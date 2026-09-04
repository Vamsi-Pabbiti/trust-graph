import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { History, ShieldCheck, AlertTriangle, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuditTrailPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [search, setSearch] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/audit', { params: { search } });
      if (res.success) {
        setEvents(res.events);
      }
    } catch (err) {
      toast.error('Failed to load audit events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search]);

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await axiosClient.get('/audit/verify');
      if (res.success) {
        setVerification(res);
        if (res.isValid) {
          toast.success('SHA-256 Audit Chain Verified! All hashes match unbroken sequence.');
        } else {
          toast.error(`Audit Chain Warning: ${res.reason}`);
        }
      }
    } catch (err) {
      toast.error('Chain verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-border shadow-2xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Append-Only SHA-256 Audit Trail</h3>
            <p className="text-xs text-slate-500">Every decision, action, and appeal status update is hash-chained</p>
          </div>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={verifying}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm"
        >
          {verifying ? (
            'Verifying Hashes...'
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Verify Chain Integrity (SHA-256)
            </>
          )}
        </button>
      </div>

      {/* Verification Result Banner */}
      {verification && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 text-xs ${
          verification.isValid
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
            : 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
        }`}>
          {verification.isValid ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div>
            <span>Status: <strong>{verification.isValid ? 'UNBROKEN HASH CHAIN VALIDATED' : 'TAMPERING DETECTED'}</strong></span>
            <p className="opacity-90">{verification.reason} ({verification.totalEventsAudited} events checked)</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Event ID, Case ID, Actor ID, or Investigator Email..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Event ID & Timestamp</th>
                <th className="px-5 py-3.5">Action & Case</th>
                <th className="px-5 py-3.5">Performed By</th>
                <th className="px-5 py-3.5">Reason / Rationale</th>
                <th className="px-5 py-3.5">SHA-256 Current Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400 font-sans">Loading audit trail...</td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400 font-sans">No audit events found.</td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.eventId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-sans">
                      <span className="font-bold text-slate-900 block">{ev.eventId}</span>
                      <span className="text-[10px] text-slate-400 block">{new Date(ev.timestamp).toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      <span className="font-semibold text-indigo-700 block">{ev.action}</span>
                      <span className="text-[10px] text-slate-500">{ev.caseId || 'N/A'}</span>
                    </td>
                    <td className="px-5 py-3.5 font-sans text-slate-800">
                      {ev.performedBy}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-slate-600 max-w-xs truncate">
                      {ev.reason}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-700 block truncate w-36">
                        {ev.currentHash}
                      </span>
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
