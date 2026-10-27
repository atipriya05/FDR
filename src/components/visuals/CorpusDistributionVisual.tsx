import React from 'react';
import { Landmark, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { FDRRecord, formatIndianCurrency } from '../../data/fdrData.ts';
import { BankLogoBadge } from './BankLogoBadge.tsx';

interface CorpusDistributionVisualProps {
  dataset: FDRRecord[];
  className?: string;
}

export const CorpusDistributionVisual: React.FC<CorpusDistributionVisualProps> = ({
  dataset,
  className = '',
}) => {
  const totalAmount = dataset.reduce((sum, r) => sum + r.amount, 0);

  // Group by status
  const activeAmount = dataset
    .filter((r) => r.status === 'ACTIVE' || r.status === 'RENEWED')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingAmount = dataset
    .filter((r) => r.status === 'PENDING_VERIFICATION')
    .reduce((sum, r) => sum + r.amount, 0);

  const expiringAmount = dataset
    .filter((r) => r.status === 'EXPIRING_SOON')
    .reduce((sum, r) => sum + r.amount, 0);

  const maturedAmount = dataset
    .filter((r) => r.status === 'MATURED')
    .reduce((sum, r) => sum + r.amount, 0);

  const releasedAmount = dataset
    .filter((r) => r.status === 'RELEASED')
    .reduce((sum, r) => sum + r.amount, 0);

  const activePct = totalAmount > 0 ? (activeAmount / totalAmount) * 100 : 0;
  const pendingPct = totalAmount > 0 ? (pendingAmount / totalAmount) * 100 : 0;
  const expiringPct = totalAmount > 0 ? (expiringAmount / totalAmount) * 100 : 0;
  const maturedPct = totalAmount > 0 ? (maturedAmount / totalAmount) * 100 : 0;
  const releasedPct = totalAmount > 0 ? (releasedAmount / totalAmount) * 100 : 0;

  // Group top 4 scheduled banks
  const bankTotals = new Map<string, number>();
  dataset.forEach((r) => {
    bankTotals.set(r.bankName, (bankTotals.get(r.bankName) || 0) + r.amount);
  });

  const sortedBanks = Array.from(bankTotals.entries())
    .map(([bank, amt]) => ({ bank, amt, pct: totalAmount > 0 ? (amt / totalAmount) * 100 : 0 }))
    .sort((a, b) => b.amt - a.amt)
    .slice(0, 4);

  return (
    <div className={`rounded-xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b border-stone-200/80 pb-4">
        <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
          Deposit Breakdown
        </h3>
        <p className="text-xs text-stone-500">
          Security collateral distribution across status tiers and premier depositary banks.
        </p>
      </div>

      {/* Multi-Segmented Visual Distribution Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-600">
          <span className="font-semibold text-slate-900">Deposit Status</span>
          <span className="font-mono text-[11px]">TOTAL: {formatIndianCurrency(totalAmount, true)}</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-4 w-full rounded-md overflow-hidden bg-stone-100 flex p-0.5 gap-0.5">
          {activePct > 0 && (
            <div
              style={{ width: `${activePct}%` }}
              className="bg-emerald-600 rounded-xs transition-all duration-500 relative group"
              title={`Active & Verified: ${activePct.toFixed(1)}%`}
            />
          )}
          {pendingPct > 0 && (
            <div
              style={{ width: `${pendingPct}%` }}
              className="bg-teal-600 rounded-xs transition-all duration-500"
              title={`Pending Verification: ${pendingPct.toFixed(1)}%`}
            />
          )}
          {expiringPct > 0 && (
            <div
              style={{ width: `${expiringPct}%` }}
              className="bg-amber-500 rounded-xs transition-all duration-500"
              title={`Expiring Soon: ${expiringPct.toFixed(1)}%`}
            />
          )}
          {maturedPct > 0 && (
            <div
              style={{ width: `${maturedPct}%` }}
              className="bg-rose-600 rounded-xs transition-all duration-500"
              title={`Matured: ${maturedPct.toFixed(1)}%`}
            />
          )}
          {releasedPct > 0 && (
            <div
              style={{ width: `${releasedPct}%` }}
              className="bg-slate-400 rounded-xs transition-all duration-500"
              title={`Released: ${releasedPct.toFixed(1)}%`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-stone-600 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600" />
            <span>Active ({activePct.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-teal-600" />
            <span>Pending ({pendingPct.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-amber-500" />
            <span>Expiring ({expiringPct.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-rose-600" />
            <span>Matured ({maturedPct.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-slate-400" />
            <span>Released ({releasedPct.toFixed(0)}%)</span>
          </div>
        </div>
      </div>

      {/* Top Banks Visual Exposure Strip */}
      <div className="pt-2 border-t border-stone-100">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-3">
          Bank Distribution
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sortedBanks.map((item) => (
            <div
              key={item.bank}
              className="rounded-lg border border-stone-200/90 bg-stone-50/40 p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <BankLogoBadge bankName={item.bank} size="md" />
                <span className="font-mono text-[11px] font-bold text-slate-800">
                  {item.pct.toFixed(1)}%
                </span>
              </div>
              <div>
                <div className="font-serif font-semibold text-slate-900 text-xs truncate">
                  {item.bank}
                </div>
                <div className="text-[11px] text-stone-500 font-mono">
                  {formatIndianCurrency(item.amt, true)}
                </div>
              </div>
              <div className="h-1.5 w-full bg-stone-200/70 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, item.pct * 2)}%` }}
                  className="h-full bg-slate-900 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
