import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Landmark,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  FDRRecord,
  SAMPLE_FDR_DATASET,
  formatIndianCurrency,
  formatIndianDate,
} from '../../data/fdrData.ts';
import { BankLogoBadge } from '../visuals/BankLogoBadge.tsx';

interface RenewalsPageProps {
  dataset: FDRRecord[];
  onSelectFDR: (fdrId: string) => void;
  onUpdateFDR?: (updated: FDRRecord) => void;
}

export const RenewalsPage: React.FC<RenewalsPageProps> = ({
  dataset = SAMPLE_FDR_DATASET,
  onSelectFDR,
  onUpdateFDR,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING' | 'RENEWED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract renewal cases: those expiring soon, matured, or already renewed
  const renewalCases = useMemo(() => {
    return dataset
      .filter((r) => {
        const isRenewalRelevant =
          r.status === 'EXPIRING_SOON' ||
          r.status === 'MATURED' ||
          r.status === 'RENEWED' ||
          r.daysToMaturity <= 60;

        if (!isRenewalRelevant) return false;

        if (filterMode === 'PENDING' && r.status === 'RENEWED') return false;
        if (filterMode === 'RENEWED' && r.status !== 'RENEWED') return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesRef = r.referenceNo.toLowerCase().includes(q);
          const matchesInst = r.institutionName.toLowerCase().includes(q);
          const matchesBank = r.bankName.toLowerCase().includes(q);
          if (!matchesRef && !matchesInst && !matchesBank) return false;
        }

        return true;
      })
      .sort((a, b) => a.daysToMaturity - b.daysToMaturity);
  }, [dataset, filterMode, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner (Editorial Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-stone-100/80 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-stone-700 border border-stone-200/70">
            <RefreshCw className="h-3 w-3 text-teal-800" />
            <span>AICTE Pledging Pipeline</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">Tenure Extensions</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            FDR Renewal & Replacement Management
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl font-sans">
            Endorsement renewals, extension tracking, and lineage chaining of predecessor and successor deposit certificates.
          </p>
        </div>

        <div className="flex items-center rounded-md border border-stone-200/90 bg-stone-100/80 p-1 text-xs font-medium shadow-xs">
          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`rounded-md px-3.5 py-1.5 transition-all ${
              filterMode === 'ALL'
                ? 'bg-white text-slate-950 font-semibold shadow-xs border border-stone-200/80'
                : 'text-stone-600 hover:text-slate-900'
            }`}
          >
            All Cases
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('PENDING')}
            className={`rounded-md px-3.5 py-1.5 transition-all ${
              filterMode === 'PENDING'
                ? 'bg-white text-slate-950 font-semibold shadow-xs border border-stone-200/80'
                : 'text-stone-600 hover:text-slate-900'
            }`}
          >
            Pending Extension
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('RENEWED')}
            className={`rounded-md px-3.5 py-1.5 transition-all ${
              filterMode === 'RENEWED'
                ? 'bg-white text-slate-950 font-semibold shadow-xs border border-stone-200/80'
                : 'text-stone-600 hover:text-slate-900'
            }`}
          >
            Confirmed
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-lg border border-stone-200/90 bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search renewals by institution, ref, or bank..."
            className="w-full rounded-md border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 focus:outline-hidden transition-all"
          />
        </div>

        <span className="font-mono text-xs text-stone-500">
          Tracking <strong className="text-slate-900 font-semibold font-sans">{renewalCases.length}</strong> renewal chains
        </span>
      </div>

      {/* Renewals Table */}
      <div className="rounded-lg border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {renewalCases.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No renewal cases match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                  <th scope="col" className="py-3 px-4">Institution & Sponsoring Society</th>
                  <th scope="col" className="py-3 px-3">Original / Predecessor Instrument</th>
                  <th scope="col" className="py-3 px-3">Linked Successor Chain</th>
                  <th scope="col" className="py-3 px-3 text-right">Principal Amount</th>
                  <th scope="col" className="py-3 px-3">Maturity Horizon</th>
                  <th scope="col" className="py-3 px-3">Renewal Status</th>
                  <th scope="col" className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {renewalCases.map((rec) => {
                  const isRenewed = rec.status === 'RENEWED';
                  const successorRef = isRenewed
                    ? `${rec.referenceNo}-R1`
                    : 'Pending Receipt Submission';

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => onSelectFDR(rec.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-teal-900">
                          {rec.institutionName}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <BankLogoBadge bankName={rec.bankName} size="xs" />
                          <span className="text-[10px] text-stone-500 font-mono">ID: {rec.aictePermanentId}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                        {rec.referenceNo}
                        <div className="text-[10px] text-slate-500 font-sans">
                          Issued: {formatIndianDate(rec.issueDate, 'short')}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {isRenewed ? (
                          <div className="font-mono text-emerald-800 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>{successorRef}</span>
                          </div>
                        ) : (
                          <div className="text-slate-500 italic text-[11px]">
                            {successorRef}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500">
                          {isRenewed ? 'Extended 5-Year Tenure' : 'Extension Notice Dispatched'}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-900 text-right whitespace-nowrap">
                        {formatIndianCurrency(rec.amount)}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono text-slate-900">
                          {formatIndianDate(rec.maturityDate, 'short')}
                        </div>
                        <div
                          className={`text-[10px] font-semibold ${
                            rec.daysToMaturity < 0
                              ? 'text-rose-700'
                              : rec.daysToMaturity <= 30
                              ? 'text-amber-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {rec.daysToMaturity < 0
                            ? `${Math.abs(rec.daysToMaturity)}d overdue`
                            : `${rec.daysToMaturity}d remaining`}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {isRenewed ? (
                          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800 border border-blue-200">
                            <CheckCircle2 className="h-3 w-3 text-blue-600" />
                            Renewed & Extended
                          </span>
                        ) : rec.daysToMaturity < 0 ? (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-800 border border-rose-200">
                            <AlertTriangle className="h-3 w-3 text-rose-600" />
                            Overdue Renewal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                            <Clock className="h-3 w-3 text-amber-600" />
                            Renewal Due Soon
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFDR(rec.id);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-teal-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-teal-800"
                        >
                          <span>FDR Dossier</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
