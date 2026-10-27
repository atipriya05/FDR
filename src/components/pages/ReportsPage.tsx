import React, { useState, useMemo } from 'react';
import {
  FileBarChart2,
  Download,
  Filter,
  Landmark,
  Building2,
  CheckCircle2,
  AlertTriangle,
  PieChart as PieIcon,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FDRRecord,
  SAMPLE_FDR_DATASET,
  formatIndianCurrency,
  formatIndianDate,
} from '../../data/fdrData.ts';

interface ReportsPageProps {
  dataset: FDRRecord[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  dataset = SAMPLE_FDR_DATASET,
}) => {
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filter dataset for reports
  const filteredData = useMemo(() => {
    return dataset.filter((r) => {
      if (selectedRegion !== 'ALL' && r.regionalOffice !== selectedRegion) return false;
      if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
      return true;
    });
  }, [dataset, selectedRegion, selectedStatus]);

  // Aggregated regional data for chart
  const regionalChartData = useMemo(() => {
    const map = new Map<string, { count: number; totalSum: number }>();

    filteredData.forEach((r) => {
      // Abbreviate regional office name for chart label
      const roAbbr = r.regionalOffice.split('(')[1]?.replace(')', '') || r.regionalOffice;
      if (!map.has(roAbbr)) {
        map.set(roAbbr, { count: 0, totalSum: 0 });
      }
      const item = map.get(roAbbr)!;
      item.count += 1;
      item.totalSum += r.amount;
    });

    return Array.from(map.entries()).map(([region, data]) => ({
      region,
      totalCrores: Number((data.totalSum / 10000000).toFixed(2)),
      count: data.count,
    }));
  }, [filteredData]);

  // Aggregated bank exposure data
  const bankChartData = useMemo(() => {
    const map = new Map<string, { count: number; totalSum: number }>();

    filteredData.forEach((r) => {
      const bank = r.bankName.replace(' Ltd', '').replace(' Bank', '');
      if (!map.has(bank)) {
        map.set(bank, { count: 0, totalSum: 0 });
      }
      const item = map.get(bank)!;
      item.count += 1;
      item.totalSum += r.amount;
    });

    return Array.from(map.entries())
      .map(([bank, data]) => ({
        bank,
        totalCrores: Number((data.totalSum / 10000000).toFixed(2)),
        count: data.count,
      }))
      .sort((a, b) => b.totalCrores - a.totalCrores)
      .slice(0, 6);
  }, [filteredData]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalAmount = filteredData.reduce((s, r) => s + r.amount, 0);
    const activeCount = filteredData.filter((r) => r.status === 'ACTIVE' || r.status === 'RENEWED').length;
    const pendingCount = filteredData.filter((r) => r.status === 'PENDING_VERIFICATION').length;
    const atRiskCount = filteredData.filter((r) => r.daysToMaturity <= 30 || r.daysToMaturity < 0).length;

    const complianceRate = filteredData.length > 0
      ? Math.round((activeCount / filteredData.length) * 100)
      : 100;

    return {
      totalAmount,
      totalCount: filteredData.length,
      complianceRate,
      pendingCount,
      atRiskCount,
    };
  }, [filteredData]);

  // Real Working CSV Export function
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = [
      'FDR Reference',
      'AICTE Permanent ID',
      'Institution Name',
      'State',
      'Regional Council',
      'Bank Name',
      'Branch Name',
      'IFSC Code',
      'Deposit Amount (INR)',
      'Issue Date',
      'Maturity Date',
      'Days to Maturity',
      'Status',
      'Risk Level',
      'Joint Pledge Holder',
    ];

    const rows = filteredData.map((r) => [
      `"${r.referenceNo}"`,
      `"${r.aictePermanentId}"`,
      `"${r.institutionName.replace(/"/g, '""')}"`,
      `"${r.state}"`,
      `"${r.regionalOffice}"`,
      `"${r.bankName}"`,
      `"${r.branchName.replace(/"/g, '""')}"`,
      `"${r.ifscCode}"`,
      r.amount,
      r.issueDate,
      r.maturityDate,
      r.daysToMaturity,
      `"${r.status}"`,
      `"${r.riskLevel}"`,
      `"${r.jointHolder.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `AICTE_FDR_Statutory_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(
      `Successfully generated and exported ${filteredData.length} records to CSV.`
    );
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Editorial Style) */}
      <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50/80 px-2.5 py-0.5 text-[11px] font-medium text-teal-800 border border-teal-200/60 mb-2">
              <FileBarChart2 className="h-3 w-3 text-teal-800" />
              <span>AICTE Analytical Services</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Statutory Audit Reports & Exports
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-2xl">
              Regional council allocations, banking concentration exposures, and official compliance ledger exports.
            </p>
          </div>

          {/* Working CSV Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Download className="h-4 w-4" />
            <span>Export Report to CSV ({filteredData.length} Records)</span>
          </button>
        </div>
      </div>

      {/* Export Confirmation Toast */}
      {exportNotice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-stone-500 font-medium block">Total Monitored Corpus</span>
          <div className="font-serif text-2xl font-semibold text-slate-900 mt-1">
            {formatIndianCurrency(summaryMetrics.totalAmount, true)}
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block font-mono">{summaryMetrics.totalCount} certificates in scope</span>
        </div>

        <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-stone-500 font-medium block">Compliance Health Rate</span>
          <div className="font-serif text-2xl font-semibold text-emerald-700 mt-1">
            {summaryMetrics.complianceRate}%
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block font-sans">Active & verified pledges</span>
        </div>

        <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-stone-500 font-medium block">Verification Backlog</span>
          <div className="font-serif text-2xl font-semibold text-teal-800 mt-1">
            {summaryMetrics.pendingCount}
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block font-sans">Awaiting branch confirmation</span>
        </div>

        <div className="rounded-lg border border-stone-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-stone-500 font-medium block">Renewal Watchlist</span>
          <div className="font-serif text-2xl font-semibold text-amber-700 mt-1">
            {summaryMetrics.atRiskCount}
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block font-sans">Expiring in 30 days or overdue</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Regional Council Breakdown */}
        <div className="rounded-lg border border-stone-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="border-b border-stone-200/80 pb-3 mb-4">
            <h3 className="font-serif text-base font-semibold text-slate-900">
              Regional Council Pledged Corpus (₹ Crores)
            </h3>
            <p className="text-xs text-stone-500">
              Distribution of fixed deposit collateral by AICTE regional jurisdictions
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionalChartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="region" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${val} Cr`, 'Pledged Corpus']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                />
                <Bar dataKey="totalCrores" fill="#0d9488" radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Scheduled Bank Exposure Concentration */}
        <div className="rounded-lg border border-stone-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="border-b border-stone-200/80 pb-3 mb-4">
            <h3 className="font-serif text-base font-semibold text-slate-900">
              Scheduled Bank Exposure (Top 6 Banks in ₹ Cr)
            </h3>
            <p className="text-xs text-stone-500">
              Security deposit concentration across leading commercial banking partners
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bankChartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="bank" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${val} Cr`, 'Bank Holding']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                />
                <Bar dataKey="totalCrores" fill="#0f172a" radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter and Export Preview Table */}
      <div className="rounded-lg border border-stone-200/90 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="p-4 border-b border-stone-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs bg-stone-50/40">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-teal-800" />
            <h4 className="font-semibold text-slate-900">Report Ledger Preview ({filteredData.length} Entries)</h4>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="rounded-md border border-stone-200 bg-white p-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-hidden"
            >
              <option value="ALL">All Regional Councils</option>
              <option value="Northern Regional Office (NRO)">NRO</option>
              <option value="Western Regional Office (WRO)">WRO</option>
              <option value="Southern Regional Office (SRO)">SRO</option>
              <option value="Eastern Regional Office (ERO)">ERO</option>
              <option value="Central Regional Office (CRO)">CRO</option>
              <option value="South Western Regional Office (SWRO)">SWRO</option>
              <option value="South Central Regional Office (SCRO)">SCRO</option>
              <option value="North Western Regional Office (NWRO)">NWRO</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border border-stone-200 bg-white p-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="MATURED">Matured</option>
              <option value="RENEWED">Renewed</option>
              <option value="RELEASED">Released</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="sticky top-0 bg-stone-50/90 backdrop-blur-[1px] border-b border-stone-200/80">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                <th className="py-2.5 px-3">FDR Reference</th>
                <th className="py-2.5 px-3">Institution Name</th>
                <th className="py-2.5 px-3">Scheduled Bank</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3">Maturity Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredData.slice(0, 10).map((r) => (
                <tr key={r.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{r.referenceNo}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 truncate max-w-xs">{r.institutionName}</td>
                  <td className="py-2.5 px-3 text-stone-700">{r.bankName}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{formatIndianCurrency(r.amount)}</td>
                  <td className="py-2.5 px-3 font-mono text-stone-600">{formatIndianDate(r.maturityDate, 'short')}</td>
                  <td className="py-2.5 px-3">
                    <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700 border border-stone-200">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
