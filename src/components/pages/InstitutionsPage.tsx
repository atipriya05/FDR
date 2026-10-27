import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Landmark,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  X,
  FileText,
  Filter,
} from 'lucide-react';
import {
  FDRRecord,
  SAMPLE_FDR_DATASET,
  formatIndianCurrency,
  formatIndianDate,
} from '../../data/fdrData.ts';

interface InstitutionsPageProps {
  dataset: FDRRecord[];
  onSelectFDR: (fdrId: string) => void;
}

interface InstitutionSummary {
  aicteId: string;
  name: string;
  state: string;
  regionalOffice: string;
  totalFDRs: number;
  totalPledgedAmount: number;
  activeFDRs: number;
  expiringFDRs: number;
  pendingFDRs: number;
  status: 'COMPLIANT' | 'NEEDS_ATTENTION' | 'PENDING_SCRUTINY';
  records: FDRRecord[];
}

export const InstitutionsPage: React.FC<InstitutionsPageProps> = ({
  dataset = SAMPLE_FDR_DATASET,
  onSelectFDR,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [inspectingInstitution, setInspectingInstitution] =
    useState<InstitutionSummary | null>(null);

  // Group FDR records by Institution AICTE ID
  const institutionSummaries = useMemo<InstitutionSummary[]>(() => {
    const map = new Map<string, InstitutionSummary>();

    dataset.forEach((record) => {
      const key = record.aictePermanentId;
      if (!map.has(key)) {
        map.set(key, {
          aicteId: record.aictePermanentId,
          name: record.institutionName,
          state: record.state,
          regionalOffice: record.regionalOffice,
          totalFDRs: 0,
          totalPledgedAmount: 0,
          activeFDRs: 0,
          expiringFDRs: 0,
          pendingFDRs: 0,
          status: 'COMPLIANT',
          records: [],
        });
      }

      const summary = map.get(key)!;
      summary.totalFDRs += 1;
      summary.totalPledgedAmount += record.amount;
      summary.records.push(record);

      if (record.status === 'ACTIVE' || record.status === 'RENEWED') {
        summary.activeFDRs += 1;
      } else if (record.status === 'EXPIRING_SOON' || record.status === 'MATURED') {
        summary.expiringFDRs += 1;
      } else if (record.status === 'PENDING_VERIFICATION') {
        summary.pendingFDRs += 1;
      }
    });

    // Derive compliance status
    return Array.from(map.values()).map((inst) => {
      let status: InstitutionSummary['status'] = 'COMPLIANT';
      if (inst.expiringFDRs > 0) {
        status = 'NEEDS_ATTENTION';
      } else if (inst.pendingFDRs > 0) {
        status = 'PENDING_SCRUTINY';
      }
      return { ...inst, status };
    });
  }, [dataset]);

  // Extract unique regions for filter
  const uniqueRegions = useMemo(() => {
    const set = new Set<string>();
    institutionSummaries.forEach((i) => set.add(i.regionalOffice));
    return Array.from(set).sort();
  }, [institutionSummaries]);

  // Filter institutions
  const filteredInstitutions = useMemo(() => {
    return institutionSummaries.filter((inst) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = inst.name.toLowerCase().includes(q);
        const matchesId = inst.aicteId.toLowerCase().includes(q);
        const matchesState = inst.state.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesState) return false;
      }

      if (selectedRegion !== 'ALL' && inst.regionalOffice !== selectedRegion) {
        return false;
      }

      if (selectedStatus !== 'ALL' && inst.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [institutionSummaries, searchQuery, selectedRegion, selectedStatus]);

  const renderStatusBadge = (status: InstitutionSummary['status']) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Compliant
          </span>
        );
      case 'NEEDS_ATTENTION':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            Renewal Due
          </span>
        );
      case 'PENDING_SCRUTINY':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800 border border-teal-200">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
            Verification Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner (Editorial Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-stone-100/80 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-stone-700 border border-stone-200/70">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-700" />
            <span>AICTE Statutory Directory</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">Approved Institutions</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Approved Technical Institutions
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl font-sans">
            Master register of technical universities, engineering colleges, and polytechnics maintaining statutory security deposit covenants under AICTE regulations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-md border border-stone-200/80 bg-stone-50 px-3.5 py-2 font-mono text-xs text-stone-700 shadow-xs">
            Entities Monitored: <strong className="text-slate-900 font-semibold">{institutionSummaries.length}</strong>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Search bar */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by institution name, AICTE ID, or state..."
              className="w-full rounded-md border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-stone-400 focus:bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 focus:outline-hidden transition-all"
            />
          </div>

          {/* Region filter */}
          <div className="md:col-span-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full rounded-md border border-stone-200 bg-white p-2.5 text-xs text-slate-900 focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 focus:outline-hidden transition-colors"
            >
              <option value="ALL">All Regional Offices</option>
              {uniqueRegions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-md border border-stone-200 bg-white p-2.5 text-xs text-slate-900 focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 focus:outline-hidden transition-colors"
            >
              <option value="ALL">All Compliance States</option>
              <option value="COMPLIANT">Fully Compliant</option>
              <option value="NEEDS_ATTENTION">Renewal Due / Expiring</option>
              <option value="PENDING_SCRUTINY">Verification Pending</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-stone-500 pt-2 border-t border-stone-100 flex items-center justify-between font-mono">
          <span>
            Showing <strong className="text-slate-900 font-semibold">{filteredInstitutions.length}</strong> of {institutionSummaries.length} institutions
          </span>
          {(searchQuery || selectedRegion !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-teal-800 hover:underline font-medium font-sans"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Institutions Table */}
      <div className="rounded-lg border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {filteredInstitutions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No institutions match the selected search or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                  <th scope="col" className="py-3 px-4 sm:px-6">Institution Details</th>
                  <th scope="col" className="py-3 px-3">Permanent ID</th>
                  <th scope="col" className="py-3 px-3">Location & Regional Council</th>
                  <th scope="col" className="py-3 px-3 text-right">Total Pledged Corpus</th>
                  <th scope="col" className="py-3 px-3 text-center">FDRs</th>
                  <th scope="col" className="py-3 px-3">Status</th>
                  <th scope="col" className="py-3 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInstitutions.map((inst) => (
                  <tr
                    key={inst.aicteId}
                    onClick={() => setInspectingInstitution(inst)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900 group-hover:text-teal-900 transition-colors">
                        {inst.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        State: {inst.state}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-800 whitespace-nowrap">
                      {inst.aicteId}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{inst.regionalOffice}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {inst.state}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-900 text-right whitespace-nowrap">
                      {formatIndianCurrency(inst.totalPledgedAmount)}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {inst.totalFDRs}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {renderStatusBadge(inst.status)}
                    </td>

                    <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingInstitution(inst);
                        }}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 group-hover:border-slate-300 transition-colors"
                      >
                        <span>View Details</span>
                        <ExternalLink className="h-3 w-3 text-slate-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Institution Detail Dossier Modal */}
      {inspectingInstitution && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-3xl rounded border border-slate-200 bg-white shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded border border-slate-200 bg-white text-teal-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {inspectingInstitution.name}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>AICTE ID: <strong className="font-mono text-slate-800">{inspectingInstitution.aicteId}</strong></span>
                    <span>•</span>
                    <span>{inspectingInstitution.regionalOffice}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingInstitution(null)}
                className="rounded p-1 text-slate-500 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded border border-slate-200 bg-slate-50/50 p-3">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 block">Total Corpus</span>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {formatIndianCurrency(inspectingInstitution.totalPledgedAmount)}
                  </div>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50/50 p-3">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 block">Registered Deposits</span>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {inspectingInstitution.totalFDRs} Certificates
                  </div>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50/50 p-3">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 block">Compliance Status</span>
                  <div className="mt-1">
                    {renderStatusBadge(inspectingInstitution.status)}
                  </div>
                </div>
              </div>

              {/* Linked FDR Records List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                  Linked Fixed Deposit Receipts ({inspectingInstitution.records.length})
                </h4>

                <div className="space-y-2.5">
                  {inspectingInstitution.records.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded border border-slate-200 bg-white hover:bg-slate-50/80 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-900">
                            {rec.referenceNo}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700">
                            {rec.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          Bank: {rec.bankName} ({rec.branchName}) • Amount: <strong>{formatIndianCurrency(rec.amount)}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Maturity: {formatIndianDate(rec.maturityDate, 'short')} ({rec.daysToMaturity < 0 ? `${Math.abs(rec.daysToMaturity)}d overdue` : `${rec.daysToMaturity}d left`})
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setInspectingInstitution(null);
                          onSelectFDR(rec.id);
                        }}
                        className="inline-flex items-center gap-1.5 rounded bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 transition-colors self-start sm:self-center shrink-0"
                      >
                        <span>Open FDR Dossier</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-3">
              <button
                type="button"
                onClick={() => setInspectingInstitution(null)}
                className="rounded border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
