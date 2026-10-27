import React from 'react';
import {
  X,
  Landmark,
  Building2,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  FileText,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  FDRRecord,
  formatIndianCurrency,
  formatIndianDate,
} from '../../data/fdrData.ts';
import { NavViewId } from '../../types/navigation.ts';
import { BankLogoBadge } from '../visuals/BankLogoBadge.tsx';

interface FDRDetailModalProps {
  fdr: FDRRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (viewId: NavViewId) => void;
}

export const FDRDetailModal: React.FC<FDRDetailModalProps> = ({
  fdr,
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen || !fdr) return null;

  const getRiskBadge = (risk: FDRRecord['riskLevel']) => {
    switch (risk) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            High Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            Medium Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            Low Risk
          </span>
        );
    }
  };

  const getStatusBadge = (status: FDRRecord['status']) => {
    switch (status) {
      case 'EXPIRING_SOON':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
            Expiring Soon ({fdr.daysToMaturity}d)
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800 border border-teal-200">
            Pending Verification
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">
            Active
          </span>
        );
      case 'MATURED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800 border border-rose-200">
            Matured / Overdue
          </span>
        );
      case 'RENEWED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800 border border-blue-200">
            Renewed
          </span>
        );
      case 'RELEASED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-300">
            Released
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-stone-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200/90 bg-white text-teal-800">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="modal-title"
                  className="font-serif text-base font-semibold text-slate-900"
                >
                  FDR Record Details
                </h3>
                <span className="font-mono text-[11px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                  {fdr.referenceNo}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-sans">
                Official AICTE Security Deposit Dossier
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-sans">
          {/* Status Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg border border-stone-200/90 bg-stone-50/50">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                Status:
              </span>
              {getStatusBadge(fdr.status)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                Risk Tier:
              </span>
              {getRiskBadge(fdr.riskLevel)}
            </div>
          </div>

          {/* Primary Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-stone-200/90 rounded-lg p-4 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                <Building2 className="h-3.5 w-3.5 text-teal-800" />
                <span>Institution Profile</span>
              </div>
              <div className="font-serif text-sm font-semibold text-slate-900">
                {fdr.institutionName}
              </div>
              <div className="mt-2 text-xs text-stone-600 space-y-1">
                <div>AICTE ID: <span className="font-mono font-medium text-slate-800">{fdr.aictePermanentId}</span></div>
                <div>Region: {fdr.regionalOffice}</div>
                <div>State: {fdr.state}</div>
              </div>
            </div>

            <div className="border border-stone-200/90 rounded-lg p-4 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                  <Landmark className="h-3.5 w-3.5 text-teal-800" />
                  <span>Bank & Deposit Particulars</span>
                </div>
                <BankLogoBadge bankName={fdr.bankName} size="xs" showLabel={false} />
              </div>
              <div className="font-serif text-lg font-semibold text-slate-900">
                {formatIndianCurrency(fdr.amount)}
              </div>
              <div className="mt-2 text-xs text-stone-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span>Bank:</span>
                  <BankLogoBadge bankName={fdr.bankName} size="sm" />
                </div>
                <div>Branch: {fdr.branchName}</div>
                <div>IFSC: <span className="font-mono text-stone-700">{fdr.ifscCode}</span></div>
              </div>
            </div>
          </div>

          {/* Date & Pledge Information */}
          <div className="border border-stone-200/90 rounded-lg p-4 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-teal-800" />
              <span>Tenure & Lien Endorsement</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100 text-xs">
              <div>
                <span className="text-stone-500 block text-[11px]">Issue Date</span>
                <span className="font-mono font-medium text-slate-900">{formatIndianDate(fdr.issueDate, 'short')}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Due Date</span>
                <span className="font-mono font-semibold text-slate-900">{formatIndianDate(fdr.maturityDate, 'short')}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Days Remaining</span>
                <span className={`font-mono font-semibold ${fdr.daysToMaturity <= 30 ? 'text-amber-700' : 'text-slate-900'}`}>
                  {fdr.daysToMaturity} days
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 text-xs">
              <span className="text-stone-500 block mb-1 text-[11px]">Joint Lien Pledgee</span>
              <p className="font-medium text-slate-800 bg-stone-50/60 p-2.5 rounded-md border border-stone-200/90 text-xs">
                {fdr.jointHolder}
              </p>
            </div>
          </div>

          {/* Scrutiny note */}
          <div className="flex items-start gap-3 rounded-lg border border-teal-200/80 bg-teal-50/50 p-3.5 text-xs text-teal-900">
            <ShieldCheck className="h-4 w-4 text-teal-800 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-teal-950">Statutory Compliance Note:</span> Fixed Deposit Receipts are pledged jointly in favor of the Regional Officer, AICTE, and the sponsoring trust. Any renewal or release requires formal Council concurrence.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200/80 bg-stone-50/50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Close Dossier
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigate('fdr-registry');
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <span>Inspect in FDR Registry</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
