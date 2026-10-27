import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Scan,
  FileText,
  Printer,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';
import { FDRRecord, formatIndianCurrency, formatIndianDate } from '../../data/fdrData.ts';
import { BankLogoBadge } from './BankLogoBadge.tsx';

interface CertificatePreviewVisualProps {
  fdr: FDRRecord;
  className?: string;
  allowToggleMode?: boolean;
}

export const CertificatePreviewVisual: React.FC<CertificatePreviewVisualProps> = ({
  fdr,
  className = '',
  allowToggleMode = true,
}) => {
  const [viewMode, setViewMode] = useState<'CERTIFICATE' | 'OCR_DIFF'>('CERTIFICATE');
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  // Convert amount to words approximately for realistic certificate feel
  const getAmountInWords = (num: number): string => {
    if (num === 10000000) return 'Rupees One Crore Only';
    if (num === 8500000) return 'Rupees Eighty-Five Lakh Only';
    if (num === 7500000) return 'Rupees Seventy-Five Lakh Only';
    if (num === 6500000) return 'Rupees Sixty-Five Lakh Only';
    if (num === 5000000) return 'Rupees Fifty Lakh Only';
    if (num === 3500000) return 'Rupees Thirty-Five Lakh Only';
    if (num === 2500000) return 'Rupees Twenty-Five Lakh Only';
    if (num === 1500000) return 'Rupees Fifteen Lakh Only';
    return `Rupees ${formatIndianCurrency(num)} Only`;
  };

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      {/* Visual Controls Sub-bar */}
      {allowToggleMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-stone-200/90 bg-stone-50/70 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
              Instrument Visualizer:
            </span>
            <div className="inline-flex rounded-md p-0.5 bg-stone-200/80">
              <button
                type="button"
                onClick={() => setViewMode('CERTIFICATE')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                  viewMode === 'CERTIFICATE'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-teal-800" />
                <span>Original Instrument</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('OCR_DIFF')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                  viewMode === 'OCR_DIFF'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                <Scan className="h-3.5 w-3.5 text-teal-800" />
                <span>AI Scrutiny & OCR Layer</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-semibold font-sans">
              <Lock className="h-3 w-3" />
              <span>Statutory Tripartite Lien</span>
            </span>
          </div>
        </div>
      )}

      {/* Main Certificate Canvas */}
      <div className="relative mx-auto max-w-3xl rounded-xl border-2 border-stone-300 bg-[#fefefe] shadow-lg overflow-hidden select-none">
        {/* Security Guilloche Pattern Border */}
        <div className="absolute inset-0 pointer-events-none border-[12px] border-[#f4f1ea] border-double">
          <div className="w-full h-full border border-teal-800/30"></div>
        </div>

        {/* Faint Bank Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] -rotate-25 select-none">
          <div className="text-center font-serif font-black text-6xl tracking-widest text-slate-950 uppercase leading-snug">
            {fdr.bankName}
            <br />
            AICTE SECURITY DEPOSIT
            <br />
            NON-TRANSFERABLE
          </div>
        </div>

        {/* Certificate Content Inner Padding */}
        <div className="relative p-7 sm:p-10 space-y-6">
          {/* Certificate Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-teal-900/20 pb-5">
            <div className="flex items-center gap-3">
              <BankLogoBadge bankName={fdr.bankName} size="lg" />
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase">
                  {fdr.bankName}
                </h3>
                <p className="text-[11px] text-stone-600 font-medium">
                  {fdr.branchName} • IFSC: <span className="font-mono">{fdr.ifscCode}</span>
                </p>
                <p className="text-[10px] text-stone-400 font-mono">
                  SCHEDULED COMMERCIAL BANK (GOVERNMENT COLLATERAL DEPOSITARY)
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <div className="inline-block bg-stone-100 px-2.5 py-1 rounded border border-stone-200 text-slate-900 font-semibold text-[11px]">
                FDR REF: {fdr.referenceNo}
              </div>
              <div className="text-[10px] text-stone-500 mt-1">
                AICTE PID: <span className="text-slate-800 font-semibold">{fdr.aictePermanentId}</span>
              </div>
            </div>
          </div>

          {/* Instrument Title */}
          <div className="text-center space-y-1">
            <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-teal-800 bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200/80">
              Statutory Security Collateral Deposit Receipt
            </div>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Fixed Deposit Receipt (Under Joint Lien)
            </h4>
            <p className="text-[11px] text-stone-500 max-w-md mx-auto italic font-serif">
              Issued in compliance with All India Council for Technical Education Approval Process Handbook
            </p>
          </div>

          {/* Core Certificate Grid with Interactive OCR Bounding Boxes */}
          <div className="space-y-4 pt-1">
            {/* Amount Banner */}
            <div
              onMouseEnter={() => setActiveHighlight('amount')}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`relative rounded-lg border p-4 transition-all ${
                viewMode === 'OCR_DIFF'
                  ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20'
                  : 'border-stone-200 bg-stone-50/60'
              }`}
            >
              {viewMode === 'OCR_DIFF' && (
                <span className="absolute -top-2.5 right-3 bg-teal-800 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow-xs font-semibold">
                  OCR: Confirmed Match (99.8%)
                </span>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-500 block">
                    Principal Amount Pledged:
                  </span>
                  <div className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    {formatIndianCurrency(fdr.amount)}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-500 block">
                    Amount in Words:
                  </span>
                  <div className="font-serif text-sm font-semibold text-teal-900 italic">
                    {getAmountInWords(fdr.amount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Beneficiary & Joint Lien Detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div
                onMouseEnter={() => setActiveHighlight('institution')}
                onMouseLeave={() => setActiveHighlight(null)}
                className={`relative rounded-lg border p-3.5 transition-all ${
                  viewMode === 'OCR_DIFF'
                    ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500/20'
                    : 'border-stone-200/90 bg-white'
                }`}
              >
                {viewMode === 'OCR_DIFF' && (
                  <span className="absolute -top-2 right-2 bg-teal-800 text-white font-mono text-[9px] px-1.5 py-0.2 rounded font-semibold">
                    Entity Match (99.2%)
                  </span>
                )}
                <span className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">
                  Pledgor Approved Institution:
                </span>
                <div className="font-serif text-sm font-bold text-slate-900">
                  {fdr.institutionName}
                </div>
                <div className="mt-1 text-stone-600 space-y-0.5 text-[11px]">
                  <div>AICTE PID: <span className="font-mono text-slate-800 font-semibold">{fdr.aictePermanentId}</span></div>
                  <div>Jurisdiction: {fdr.regionalOffice} ({fdr.state})</div>
                </div>
              </div>

              <div
                onMouseEnter={() => setActiveHighlight('lien')}
                onMouseLeave={() => setActiveHighlight(null)}
                className={`relative rounded-lg border p-3.5 transition-all ${
                  viewMode === 'OCR_DIFF'
                    ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500/20'
                    : 'border-stone-200/90 bg-white'
                }`}
              >
                {viewMode === 'OCR_DIFF' && (
                  <span className="absolute -top-2 right-2 bg-teal-800 text-white font-mono text-[9px] px-1.5 py-0.2 rounded font-semibold">
                    Lien Endorsement Clause Verified
                  </span>
                )}
                <span className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">
                  Joint Lien Pledge Holder Nomenclature:
                </span>
                <p className="font-medium text-slate-800 bg-stone-50 p-2 rounded border border-stone-200 text-[11px] leading-relaxed">
                  {fdr.jointHolder}
                </p>
              </div>
            </div>

            {/* Dates & Tenure */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-stone-200/90 bg-stone-50/30 p-3 text-xs">
              <div
                className={`p-2 rounded ${
                  viewMode === 'OCR_DIFF' ? 'bg-teal-50/60 ring-1 ring-teal-400' : ''
                }`}
              >
                <span className="text-[10px] uppercase font-semibold text-stone-500 block">
                  Date of Lodgement:
                </span>
                <span className="font-mono text-xs font-semibold text-slate-900">
                  {formatIndianDate(fdr.issueDate, 'long')}
                </span>
              </div>

              <div
                className={`p-2 rounded ${
                  viewMode === 'OCR_DIFF' ? 'bg-teal-50/60 ring-1 ring-teal-400' : ''
                }`}
              >
                <span className="text-[10px] uppercase font-semibold text-stone-500 block">
                  Maturity Horizon Date:
                </span>
                <span className="font-mono text-xs font-semibold text-slate-900">
                  {formatIndianDate(fdr.maturityDate, 'long')}
                </span>
              </div>

              <div className="p-2">
                <span className="text-[10px] uppercase font-semibold text-stone-500 block">
                  Tenure / Validity Period:
                </span>
                <span className="font-semibold text-teal-900">
                  60 Months (Statutory 5 Years)
                </span>
              </div>
            </div>

            {/* Statutory Tripartite Clause Box */}
            <div className="rounded border border-stone-200 bg-stone-50/80 p-3 text-[11px] text-stone-700 leading-relaxed font-serif">
              <strong>STATUTORY LIEN CLAUSE:</strong> This term deposit is unconditionally pledged in joint name in favor of the Regional Officer, AICTE. The deposit cannot be encashed, dissolved, or transferred without prior written discharge concurrence issued by the Competent Authority of the Council.
            </div>
          </div>

          {/* Authentic Stamps, QR Code, and Signatures Row */}
          <div className="pt-4 border-t-2 border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Red Rubber Ink Stamp (Simulated authentic tilted stamp) */}
            <div className="relative group shrink-0">
              <div className="border-2 border-dashed border-red-700 rounded-lg p-2.5 max-w-[210px] text-center -rotate-3 bg-red-50/30 shadow-2xs">
                <div className="text-[9px] font-black uppercase tracking-wider text-red-800 border-b border-red-700 pb-1">
                  AICTE REGIONAL OFFICE
                </div>
                <div className="font-serif font-black text-xs text-red-900 py-1 uppercase leading-tight">
                  JOINT LIEN ENDORSED
                </div>
                <div className="text-[9px] text-red-800 font-mono pt-0.5">
                  VERIFIED: {formatIndianDate(fdr.issueDate, 'short')}
                </div>
                <div className="text-[8px] text-red-700 font-mono">
                  REF: {fdr.referenceNo.split('/')[3] || 'STATUTORY'}
                </div>
              </div>
            </div>

            {/* Security Hologram & QR Code Block */}
            <div className="flex items-center gap-3 shrink-0">
              {/* QR Verification Mockup */}
              <div className="h-16 w-16 bg-white p-1 rounded border border-stone-300 shadow-2xs flex flex-col items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v3h-3v-3zm3 3h3v3h-3v-3zm-3 3h3v3h-3v-3zm-3-3h3v3h-3v-3z" />
                </svg>
              </div>

              <div className="text-[10px] font-mono text-stone-500 space-y-0.5">
                <div className="font-bold text-slate-800">SECURITY HASH:</div>
                <div className="text-teal-800 truncate max-w-[140px]">SHA256: 4f8a...9c2e</div>
                <div className="text-stone-400">RBI SFMS / APH COMPLIANT</div>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex items-center gap-6 shrink-0 text-center text-[10px] text-stone-600">
              <div className="space-y-1">
                <div className="h-9 w-24 border-b border-stone-400 flex items-center justify-center font-serif italic text-slate-700 text-sm">
                  K. S. Narayanan
                </div>
                <span className="block font-medium">Chief Manager</span>
                <span className="block text-[9px] text-stone-400 font-mono">{fdr.bankName.slice(0, 4)} Branch</span>
              </div>

              <div className="space-y-1">
                <div className="h-9 w-24 border-b border-stone-400 flex items-center justify-center font-serif italic text-teal-800 text-sm">
                  R. K. Sharma
                </div>
                <span className="block font-semibold text-slate-900">Scrutiny Officer</span>
                <span className="block text-[9px] text-teal-800 font-medium">AICTE HQ Desk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
