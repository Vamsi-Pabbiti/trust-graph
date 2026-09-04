import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { StatusBadge } from '../components/common/Badge';
import { Scale, Clock, CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export const AppealsCenterPage = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [reviewerNote, setReviewerNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/appeals');
      if (res.success) {
        setAppeals(res.appeals);
        if (res.appeals.length > 0 && !selectedAppeal) {
          setSelectedAppeal(res.appeals[0]);
        }
      }
    } catch (err) {
      toast.error('Failed to load appeals queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const handleResolve = async (decision) => {
    if (!selectedAppeal) return;
    setActionLoading(true);
    try {
      const res = await axiosClient.patch(`/appeals/${selectedAppeal.appealId}/resolve`, {
        decision,
        reviewerNote: reviewerNote || `Appeal ${decision}ed by investigator`
      });
      if (res.success) {
        toast.success(`Appeal ${selectedAppeal.appealId} ${decision}ed successfully!`);
        fetchAppeals();
        setSelectedAppeal(res.appeal);
      }
    } catch (err) {
      toast.error(err.message || 'Error resolving appeal');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Appeals List */}
      <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-border shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Appeals Queue</h3>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">
            {appeals.length} Total
          </span>
        </div>

        <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading appeals...</div>
          ) : appeals.map((app) => (
            <div
              key={app.appealId}
              onClick={() => setSelectedAppeal(app)}
              className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                selectedAppeal?.appealId === app.appealId
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-2xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">{app.appealId}</span>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-slate-600 line-clamp-2 mt-1">{app.reason}</p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Actor: {app.actorId}</span>
                <span className="flex items-center font-medium text-amber-600">
                  <Clock className="w-3 h-3 mr-1" /> Due: {new Date(app.dueAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Appeal Detail & Resolution */}
      <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-border shadow-2xs space-y-6">
        {selectedAppeal ? (
          <>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedAppeal.appealId}</h3>
                <p className="text-xs text-slate-500">Case ID: {selectedAppeal.caseId} • Actor ID: {selectedAppeal.actorId}</p>
              </div>
              <StatusBadge status={selectedAppeal.status} />
            </div>

            {/* Appellant Statement */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Appellant Statement</h4>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                "{selectedAppeal.reason}"
              </div>
            </div>

            {/* Attached Supporting Evidence */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Submitted Supporting Evidence ({selectedAppeal.supportingEvidence?.length || 0})</h4>
              <div className="space-y-2">
                {selectedAppeal.supportingEvidence?.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-indigo-900 block">{doc.docType}</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">{doc.notes}</span>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-600 rounded text-[11px] font-semibold hover:bg-indigo-50 flex items-center"
                    >
                      View Doc <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution Form */}
            {selectedAppeal.status === 'submitted' || selectedAppeal.status === 'under_review' ? (
              <div className="pt-4 border-t border-border space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Investigator Decision Note</label>
                  <textarea
                    rows="3"
                    value={reviewerNote}
                    onChange={(e) => setReviewerNote(e.target.value)}
                    placeholder="Document justification for accept or rejection..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleResolve('accept')}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Accept Appeal & Restore Status
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleResolve('reject')}
                    className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> Reject Appeal & Maintain Action
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Decision Rendered by {selectedAppeal.reviewedBy}</span>
                <p className="text-slate-600">{selectedAppeal.reviewerNote}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            Select an appeal from the left queue to review evidence and render a decision.
          </div>
        )}
      </div>
    </div>
  );
};
