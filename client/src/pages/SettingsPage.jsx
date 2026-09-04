import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Settings, Save, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/settings');
      if (res.success) {
        setSettings(res.settings);
      }
    } catch (err) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axiosClient.put('/settings', settings);
      if (res.success) {
        toast.success('System configuration updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all signal weights and thresholds to factory defaults?')) return;
    setSaving(true);
    try {
      const res = await axiosClient.post('/settings/reset');
      if (res.success) {
        setSettings(res.settings);
        toast.success('Settings reset to factory defaults!');
      }
    } catch (err) {
      toast.error('Reset failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-slate-500">Loading Configuration...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-border shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">System Configuration & Thresholds</h3>
            <p className="text-xs text-slate-500">Adjust signal weights, precision gates, and SLA hours</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Defaults
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Guardrails Configuration */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-2xs space-y-4">
        <h4 className="font-bold text-slate-900 text-sm border-b border-border pb-3 flex items-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2" /> Precision & Guardrails Config
        </h4>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hard Action Precision Gate (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.hardActionPrecisionThreshold}
              onChange={(e) => setSettings({ ...settings, hardActionPrecisionThreshold: Number(e.target.value) })}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Automated hard actions blocked if below</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Appeal SLA Time (Hours)</label>
            <input
              type="number"
              value={settings.appealSlaHours}
              onChange={(e) => setSettings({ ...settings, appealSlaHours: Number(e.target.value) })}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Action Expiry Limit (Hours)</label>
            <input
              type="number"
              value={settings.actionExpiryHours}
              onChange={(e) => setSettings({ ...settings, actionExpiryHours: Number(e.target.value) })}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Signal Weights Configuration */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-2xs space-y-4">
        <h4 className="font-bold text-slate-900 text-sm border-b border-border pb-3">
          Transaction Signal Weights (Contribution Points)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Refund Velocity (≥3)</label>
            <input
              type="number"
              value={settings.scoringWeights?.refundCount30Days}
              onChange={(e) => setSettings({
                ...settings,
                scoringWeights: { ...settings.scoringWeights, refundCount30Days: Number(e.target.value) }
              })}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Chargebacks (≥2)</label>
            <input
              type="number"
              value={settings.scoringWeights?.chargebackCount}
              onChange={(e) => setSettings({
                ...settings,
                scoringWeights: { ...settings.scoringWeights, chargebackCount: Number(e.target.value) }
              })}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rating Burst (≥8)</label>
            <input
              type="number"
              value={settings.scoringWeights?.sellerRatingBurst}
              onChange={(e) => setSettings({
                ...settings,
                scoringWeights: { ...settings.scoringWeights, sellerRatingBurst: Number(e.target.value) }
              })}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">GPS Dev (≥5km)</label>
            <input
              type="number"
              value={settings.scoringWeights?.gpsDeviationKm}
              onChange={(e) => setSettings({
                ...settings,
                scoringWeights: { ...settings.scoringWeights, gpsDeviationKm: Number(e.target.value) }
              })}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Proof Mismatch</label>
            <input
              type="number"
              value={settings.scoringWeights?.proofOfDeliveryMismatch}
              onChange={(e) => setSettings({
                ...settings,
                scoringWeights: { ...settings.scoringWeights, proofOfDeliveryMismatch: Number(e.target.value) }
              })}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Night Order (0-4 AM)</label>
            <input
              type="number"
              value={settings.scoringWeights?.nightOrder}
              onChange={(e) => setSettings({
                ...settings,
                scoringWeights: { ...settings.scoringWeights, nightOrder: Number(e.target.value) }
              })}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">High Value (&gt;₹20k)</label>
            <input
              type="number"
              value={settings.scoringWeights?.highValue}
              onChange={(e) => setSettings({
                ...settings,
                scoringWeights: { ...settings.scoringWeights, highValue: Number(e.target.value) }
              })}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Young Account (&lt;7d)</label>
            <input
              type="number"
              value={settings.scoringWeights?.youngAccount}
              onChange={(e) => setSettings({
                ...settings,
                scoringWeights: { ...settings.scoringWeights, youngAccount: Number(e.target.value) }
              })}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
