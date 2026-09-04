import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { RiskBadge } from '../components/common/Badge';
import { Zap, ShieldCheck, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const LiveScoringPage = () => {
  const [formData, setFormData] = useState({
    amount: 28500,
    paymentMethod: 'UPI',
    orderHour: 2, // 2 AM (Night Order)
    accountAgeDays: 4, // Young account
    refundCount30Days: 4, // High refund velocity
    chargebackCount: 2, // Repeated chargebacks
    sellerRatingBurst: 9, // Rating burst
    gpsDeviationKm: 6.5, // High GPS deviation
    proofOfDeliveryMismatch: true,
    customerId: 'CUST-001',
    sellerId: 'SELL-001',
    deliveryPartnerId: 'DP-001',
    deviceId: 'DEV-VIZAG-RING-99',
    ipAddress: 'IP-HYD-BURST-102',
    addressHash: 'ADDR-VIZAG-991'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScore = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderTime = new Date();
      orderTime.setHours(parseInt(formData.orderHour), 15, 0);

      const payload = {
        ...formData,
        amount: Number(formData.amount),
        accountAgeDays: Number(formData.accountAgeDays),
        refundCount30Days: Number(formData.refundCount30Days),
        chargebackCount: Number(formData.chargebackCount),
        sellerRatingBurst: Number(formData.sellerRatingBurst),
        gpsDeviationKm: Number(formData.gpsDeviationKm),
        orderTime
      };

      const res = await axiosClient.post('/transactions/score', payload);
      if (res.success) {
        setResult(res.scoringResult);
        toast.success('Transaction Risk & Graph Topology Calculated!');
      }
    } catch (err) {
      toast.error('Scoring calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Input Column */}
      <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-border shadow-2xs space-y-5">
        <div className="flex items-center space-x-3 border-b border-border pb-4">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Live Fraud Risk Simulator</h3>
            <p className="text-xs text-slate-500">Adjust parameters to simulate multi-signal transaction risk</p>
          </div>
        </div>

        <form onSubmit={handleScore} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Order Amount (₹)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="COD">Cash on Delivery (COD)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Order Hour (IST)</label>
              <input
                type="number"
                min="0"
                max="23"
                value={formData.orderHour}
                onChange={(e) => setFormData({ ...formData, orderHour: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Age (Days)</label>
              <input
                type="number"
                value={formData.accountAgeDays}
                onChange={(e) => setFormData({ ...formData, accountAgeDays: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Refunds (30d)</label>
              <input
                type="number"
                value={formData.refundCount30Days}
                onChange={(e) => setFormData({ ...formData, refundCount30Days: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chargebacks</label>
              <input
                type="number"
                value={formData.chargebackCount}
                onChange={(e) => setFormData({ ...formData, chargebackCount: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rating Burst (2h)</label>
              <input
                type="number"
                value={formData.sellerRatingBurst}
                onChange={(e) => setFormData({ ...formData, sellerRatingBurst: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GPS Dev (Km)</label>
              <input
                type="number"
                step="0.1"
                value={formData.gpsDeviationKm}
                onChange={(e) => setFormData({ ...formData, gpsDeviationKm: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="podMismatch"
              checked={formData.proofOfDeliveryMismatch}
              onChange={(e) => setFormData({ ...formData, proofOfDeliveryMismatch: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="podMismatch" className="font-semibold text-slate-700">Flag Proof of Delivery Photo Mismatch</label>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Device ID</label>
              <input
                type="text"
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">IP Address</label>
              <input
                type="text"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Address Hash</label>
              <input
                type="text"
                value={formData.addressHash}
                onChange={(e) => setFormData({ ...formData, addressHash: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-[11px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center mt-4 shadow-sm"
          >
            {loading ? 'Calculating Scores...' : 'Calculate Fraud Risk & Graph Topology'}
          </button>
        </form>
      </div>

      {/* Output Column */}
      <div className="lg:col-span-5 space-y-5">
        {result ? (
          <div className="bg-white p-6 rounded-xl border border-border shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs text-slate-500 block">Combined Risk Score</span>
                <span className="text-3xl font-extrabold text-slate-900">{result.combinedRiskScore}<span className="text-base font-normal text-slate-400">/100</span></span>
              </div>
              <RiskBadge level={result.riskLevel} />
            </div>

            {/* Score Component Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Tx Risk (65% Weight)</span>
                <span className="text-base font-bold text-indigo-600">{result.transactionRiskScore} pts</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Graph Risk (35% Weight)</span>
                <span className="text-base font-bold text-indigo-600">{result.graphRiskScore} pts</span>
              </div>
            </div>

            {/* Action Recommendation */}
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block mb-1">Graduated Recommended Action</span>
              <span className="text-sm font-bold text-indigo-700 capitalize block">
                {result.recommendedAction.replace(/_/g, ' ')}
              </span>
              <span className="text-[11px] text-indigo-600 mt-1 block">
                Subject to 95% Precision Gate & 72-Hour Livelihood Temporary Limit
              </span>
            </div>

            {/* Triggered Signals List */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Triggered Evidence Signals ({result.evidence.length})</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {result.evidence.map((sig, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-slate-800 block">{sig.signal}</span>
                      <span className="text-slate-500 block text-[11px] mt-0.5">{sig.description}</span>
                    </div>
                    <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">+{sig.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-border shadow-2xs text-center text-slate-400 space-y-3">
            <Zap className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">Submit form parameters to run live fraud scoring and graph cluster analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};
