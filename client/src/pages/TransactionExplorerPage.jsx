import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { RiskBadge } from '../components/common/Badge';
import { Search, Filter, ArrowRight, Eye, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export const TransactionExplorerPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/transactions', {
        params: { search, riskLevel, page, limit: 15 }
      });
      if (res.success) {
        setTransactions(res.transactions);
        setTotalPages(res.pagination.pages);
      }
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, riskLevel, page]);

  const handleOpenCase = async (tx) => {
    try {
      const res = await axiosClient.post('/cases', {
        transactionIds: [tx.transactionId],
        actorIds: [tx.customerId, tx.sellerId, tx.deliveryPartnerId],
        combinedRiskScore: tx.combinedRiskScore,
        graphRiskScore: tx.graphRiskScore,
        riskLevel: tx.riskLevel,
        evidence: tx.triggeredSignals.map(s => ({ signal: s.code, description: s.evidence, weight: s.weight })),
        explanation: `Opened case for Transaction ${tx.transactionId} (Risk Score: ${tx.combinedRiskScore}/100)`,
        recommendedAction: tx.riskLevel === 'critical' ? 'payout_freeze' : 'temporary_payout_hold'
      });

      if (res.success) {
        toast.success(`Fraud Case ${res.case.caseId} created!`);
      }
    } catch (err) {
      toast.error(err.message || 'Error opening case');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Transaction ID, Order ID, Customer ID, Seller ID..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Risk Tiers</option>
            <option value="low">Low Risk (0-24)</option>
            <option value="medium">Medium Risk (25-49)</option>
            <option value="high">High Risk (50-74)</option>
            <option value="critical">Critical Risk (75-100)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Transaction ID</th>
                <th className="px-5 py-3.5">Amount (₹)</th>
                <th className="px-5 py-3.5">City & Payment</th>
                <th className="px-5 py-3.5">Customer & Seller</th>
                <th className="px-5 py-3.5">Risk Scores</th>
                <th className="px-5 py-3.5">Risk Level</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">Loading transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">No transactions match your search filters.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {tx.transactionId}
                      <span className="block text-[10px] font-normal text-slate-400">Ord: {tx.orderId}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-800">{tx.city}</span>
                      <span className="block text-[10px] text-slate-400">{tx.paymentMethod}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-slate-800 block font-medium">{tx.customerId}</span>
                      <span className="text-slate-500 block text-[10px]">Seller: {tx.sellerId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{tx.combinedRiskScore}/100</span>
                        <span className="text-[10px] text-slate-400">(Tx: {tx.transactionRiskScore} | Graph: {tx.graphRiskScore})</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <RiskBadge level={tx.riskLevel} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenCase(tx)}
                        className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        Create Case
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing page {page} of {totalPages}</span>
          <div className="flex space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
