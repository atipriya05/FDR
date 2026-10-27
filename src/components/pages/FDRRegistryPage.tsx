import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  SearchX,
} from 'lucide-react';
import {
  FDRRecord,
  FDRStatus,
  FDRRiskLevel,
  SAMPLE_FDR_DATASET,
  formatIndianCurrency,
  formatIndianDate,
} from '../../data/fdrData.ts';
import { AddNewFDRForm } from '../forms/AddNewFDRForm.tsx';
import { FDRDetailModal } from '../fdr/FDRDetailModal.tsx';
import { NavViewId } from '../../types/navigation.ts';
import { BankLogoBadge } from '../visuals/BankLogoBadge.tsx';

interface FDRRegistryPageProps {
  onNavigate: (viewId: NavViewId) => void;
  dataset?: FDRRecord[];
  onSelectFDR?: (fdrId: string) => void;
  onAddFDR?: (newRecord: FDRRecord) => void;
}

type SortKey =
  | 'referenceNo'
  | 'institutionName'
  | 'bankName'
  | 'amount'
  | 'issueDate'
  | 'maturityDate'
  | 'riskLevel';

type MaturityPeriodFilter =
  | 'ALL'
  | 'EXPIRING_30'
  | 'EXPIRING_90'
  | 'CURRENT_AY'
  | 'MATURED_OVERDUE';

