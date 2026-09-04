import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { ShieldAlert, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export const FairnessPage = () => {
  const [fairness, setFairness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFairness = async () => {
      try {
        const res = await axiosClient.get('/fairness');
        if (res.success) {
          setFairness(res);
        }
      } catch (err) {
        toast.error('Failed to load fairness metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchFairness();
  }, []);

  if (loading || !fairness) {
    return <div className="p-8 text-center text-slate-500">Loading Cohort Fairness Data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Banner Notice */}
      <div className={`p-5 rounded-xl border flex items-center justify-between ${
        fairness.parityWarning?.flagged
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center space-x-3">
          {fairness.parityWarning?.flagged ? (
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          )}
          <div>
            <h3 className="font-bold text-sm">Cohort Demographic Parity Monitor</h3>
            <p className="text-xs opacity-90 mt-0.5">{fairness.parityWarning?.message}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs uppercase tracking-wider opacity-75 block">Parity Gap</span>
          <span className="text-2xl font-bold">{fairness.parityGap}%</span>
        </div>
      </div>

      {/* Cohort Comparison Table */}
      <div className="bg-white rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-slate-900 text-base">Actor Cohort Intervention Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">Calculates intervention rate & false positive rate across business sizes and tenure</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Cohort Category</th>
                <th className="px-5 py-3.5">Total Population</th>
                <th className="px-5 py-3.5">Interventions Applied</th>
                <th className="px-5 py-3.5">Intervention Rate (%)</th>
                <th className="px-5 py-3.5">False Positive Rate (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fairness.cohorts?.map((c) => (
                <tr key={c.key} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{c.name}</td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">{c.totalActors}</td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">{c.actionsCount}</td>
                  <td className="px-5 py-3.5 font-bold text-indigo-600">{c.actionRate}%</td>
                  <td className="px-5 py-3.5 font-semibold text-emerald-600">{c.falsePositiveRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fairness Limitations Notice */}
      <div className="bg-white p-5 rounded-xl border border-border shadow-2xs flex items-start space-x-3 text-xs text-slate-600">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Fairness Methodology & System Limitations</h4>
          <p className="leading-relaxed">
            {fairness.disclaimer} TRUST GRAPH does not use protected demographic attributes as fraud scoring inputs. Cohort monitoring ensures small sellers and new delivery partners are not disproportionately harmed by automated thresholding.
          </p>
        </div>
      </div>
    </div>
  );
};
