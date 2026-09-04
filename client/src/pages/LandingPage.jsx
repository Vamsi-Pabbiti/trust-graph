import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Network, Scale, History, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">TRUST GRAPH</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center"
            >
              Launch Demo <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
          <span>Multi-Actor Fraud Engine MVP</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Explainable Multi-Actor Fraud Detection & Graduated Remediation
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed">
          Traditional rules analyze single transactions in isolation. <strong>TRUST GRAPH</strong> connects customers, sellers, delivery partners, devices, IPs, and addresses to expose coordinated fraud rings while protecting honest actors.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3.5 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center"
          >
            Explore Interactive Demo <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all"
          >
            System Capabilities
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Key Platform Capabilities</h2>
            <p className="text-slate-500 text-sm mt-1">Built with deterministic risk scoring, graph analysis, and 95% precision guardrails.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Network Topology Graph</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Detects shared devices, Wi-Fi IPs, delivery addresses, and repeated actor pairs to uncover collusion across Indian e-commerce networks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">95% Precision Gate Guardrail</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Automated hard actions (suspensions & payout freezes) are blocked unless system precision exceeds 95%, safeguarding small seller livelihoods.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">SHA-256 Tamper-Evident Audit</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Append-only event log hash-chained with SHA-256 for transparent auditability and verification against unauthorized evidence tampering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p>© 2026 TRUST GRAPH Platform • India Region (ap-south-1) • DPDP Compliant</p>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="hover:text-indigo-600">Demo Sign In</Link>
            <Link to="/architecture" className="hover:text-indigo-600">Architecture</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