export const FDRRegistryPage: React.FC<FDRRegistryPageProps> = ({
  onNavigate,
  dataset = SAMPLE_FDR_DATASET,
  onSelectFDR,
  onAddFDR,
}) => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedMaturityPeriod, setSelectedMaturityPeriod] =
    useState<MaturityPeriodFilter>('ALL');

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>('maturityDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected FDR for detail inspection modal fallback
  const [selectedFDR, setSelectedFDR] = useState<FDRRecord | null>(null);

  // Mode: registry table or "Add New FDR" placeholder submission page
  const [isAddingNewFDR, setIsAddingNewFDR] = useState(false);

  // Check if any filters are active
  const isFiltered =
    searchQuery.trim().length > 0 ||
    selectedStatus !== 'ALL' ||
    selectedRisk !== 'ALL' ||
    selectedMaturityPeriod !== 'ALL';

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedRisk('ALL');
    setSelectedMaturityPeriod('ALL');
    setCurrentPage(1);
  };

  // Toggle sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter dataset
  const filteredData = useMemo(() => {
    return dataset.filter((record) => {
      // 1. Search filter: referenceNo, institutionName, or bankName
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesRef = record.referenceNo.toLowerCase().includes(query);
        const matchesInst = record.institutionName.toLowerCase().includes(query);
        const matchesBank = record.bankName.toLowerCase().includes(query);
        const matchesState = record.state.toLowerCase().includes(query);

        if (!matchesRef && !matchesInst && !matchesBank && !matchesState) {
          return false;
        }
      }

      // 2. Status filter
      if (selectedStatus !== 'ALL' && record.status !== selectedStatus) {
        return false;
      }

      // 3. Risk filter
      if (selectedRisk !== 'ALL' && record.riskLevel !== selectedRisk) {
        return false;
      }

      // 4. Maturity Period filter
      if (selectedMaturityPeriod !== 'ALL') {
        const days = record.daysToMaturity;
        if (selectedMaturityPeriod === 'EXPIRING_30' && (days < 0 || days > 30)) {
          return false;
        }
        if (selectedMaturityPeriod === 'EXPIRING_90' && (days < 0 || days > 90)) {
          return false;
        }
        if (selectedMaturityPeriod === 'MATURED_OVERDUE' && days >= 0) {
          return false;
        }
        if (selectedMaturityPeriod === 'CURRENT_AY') {
          const matYear = new Date(record.maturityDate).getFullYear();
          const matMonth = new Date(record.maturityDate).getMonth();
          const isBeforeAYEnd = matYear < 2027 || (matYear === 2027 && matMonth <= 2);
          if (!isBeforeAYEnd) return false;
        }
      }

      return true;
    });
  }, [
    dataset,
    searchQuery,
    selectedStatus,
    selectedRisk,
    selectedMaturityPeriod,
  ]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'referenceNo':
          comparison = a.referenceNo.localeCompare(b.referenceNo);
          break;
        case 'institutionName':
          comparison = a.institutionName.localeCompare(b.institutionName);
          break;
        case 'bankName':
          comparison = a.bankName.localeCompare(b.bankName);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'issueDate':
          comparison = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
          break;
        case 'maturityDate':
          comparison = new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime();
          break;
        case 'riskLevel': {
          const weight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          comparison = (weight[a.riskLevel] || 0) - (weight[b.riskLevel] || 0);
          break;
        }
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate sorted data
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Restrained Status Badge Component
  const renderStatusBadge = (status: FDRStatus, days: number) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Active
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-800 border border-teal-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
            Pending Verification
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            Expiring ({days}d)
          </span>
        );
      case 'MATURED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 border border-rose-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            Matured
          </span>
        );
      case 'RENEWED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800 border border-sky-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
            Renewed
          </span>
        );
      case 'RELEASED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Released
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Restrained Risk Badge Component
  const renderRiskBadge = (risk: FDRRiskLevel) => {
    switch (risk) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 border border-rose-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Low
          </span>
        );
    }
  };

  // Render Sort Header Column Helper
  const renderSortHeader = (label: string, key: SortKey, align: 'left' | 'right' = 'left') => {
    const isSorted = sortKey === key;
    return (
      <th
        scope="col"
        onClick={() => handleSort(key)}
        className={`py-3.5 px-3 cursor-pointer select-none font-mono text-[10px] uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors ${
          align === 'right' ? 'text-right' : 'text-left'
        }`}
      >
        <div
          className={`inline-flex items-center gap-1.5 ${
            align === 'right' ? 'justify-end w-full' : ''
          }`}
        >
          <span>{label}</span>
          {isSorted ? (
            sortDirection === 'asc' ? (
              <ArrowUp className="h-3 w-3 text-teal-800" />
            ) : (
              <ArrowDown className="h-3 w-3 text-teal-800" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-slate-300 opacity-60" />
          )}
        </div>
      </th>
    );
  };

  // If user navigated to "Add New FDR", render the active submission form
  if (isAddingNewFDR) {
    return (
      <AddNewFDRForm
        onCancel={() => setIsAddingNewFDR(false)}
        onSubmitSuccess={(newRecord) => {
          setIsAddingNewFDR(false);
          if (onAddFDR) {
            onAddFDR(newRecord);
          } else if (onSelectFDR) {
            onSelectFDR(newRecord.id);
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Detail Dossier Modal */}
      <FDRDetailModal
        fdr={selectedFDR}
        isOpen={Boolean(selectedFDR)}
        onClose={() => setSelectedFDR(null)}
        onNavigate={onNavigate}
      />

      {/* Top Banner / Master Registry Header (Editorial Style) */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="text-teal-800 font-semibold uppercase tracking-wider text-[11px]">AICTE National Repository</span>
              <span>·</span>
              <span>{dataset.length} Registered Deposits</span>
              <span>·</span>
              <span>Statutory Oversight</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
                FDR Master Registry
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-normal font-sans">
              Central register of statutory fixed deposit pledges, bank endorsements, and tripartite covenants.
            </p>
          </div>

          {/* Action Button: Add New FDR */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsAddingNewFDR(true)}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 shadow-xs transition-colors border border-slate-900"
            >
              <Plus className="h-4 w-4 text-teal-300" />
              <span>Add New FDR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        {/* Search bar row */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by FDR reference number, institution name, bank, or state..."
            className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-12 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 focus:outline-hidden transition-all font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3 border-t border-slate-100">
          {/* Status Filter */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
              Deposit Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 focus:outline-hidden transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active FDRs</option>
              <option value="PENDING_VERIFICATION">Awaiting Review</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="MATURED">Matured / Overdue</option>
              <option value="RENEWED">Renewed</option>
              <option value="RELEASED">Released</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
              Risk Assessment
            </label>
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 focus:outline-hidden transition-colors"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          {/* Maturity Period Filter */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
              Maturity Horizon
            </label>
            <select
              value={selectedMaturityPeriod}
              onChange={(e) => {
                setSelectedMaturityPeriod(e.target.value as MaturityPeriodFilter);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 focus:outline-hidden transition-colors"
            >
              <option value="ALL">All Horizons</option>
              <option value="EXPIRING_30">Expiring Within 30 Days</option>
              <option value="EXPIRING_90">Expiring Within 90 Days</option>
              <option value="CURRENT_AY">Current Academic Year (by Mar 2027)</option>
              <option value="MATURED_OVERDUE">Matured / Overdue</option>
            </select>
          </div>

          {/* Reset Filters Action */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!isFiltered}
              className={`inline-flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-all ${
                isFiltered
                  ? 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs'
                  : 'border-slate-200/60 bg-slate-50/50 text-slate-400 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Summary Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500 font-mono">
          <div>
            Showing <strong className="font-semibold text-slate-900">{filteredData.length}</strong> of {dataset.length} records
            {isFiltered && <span className="ml-1.5 text-teal-800 font-medium font-sans">(Filtered)</span>}
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-teal-800 hover:underline font-medium font-sans"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Master Data Table Container */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {paginatedData.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 mb-3">
              <SearchX className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="font-serif text-base font-semibold text-slate-900">
              No FDR records found matching criteria
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
              {searchQuery
                ? `No deposits matched "${searchQuery}". Try revising the search terms or clearing the active filters.`
                : 'No deposits match the selected filter combinations.'}
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  {renderSortHeader('FDR Reference', 'referenceNo')}
                  {renderSortHeader('Institution Name', 'institutionName')}
                  {renderSortHeader('Scheduled Bank', 'bankName')}
                  {renderSortHeader('Amount (₹)', 'amount', 'right')}
                  {renderSortHeader('Issue Date', 'issueDate')}
                  {renderSortHeader('Due Date', 'maturityDate')}
                  {renderSortHeader('Risk', 'riskLevel')}
                  <th scope="col" className="py-3.5 px-3 font-mono text-[10px] uppercase tracking-wider text-slate-600">
                    Status
                  </th>
                  <th scope="col" className="py-3.5 px-4 sm:px-6 text-right font-mono text-[10px] uppercase tracking-wider text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => {
                      if (onSelectFDR) {
                        onSelectFDR(record.id);
                      } else {
                        setSelectedFDR(record);
                      }
                    }}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                  >
                    {/* Reference No */}
                    <td className="py-3.5 px-3 font-mono text-xs text-slate-900 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 group-hover:text-teal-900 transition-colors">
                        {record.referenceNo}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        IFSC: {record.ifscCode}
                      </div>
                    </td>

                    {/* Institution */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 max-w-xs truncate group-hover:text-teal-900 transition-colors">
                        {record.institutionName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-sans">
                        <span className="font-mono">ID: {record.aictePermanentId}</span>
                        <span>·</span>
                        <span>{record.state}</span>
                      </div>
                    </td>

                    {/* Bank */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <BankLogoBadge bankName={record.bankName} size="sm" />
                        <span className="font-medium text-slate-900 whitespace-nowrap">
                          {record.bankName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[170px] font-sans mt-0.5 ml-7">
                        {record.branchName}
                      </div>
                    </td>

                    {/* Deposit Amount */}
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-900 text-right whitespace-nowrap tabular-nums">
                      {formatIndianCurrency(record.amount)}
                    </td>

                    {/* Issue Date */}
                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap font-mono text-xs tabular-nums">
                      {formatIndianDate(record.issueDate, 'short')}
                    </td>

                    {/* Maturity Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-xs text-slate-900 tabular-nums">
                        {formatIndianDate(record.maturityDate, 'short')}
                      </div>
                      <div
                        className={`text-[10px] font-medium font-sans mt-0.5 ${
                          record.daysToMaturity < 0
                            ? 'text-rose-800'
                            : record.daysToMaturity <= 30
                            ? 'text-amber-800'
                            : 'text-slate-500'
                        }`}
                      >
                        {record.daysToMaturity < 0
                          ? `${Math.abs(record.daysToMaturity)}d overdue`
                          : `${record.daysToMaturity}d left`}
                      </div>
                    </td>

                    {/* Risk */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {renderRiskBadge(record.riskLevel)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {renderStatusBadge(record.status, record.daysToMaturity)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectFDR) {
                            onSelectFDR(record.id);
                          } else {
                            setSelectedFDR(record);
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 group-hover:border-slate-300 transition-colors shadow-xs"
                      >
                        <span>Dossier</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination & Footer */}
        {sortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200/80 bg-slate-50/60 px-5 py-3.5 text-xs text-slate-600">
            <div className="font-mono text-xs tabular-nums">
              Showing{' '}
              <strong className="font-semibold text-slate-900">
                {(currentPage - 1) * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="font-semibold text-slate-900">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </strong>{' '}
              of{' '}
              <strong className="font-semibold text-slate-900">
                {sortedData.length}
              </strong>{' '}
              entries
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 self-center sm:self-auto">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-[32px] rounded-md px-2 text-xs font-mono font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
