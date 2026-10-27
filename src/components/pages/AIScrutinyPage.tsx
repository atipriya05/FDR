import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Brain,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FileText,
  Search,
  MessageSquare,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  FDRRecord,
  SAMPLE_FDR_DATASET,
  formatIndianCurrency,
  formatIndianDate,
} from '../../data/fdrData.ts';
import { BankLogoBadge } from '../visuals/BankLogoBadge.tsx';

interface AIScrutinyPageProps {
  dataset: FDRRecord[];
  onSelectFDR: (fdrId: string) => void;
  onUpdateFDR?: (updated: FDRRecord) => void;
}

export const AIScrutinyPage: React.FC<AIScrutinyPageProps> = ({
  dataset = SAMPLE_FDR_DATASET,
  onSelectFDR,
  onUpdateFDR,
}) => {
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'INTELLIGENCE'>('QUEUE');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDiscrepancyOnly, setFilterDiscrepancyOnly] = useState(false);

  // Filter scrutiny queue records (under review, pending verification, or discrepancy)
  const scrutinyQueue = useMemo(() => {
    return dataset.filter((rec) => {
      const isCandidate =
        rec.status === 'PENDING_VERIFICATION' ||
        rec.scrutinyStatus === 'UNDER_REVIEW' ||
        rec.scrutinyStatus === 'DISCREPANCY' ||
        rec.riskLevel === 'HIGH';

      if (!isCandidate) return false;

      if (filterDiscrepancyOnly && rec.scrutinyStatus !== 'DISCREPANCY') {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = rec.referenceNo.toLowerCase().includes(q);
        const matchesInst = rec.institutionName.toLowerCase().includes(q);
        const matchesBank = rec.bankName.toLowerCase().includes(q);
        if (!matchesRef && !matchesInst && !matchesBank) return false;
      }

      return true;
    });
  }, [dataset, searchQuery, filterDiscrepancyOnly]);

  // Prioritized cases for Sentinel Intelligence (sorted by risk score descending)
  const prioritizedIntelligenceCases = useMemo(() => {
    return [...dataset]
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
      .slice(0, 8);
  }, [dataset]);

  // Global Risk Factor Distribution
  const riskStats = useMemo(() => {
    const highCount = dataset.filter((r) => r.riskLevel === 'HIGH').length;
    const medCount = dataset.filter((r) => r.riskLevel === 'MEDIUM').length;
    const lowCount = dataset.filter((r) => r.riskLevel === 'LOW').length;
    const discrepancyCount = dataset.filter((r) => r.scrutinyStatus === 'DISCREPANCY').length;

    return { highCount, medCount, lowCount, discrepancyCount };
  }, [dataset]);

  return (
    <div className="space-y-6">
      {/* Top Banner (Editorial Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-stone-100/80 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-stone-700 border border-stone-200/70">
            <Sparkles className="h-3 w-3 text-teal-800" />
            <span>Automated Verification Engine</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">Heuristic Analysis</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            AI Review
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-normal max-w-3xl font-sans">
            Automated document scrutiny, OCR extraction checks, and explainable risk summaries.
          </p>
        </div>

        {/* Tab switch controls */}
        <div className="flex items-center rounded-md border border-stone-200/90 bg-stone-100/80 p-1 self-start sm:self-auto text-xs font-medium shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('QUEUE')}
            className={`rounded-md px-3.5 py-1.5 transition-all ${
              activeTab === 'QUEUE'
                ? 'bg-white text-slate-950 font-semibold shadow-xs border border-stone-200/80'
                : 'text-stone-600 hover:text-slate-900'
            }`}
          >
            Scrutiny Queue ({scrutinyQueue.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('INTELLIGENCE')}
            className={`rounded-md px-3.5 py-1.5 transition-all ${
              activeTab === 'INTELLIGENCE'
                ? 'bg-white text-slate-950 font-semibold shadow-xs border border-stone-200/80'
                : 'text-stone-600 hover:text-slate-900'
            }`}
          >
            Risk Overview
          </button>
        </div>
      </div>

      {/* Simulated Heuristics Disclaimer Notice */}
      <div className="rounded-lg border border-teal-200/70 bg-teal-50/40 p-4 text-xs text-teal-950 flex items-start gap-3">
        <Info className="h-4 w-4 text-teal-800 shrink-0 mt-0.5" />
        <div className="leading-relaxed font-sans">
          <strong>Evaluation Prototype for SIH26265:</strong> All automated OCR findings, discrepancy flags, and compliance scores displayed here are simulated decision-support heuristics designed to assist scrutiny officers. Under AICTE regulations, automated flags never constitute formal accusations, legal declarations, or independent bank confirmations.
        </div>
      </div>

      {activeTab === 'QUEUE' ? (
        /* ================= TAB 1: SCRUTINY VERIFICATION QUEUE ================= */
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 block">Queue Backlog</span>
              <div className="font-serif text-3xl font-semibold text-slate-900 mt-2">{scrutinyQueue.length}</div>
              <span className="text-[11px] text-stone-500 mt-1 block font-sans">Requires scrutiny review</span>
            </div>
            <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 block">Discrepancy Flags</span>
              <div className="font-serif text-3xl font-semibold text-rose-800 mt-2">{riskStats.discrepancyCount}</div>
              <span className="text-[11px] text-stone-500 mt-1 block font-sans">Wording / branch mismatch</span>
            </div>
            <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 block">High Risk Queue</span>
              <div className="font-serif text-3xl font-semibold text-amber-800 mt-2">{riskStats.highCount}</div>
              <span className="text-[11px] text-stone-500 mt-1 block font-sans">Maturity or endorsement risks</span>
            </div>
            <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 block">OCR Confidence Baseline</span>
              <div className="font-serif text-3xl font-semibold text-teal-800 mt-2">94.8%</div>
              <span className="text-[11px] text-stone-500 mt-1 block font-sans">Simulated model accuracy</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="rounded-lg border border-stone-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter queue by institution, FDR ref, or bank..."
                className="w-full rounded-md border border-stone-200 bg-stone-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 focus:outline-hidden transition-all"
              />
            </div>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filterDiscrepancyOnly}
                onChange={(e) => setFilterDiscrepancyOnly(e.target.checked)}
                className="rounded border-slate-300 text-teal-700 focus:ring-teal-600"
              />
              <span>Show Discrepancies Only</span>
            </label>
          </div>

          {/* Scrutiny Queue Table */}
          <div className="rounded-lg border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            {scrutinyQueue.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-500">
                No records currently pending in the scrutiny queue matching your filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/80 font-mono text-[10px] uppercase tracking-wider text-stone-600">
                      <th scope="col" className="py-3.5 px-4 sm:px-6">FDR & Institution</th>
                      <th scope="col" className="py-3.5 px-3">Submitted vs Verified Sum</th>
                      <th scope="col" className="py-3.5 px-3">Discrepancy / Audit Flag</th>
                      <th scope="col" className="py-3.5 px-3">Review Status</th>
                      <th scope="col" className="py-3.5 px-3">AI Confidence</th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {scrutinyQueue.map((rec) => (
                      <tr
                        key={rec.id}
                        onClick={() => onSelectFDR(rec.id)}
                        className="hover:bg-stone-50/70 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="font-mono text-xs font-semibold text-slate-900 group-hover:text-teal-900 transition-colors">
                            {rec.referenceNo}
                          </div>
                          <div className="font-medium text-slate-800 text-[11px] truncate max-w-xs mt-0.5">
                            {rec.institutionName}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <BankLogoBadge bankName={rec.bankName} size="xs" />
                            <span className="text-[10px] text-stone-500 font-mono">ID: {rec.aictePermanentId}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-mono font-semibold text-slate-900">
                            {formatIndianCurrency(rec.amount)}
                          </div>
                          <div className="text-[10px] text-stone-500 font-sans mt-0.5">
                            {rec.submittedVsVerified.amount.status === 'MATCHED'
                              ? '✓ Core Banking Matched'
                              : '⏳ Branch Feed Pending'}
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          {rec.scrutinyStatus === 'DISCREPANCY' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-sm bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 border border-rose-200">
                              <AlertCircle className="h-3 w-3 text-rose-600" />
                              Tripartite Discrepancy
                            </span>
                          ) : rec.daysToMaturity <= 30 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-sm bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200">
                              <Clock className="h-3 w-3 text-amber-600" />
                              Expiring in {rec.daysToMaturity}d
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-sm bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-800 border border-teal-200">
                              <ShieldCheck className="h-3 w-3 text-teal-700" />
                              Branch SFMS Staged
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`rounded-sm px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider ${
                              rec.scrutinyStatus === 'DISCREPANCY'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {rec.scrutinyStatus.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="font-mono text-slate-800 font-semibold">
                            {rec.riskLevel === 'HIGH' ? '78%' : rec.riskLevel === 'MEDIUM' ? '88%' : '98%'}
                          </span>
                          <span className="text-[10px] text-stone-400 block font-sans">Simulated Heuristic</span>
                        </td>

                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectFDR(rec.id);
                            }}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-xs"
                          >
                            <span>Inspect & Scrutinize</span>
                            <ChevronRight className="h-3 w-3 text-stone-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= TAB 2: RISK OVERVIEW & EXPLAINABLE RISK ================= */
        <div className="space-y-6">
          {/* Executive Intelligence Overview */}
          <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2.5 border-b border-stone-200/80 pb-3">
              <Brain className="h-5 w-5 text-teal-800" />
              <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                Risk Overview & Explainable Compliance Models
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans max-w-4xl">
              FDR Sentinel AI evaluates multiple statutory risk dimensions: <strong>Maturity Horizon Proximity</strong>, <strong>Scheduled Bank Endorsement Validity</strong>, <strong>Tripartite Lien Formatting</strong>, and <strong>Core Banking Reconciliation Status</strong>. Below are the highest priority risk-weighted deposits requiring regulatory action.
            </p>

            {/* Risk Factor Architecture Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
              <div className="rounded-lg border border-stone-200/80 bg-stone-50/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Dimension 1: Maturity Decay</span>
                  <span className="text-rose-800 font-mono text-[11px]">Weight: 40%</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Evaluates calendar days remaining against mandatory 30-day notice and 5-year minimum tenure rules.
                </p>
              </div>

              <div className="rounded-lg border border-stone-200/80 bg-stone-50/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Dimension 2: Tripartite Lien Clause</span>
                  <span className="text-amber-800 font-mono text-[11px]">Weight: 35%</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  OCR regex parsing for exact joint pledge phrasing in favor of Regional Officer, AICTE.
                </p>
              </div>

              <div className="rounded-lg border border-stone-200/80 bg-stone-50/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Dimension 3: Bank Branch Handshake</span>
                  <span className="text-teal-800 font-mono text-[11px]">Weight: 25%</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Branch IFSC validation against RBI scheduled commercial bank databases and SFMS verification status.
                </p>
              </div>
            </div>
          </div>

          {/* Prioritized Cases Ranked by AI Risk Score */}
          <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
              <div>
                <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                  Top Priority Cases (Ranked by Risk Score)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Deposit cases exhibiting the highest need for council intervention, renewal notice dispatch, or endorsement reconciliation.
                </p>
              </div>
              <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                Top {prioritizedIntelligenceCases.length} Critical Entities
              </span>
            </div>

            <div className="space-y-4">
              {prioritizedIntelligenceCases.map((rec, index) => (
                <div
                  key={rec.id}
                  className="rounded border border-slate-200 p-4 bg-slate-50/30 hover:bg-slate-50 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-800">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">
                            {rec.institutionName}
                          </span>
                          <span className="font-mono text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {rec.referenceNo}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mt-1">
                          <BankLogoBadge bankName={rec.bankName} size="xs" />
                          <span>AICTE ID: {rec.aictePermanentId} • {rec.regionalOffice} • State: {rec.state}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-600 uppercase">Risk Score</div>
                        <div className="font-mono text-base font-bold text-slate-900">
                          {rec.riskScore}/100
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectFDR(rec.id)}
                        className="inline-flex items-center gap-1.5 rounded bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 transition-colors"
                      >
                        <span>Open Dossier</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Explainable factors for this record */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-600 font-semibold block mb-1">
                        Primary Identified Risk Factors:
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {rec.riskFactors.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-600 font-bold">•</span>
                            <span>
                              <strong>{f.factor}:</strong> {f.evidence}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-slate-600 font-semibold block mb-1">
                        Recommended Regulatory Next Actions:
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {rec.recommendedActions.slice(0, 2).map((a, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-teal-700 font-bold">→</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
