import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowRight,
  Bell,
  Mail,
} from 'lucide-react';
import {
  FDRRecord,
  SAMPLE_FDR_DATASET,
  TimelineEvent,
  SYSTEM_TODAY_DATE,
  formatIndianCurrency,
  formatIndianDate,
} from '../../data/fdrData.ts';
import { BankLogoBadge } from '../visuals/BankLogoBadge.tsx';

interface DeadlinesPageProps {
  dataset: FDRRecord[];
  onSelectFDR: (fdrId: string) => void;
  onUpdateFDR?: (updated: FDRRecord) => void;
}

type UrgencyFilter =
  | 'ALL'
  | 'OVERDUE'
  | 'CRITICAL_15'
  | 'URGENT_30'
  | 'APPROACHING_90'
  | 'CURRENT_FY';

export const DeadlinesPage: React.FC<DeadlinesPageProps> = ({
  dataset = SAMPLE_FDR_DATASET,
  onSelectFDR,
  onUpdateFDR,
}) => {
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dispatchNoticeSuccess, setDispatchNoticeSuccess] = useState<string | null>(null);

  // Dynamic statistics calculated from dates
  const deadlineMetrics = useMemo(() => {
    // Ignore already released deposits
    const activePool = dataset.filter((r) => r.status !== 'RELEASED');

    const overdue = activePool.filter((r) => r.daysToMaturity < 0);
    const critical15 = activePool.filter((r) => r.daysToMaturity >= 0 && r.daysToMaturity <= 15);
    const urgent30 = activePool.filter((r) => r.daysToMaturity > 15 && r.daysToMaturity <= 30);
    const upcoming90 = activePool.filter((r) => r.daysToMaturity > 30 && r.daysToMaturity <= 90);

    const totalAtRiskAmount = [...overdue, ...critical15, ...urgent30].reduce(
      (sum, r) => sum + r.amount,
      0
    );

    return {
      overdueCount: overdue.length,
      overdueAmount: overdue.reduce((sum, r) => sum + r.amount, 0),
      criticalCount: critical15.length,
      urgentCount: urgent30.length,
      upcoming90Count: upcoming90.length,
      totalAtRiskAmount,
    };
  }, [dataset]);

  // Filtered list
  const filteredRecords = useMemo(() => {
    return dataset
      .filter((r) => r.status !== 'RELEASED')
      .filter((r) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesRef = r.referenceNo.toLowerCase().includes(q);
          const matchesInst = r.institutionName.toLowerCase().includes(q);
          const matchesBank = r.bankName.toLowerCase().includes(q);
          if (!matchesRef && !matchesInst && !matchesBank) return false;
        }

        const days = r.daysToMaturity;
        switch (urgencyFilter) {
          case 'OVERDUE':
            return days < 0;
          case 'CRITICAL_15':
            return days >= 0 && days <= 15;
          case 'URGENT_30':
            return days >= 0 && days <= 30;
          case 'APPROACHING_90':
            return days > 30 && days <= 90;
          case 'CURRENT_FY':
            return days >= 0 && days <= 160;
          default:
            return true;
        }
      })
      .sort((a, b) => a.daysToMaturity - b.daysToMaturity);
  }, [dataset, searchQuery, urgencyFilter]);

  const handleDispatchStatutoryNotice = (fdr: FDRRecord) => {
    if (onUpdateFDR) {
      const newTimelineEvent: TimelineEvent = {
        id: `time-notice-${Date.now()}`,
        timestamp: `${formatIndianDate(SYSTEM_TODAY_DATE, 'short')}, 05:20 PM`,
        actor: 'Shri R. K. Sharma (Scrutiny Officer)',
        action: 'Statutory Pre-Maturity Directive Dispatched',
        details: `Official pre-maturity renewal directive dispatched to "${fdr.institutionName}" for FDR Ref: ${fdr.referenceNo}.`,
        type: 'SCRUTINY',
      };
      onUpdateFDR({
        ...fdr,
        timeline: [newTimelineEvent, ...fdr.timeline],
      });
    }

    setDispatchNoticeSuccess(
      `Statutory pre-maturity directive recorded & dispatched to Registrar of "${fdr.institutionName}" (Ref: ${fdr.referenceNo}).`
    );
    setTimeout(() => {
      setDispatchNoticeSuccess(null);
    }, 4500);
  };

  const renderUrgencyBadge = (days: number) => {
    if (days < 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800 border border-rose-300">
          <AlertTriangle className="h-3 w-3 text-rose-700" />
          {Math.abs(days)}d Overdue
        </span>
      );
    }
    if (days <= 15) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
          <AlertCircle className="h-3 w-3 text-rose-600" />
          Critical ({days}d)
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
          <Clock className="h-3 w-3 text-amber-600" />
          Urgent ({days}d)
        </span>
      );
    }
    if (days <= 90) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
          Approaching ({days}d)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">
        Compliant ({days}d)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Editorial Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-stone-100/80 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-stone-700 border border-stone-200/70">
            <CalendarClock className="h-3 w-3 text-teal-800" />
            <span>Maturity Horizon & Statutory Deadlines</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">Notice Surveillance</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Deadlines
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-normal max-w-3xl font-sans">
            Monitor upcoming maturities, pre-maturity notice thresholds, and renewal timelines.
          </p>
        </div>

        <div className="rounded-md border border-stone-200/80 bg-stone-50 px-3.5 py-2 font-mono text-xs text-stone-700 shadow-xs">
          Reference Date: <strong className="text-slate-900 font-semibold">26 Oct 2026</strong>
        </div>
      </div>

      {/* Notice Success Toast */}
      {dispatchNoticeSuccess && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
          <span className="font-medium">{dispatchNoticeSuccess}</span>
        </div>
      )}

      {/* 4 Urgency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 text-xs">
        <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-stone-500">
            <span>Overdue Pledges</span>
            <AlertTriangle className="h-4 w-4 text-rose-700" />
          </div>
          <div className="font-serif text-3xl font-semibold text-rose-800 mt-2.5">
            {deadlineMetrics.overdueCount}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-sans">
            {formatIndianCurrency(deadlineMetrics.overdueAmount, true)} past maturity
          </div>
        </div>

        <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-stone-500">
            <span>Critical (&le; 15 Days)</span>
            <AlertCircle className="h-4 w-4 text-rose-700" />
          </div>
          <div className="font-serif text-3xl font-semibold text-slate-900 mt-2.5">
            {deadlineMetrics.criticalCount}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-sans">
            Statutory show-cause notice horizon
          </div>
        </div>

        <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-stone-500">
            <span>Urgent (16–30 Days)</span>
            <Clock className="h-4 w-4 text-amber-700" />
          </div>
          <div className="font-serif text-3xl font-semibold text-slate-900 mt-2.5">
            {deadlineMetrics.urgentCount}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-sans">
            Automated 30-day pre-maturity cycle
          </div>
        </div>

        <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-stone-500">
            <span>At-Risk Capital</span>
            <CalendarClock className="h-4 w-4 text-teal-800" />
          </div>
          <div className="font-serif text-3xl font-semibold text-teal-800 mt-2.5">
            {formatIndianCurrency(deadlineMetrics.totalAtRiskAmount, true)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-sans">
            Maturing in next 30 days or overdue
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-stone-200/90 bg-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deadlines by institution, FDR ref, or bank..."
            className="w-full rounded-md border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 focus:outline-hidden transition-all"
          />
        </div>

        {/* Urgency Filter Dropdown */}
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">Urgency:</span>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as UrgencyFilter)}
            className="rounded-md border border-stone-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 focus:outline-hidden transition-colors font-sans"
          >
            <option value="ALL">All Deadlines ({dataset.length})</option>
            <option value="OVERDUE">Overdue / Expired ({deadlineMetrics.overdueCount})</option>
            <option value="CRITICAL_15">Critical (&le; 15 Days)</option>
            <option value="URGENT_30">Urgent (&le; 30 Days)</option>
            <option value="APPROACHING_90">Upcoming Quarter (31–90 Days)</option>
            <option value="CURRENT_FY">Current Academic Year (AY 2026-27)</option>
          </select>
        </div>
      </div>

      {/* Deadlines Master Table */}
      <div className="rounded-lg border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No deadlines match the selected urgency filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                  <th scope="col" className="py-3 px-4">Institution & ID</th>
                  <th scope="col" className="py-3 px-3">FDR Reference</th>
                  <th scope="col" className="py-3 px-3">Scheduled Bank</th>
                  <th scope="col" className="py-3 px-3 text-right">Amount (₹)</th>
                  <th scope="col" className="py-3 px-3">Due Date</th>
                  <th scope="col" className="py-3 px-3">Days Remaining</th>
                  <th scope="col" className="py-3 px-4 text-right">Council Directives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => onSelectFDR(r.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-teal-900">
                        {r.institutionName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ID: {r.aictePermanentId} • {r.regionalOffice}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {r.referenceNo}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <BankLogoBadge bankName={r.bankName} size="sm" />
                      <div className="text-[10px] text-stone-500 mt-0.5">{r.branchName}</div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-900 text-right whitespace-nowrap">
                      {formatIndianCurrency(r.amount)}
                    </td>

                    <td className="py-3 px-3 font-mono whitespace-nowrap">
                      {formatIndianDate(r.maturityDate, 'short')}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {renderUrgencyBadge(r.daysToMaturity)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {r.daysToMaturity <= 30 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDispatchStatutoryNotice(r);
                            }}
                            className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100"
                            title="Send registered 15-day pre-maturity directive"
                          >
                            <Mail className="h-3 w-3" />
                            <span>Dispatch Notice</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFDR(r.id);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-teal-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-teal-800"
                        >
                          <span>Dossier</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
