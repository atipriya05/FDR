import React, { useState, useMemo } from 'react';
import {
  Landmark,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  Layers,
  Activity,
  CheckCircle2,
  FileText,
  TrendingUp,
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
  SAMPLE_ACTIVITY_EVENTS,
  calculateMaturityDistribution,
  formatIndianCurrency,
  formatIndianDate,
} from '../../data/fdrData.ts';
import { FDRDetailModal } from '../fdr/FDRDetailModal.tsx';
import { NavViewId } from '../../types/navigation.ts';
import { LifecycleProcessFlow } from '../visuals/LifecycleProcessFlow.tsx';
import { CorpusDistributionVisual } from '../visuals/CorpusDistributionVisual.tsx';
import { BankLogoBadge } from '../visuals/BankLogoBadge.tsx';

interface CommandCentrePageProps {
  onNavigate: (viewId: NavViewId) => void;
  dataset?: FDRRecord[];
  onSelectFDR?: (fdrId: string) => void;
}

export const CommandCentrePage: React.FC<CommandCentrePageProps> = ({
  onNavigate,
  dataset = SAMPLE_FDR_DATASET,
  onSelectFDR,
}) => {
  const [selectedFDR, setSelectedFDR] = useState<FDRRecord | null>(null);

  // Dynamically calculate KPI values from dataset
  const kpiStats = useMemo(() => {
    const totalCount = dataset.length;
    const totalValue = dataset.reduce((acc, curr) => acc + curr.amount, 0);

    const activeList = dataset.filter((d) => d.status === 'ACTIVE');
    const activeCount = activeList.length;
    const activeValue = activeList.reduce((acc, curr) => acc + curr.amount, 0);

    const expiring30List = dataset.filter(
      (d) => d.daysToMaturity <= 30 && d.daysToMaturity >= 0 && d.status !== 'RELEASED' && d.status !== 'MATURED'
    );
    const expiring30Count = expiring30List.length;
    const expiring30Value = expiring30List.reduce((acc, curr) => acc + curr.amount, 0);

    const pendingList = dataset.filter((d) => d.status === 'PENDING_VERIFICATION');
    const pendingCount = pendingList.length;
    const pendingValue = pendingList.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalCount,
      totalValue,
      activeCount,
      activeValue,
      expiring30Count,
      expiring30Value,
      pendingCount,
      pendingValue,
    };
  }, [dataset]);

  // Aggregate maturity chart data
  const chartData = useMemo(() => {
    return calculateMaturityDistribution(dataset);
  }, [dataset]);

  // Sort and retrieve the 5 most urgent FDR cases
  const urgentCases = useMemo(() => {
    return [...dataset]
      .sort((a, b) => {
        // Priority: High risk first, then lowest days to maturity
        const riskScore: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const diffRisk = (riskScore[b.riskLevel] || 0) - (riskScore[a.riskLevel] || 0);
        if (diffRisk !== 0) return diffRisk;
        return a.daysToMaturity - b.daysToMaturity;
      })
      .slice(0, 5);
  }, [dataset]);

  // Restrained risk badge helper
  const renderRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 border border-rose-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            High Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            Medium
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Low Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
            {level}
          </span>
        );
    }
  };

  // Restrained status badge helper
  const renderStatusBadge = (status: string, days: number) => {
    switch (status) {
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
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800 border border-slate-300">
            Matured
          </span>
        );
      case 'RENEWED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800 border border-sky-200/80">
            Renewed
          </span>
        );
      case 'RELEASED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
            Released
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Active
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

  // Activity type icon helper
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'VERIFICATION':
        return <ShieldCheck className="h-3.5 w-3.5 text-teal-800" />;
      case 'MATURITY_ALERT':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />;
      case 'RENEWAL':
        return <TrendingUp className="h-3.5 w-3.5 text-sky-700" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Detail Modal */}
      <FDRDetailModal
        fdr={selectedFDR}
        isOpen={Boolean(selectedFDR)}
        onClose={() => setSelectedFDR(null)}
        onNavigate={onNavigate}
      />

      {/* Top Banner / Welcome Action Header (Editorial Style) */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="max-w-3xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="text-teal-800 font-semibold uppercase tracking-wider text-[11px]">FDR Sentinel</span>
              <span>·</span>
              <span>AY 2026–27</span>
              <span>·</span>
              <span>Official Registry</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Command Centre
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-normal font-sans">
              Every deposit. Every deadline. Under control. Surveillance of institutional fixed deposits, bank covenants, and lien status.
            </p>
          </div>

          {/* Primary Action Button to FDR Registry */}
          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('fdr-registry')}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 shadow-xs transition-colors border border-slate-900"
            >
              <Landmark className="h-4 w-4 text-teal-300" />
              <span>Open FDR Registry</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Statutory Lifecycle Pipeline */}
      <LifecycleProcessFlow dataset={dataset} onNavigate={onNavigate} />

      {/* 4 Compact KPI Cards with Anchor ID */}
      <div id="overview-kpis" className="scroll-mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total FDRs */}
        <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500">
            <span>Total FDRs</span>
            <div className="flex h-7 w-7 items-center justify-center rounded border border-slate-200/80 bg-slate-50 text-slate-700">
              <Landmark className="h-3.5 w-3.5 text-teal-800" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline justify-between gap-2">
            <div className="font-serif text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
              {kpiStats.totalCount}
            </div>
            <div className="font-mono text-xs font-medium text-slate-700 bg-slate-100/70 px-2 py-0.5 rounded border border-slate-200/60 tabular-nums">
              {formatIndianCurrency(kpiStats.totalValue, true)}
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Total Deposits</span>
            <span className="font-mono text-slate-600">100% indexed</span>
          </div>
        </div>

        {/* Card 2: Active FDRs */}
        <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500">
            <span>Active FDRs</span>
            <div className="flex h-7 w-7 items-center justify-center rounded border border-emerald-200/80 bg-emerald-50 text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline justify-between gap-2">
            <div className="font-serif text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
              {kpiStats.activeCount}
            </div>
            <div className="font-mono text-xs font-medium text-slate-700 bg-slate-100/70 px-2 py-0.5 rounded border border-slate-200/60 tabular-nums">
              {formatIndianCurrency(kpiStats.activeValue, true)}
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Lien confirmed</span>
            <span className="font-mono text-emerald-700 font-semibold">
              {Math.round((kpiStats.activeCount / Math.max(1, kpiStats.totalCount)) * 100)}% of total
            </span>
          </div>
        </div>

        {/* Card 3: Expiring Soon */}
        <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500">
            <span>Expiring Soon</span>
            <div className="flex h-7 w-7 items-center justify-center rounded border border-amber-200/80 bg-amber-50 text-amber-800">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline justify-between gap-2">
            <div className="font-serif text-3xl font-semibold tracking-tight text-amber-800 tabular-nums">
              {kpiStats.expiring30Count}
            </div>
            <div className="font-mono text-xs font-medium text-slate-700 bg-slate-100/70 px-2 py-0.5 rounded border border-slate-200/60 tabular-nums">
              {formatIndianCurrency(kpiStats.expiring30Value, true)}
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Renewal notices</span>
            <span className="font-mono text-amber-800 font-semibold">Action required</span>
          </div>
        </div>

        {/* Card 4: Awaiting Review */}
        <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500">
            <span>Awaiting Review</span>
            <div className="flex h-7 w-7 items-center justify-center rounded border border-teal-200/80 bg-teal-50 text-teal-800">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline justify-between gap-2">
            <div className="font-serif text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
              {kpiStats.pendingCount}
            </div>
            <div className="font-mono text-xs font-medium text-slate-700 bg-slate-100/70 px-2 py-0.5 rounded border border-slate-200/60 tabular-nums">
              {formatIndianCurrency(kpiStats.pendingValue, true)}
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>In scrutiny queue</span>
            <span className="font-mono text-teal-800 font-semibold">Validation queue</span>
          </div>
        </div>
      </div>

      {/* Analytics & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maturity Overview Chart with Anchor ID */}
        <div id="maturity-horizon" className="scroll-mt-20 lg:col-span-2 rounded-lg border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-4 mb-5">
            <div>
              <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                Upcoming Maturities
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quarterly & monthly distribution (AY 2026-27 cycle)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200/70">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                <span>Certificates</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-700" />
                <span>Value (₹ Cr)</span>
              </span>
            </div>
          </div>

          {dataset.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Layers className="h-8 w-8 text-slate-300 mb-2" />
              No maturity timeline data available.
            </div>
          ) : (
            <div className="h-68 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  barGap={6}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-sans)',
                      color: '#0f172a',
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'FDR Count') return [`${value} Certificates`, 'Volume'];
                      if (name === 'Total Value (₹ Cr)') return [`₹${value} Cr`, 'Value'];
                      return [value, name];
                    }}
                  />
                  <Bar
                    dataKey="fdrCount"
                    name="FDR Count"
                    fill="#0f172a"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={26}
                  />
                  <Bar
                    dataKey="totalValueCrores"
                    name="Total Value (₹ Cr)"
                    fill="#0f766e"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={26}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-4 border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono">
            <span>Projection Model: Statutory APH Cycle</span>
            <span className="font-sans font-medium text-slate-800">
              {kpiStats.expiring30Count} certificates expiring within 30 days
            </span>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-4">
              <div>
                <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                  Recent Activity
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recent compliance logs
                </p>
              </div>
              <Activity className="h-4 w-4 text-teal-800" />
            </div>

            {SAMPLE_ACTIVITY_EVENTS.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No recent activity records found.
              </div>
            ) : (
              <div className="space-y-3.5">
                {SAMPLE_ACTIVITY_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-200/80 bg-slate-50 mt-0.5">
                      {renderActivityIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {event.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">
                          {event.timeAgo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                        {event.description}
                      </p>
                      <div className="mt-1 font-mono text-[10px] text-slate-400">
                        Ref: {event.referenceNo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-slate-400">Audit Trail</span>
            <button
              type="button"
              onClick={() => onNavigate('audit-trail')}
              className="text-xs font-semibold text-teal-800 hover:text-teal-900 inline-flex items-center gap-1 transition-colors"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Corpus Allocation & Banking Concentration with Anchor ID */}
      <div id="corpus-distribution" className="scroll-mt-20">
        <CorpusDistributionVisual dataset={dataset} />
      </div>

      {/* 5 Most Urgent FDR Cases Compact Table with Anchor ID */}
      <div id="urgent-cases" className="scroll-mt-20 rounded-lg border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 p-5 sm:px-6 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                Urgent Cases
              </h3>
              <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-rose-800 border border-rose-200">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Priority certificates requiring renewal notices, scrutiny, or lien verification.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('fdr-registry')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-900 transition-colors self-start sm:self-auto"
          >
            <span>View All in FDR Registry</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {urgentCases.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No urgent FDR cases found at this time. All active records are within safe compliance thresholds.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  <th scope="col" className="py-3.5 px-4 sm:px-6">Institution</th>
                  <th scope="col" className="py-3.5 px-3">FDR Reference</th>
                  <th scope="col" className="py-3.5 px-3 text-right">Pledged Amount</th>
                  <th scope="col" className="py-3.5 px-3">Due Date</th>
                  <th scope="col" className="py-3.5 px-3">Risk Assessment</th>
                  <th scope="col" className="py-3.5 px-3">Status</th>
                  <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {urgentCases.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => {
                      if (onSelectFDR) {
                        onSelectFDR(record.id);
                      } else {
                        setSelectedFDR(record);
                      }
                    }}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Institution */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900 group-hover:text-teal-900 transition-colors">
                        {record.institutionName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">ID: {record.aictePermanentId}</span>
                        <span>·</span>
                        <span>{record.state}</span>
                      </div>
                    </td>

                    {/* FDR Reference & Bank */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-xs text-slate-900 font-medium">{record.referenceNo}</div>
                      <div className="mt-1">
                        <BankLogoBadge bankName={record.bankName} size="sm" showLabel={true} />
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap text-right tabular-nums">
                      {formatIndianCurrency(record.amount)}
                    </td>

                    {/* Maturity Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-xs text-slate-900 tabular-nums">
                        {formatIndianDate(record.maturityDate, 'short')}
                      </div>
                      <div className="text-[11px] text-amber-800 font-medium mt-0.5">
                        {record.daysToMaturity < 0
                          ? `${Math.abs(record.daysToMaturity)}d overdue`
                          : `${record.daysToMaturity}d remaining`}
                      </div>
                    </td>

                    {/* Risk Level */}
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
                        className="inline-flex items-center gap-1 rounded border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 group-hover:border-slate-300 transition-colors shadow-xs"
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

        <div className="p-4 border-t border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-2">
          <span className="font-mono text-[11px]">Prioritized by statutory maturity horizon and risk score</span>
          <button
            type="button"
            onClick={() => onNavigate('fdr-registry')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-900 inline-flex items-center gap-1 self-start sm:self-auto transition-colors"
          >
            <span>Proceed to Full FDR Registry ({kpiStats.totalCount} records)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
