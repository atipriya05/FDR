import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Landmark,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Clock,
  FileText,
  FileCheck2,
  CheckCircle2,
  Edit3,
  MessageSquare,
  AlertCircle,
  FileQuestion,
  ExternalLink,
  X,
  History,
  ShieldAlert,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  FDRRecord,
  FDRStatus,
  FDRRiskLevel,
  FDRDocument,
  TimelineEvent,
  ScrutinyNote,
  formatIndianCurrency,
  formatIndianDate,
  calculateDaysToMaturity,
  SYSTEM_TODAY_DATE,
} from '../../data/fdrData.ts';
import { NavViewId } from '../../types/navigation.ts';
import { CertificatePreviewVisual } from '../visuals/CertificatePreviewVisual.tsx';
import { BankLogoBadge } from '../visuals/BankLogoBadge.tsx';

interface FDRDetailsPageProps {
  fdr: FDRRecord;
  onBackToRegistry: () => void;
  onUpdateFDR: (updatedFDR: FDRRecord) => void;
  onNavigate: (viewId: NavViewId) => void;
}

export const FDRDetailsPage: React.FC<FDRDetailsPageProps> = ({
  fdr,
  onBackToRegistry,
  onUpdateFDR,
  onNavigate,
}) => {
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isCorrectionDialogOpen, setIsCorrectionDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<FDRDocument | null>(null);

  // Edit form state
  const [editAmount, setEditAmount] = useState(fdr.amount.toString());
  const [editBranch, setEditBranch] = useState(fdr.branchName);
  const [editMaturityDate, setEditMaturityDate] = useState(fdr.maturityDate);
  const [editJointHolder, setEditJointHolder] = useState(fdr.jointHolder);

  // Observation form state
  const [observationText, setObservationText] = useState('');
  const [observationCategory, setObservationCategory] = useState<
    'AUDIT_NOTE' | 'COMPLIANCE_NOTICE' | 'LEGAL_ADVISORY'
  >('AUDIT_NOTE');

  // Correction request state
  const [correctionDirective, setCorrectionDirective] = useState(
    'Please submit a revised Bank Endorsement Certificate reflecting the correct tripartite joint lien clause with AICTE Regional Office within 15 calendar days.'
  );

  // Status badge helper
  const renderStatusBadge = (status: FDRStatus, days: number) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Active & Verified
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 border border-teal-200">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            Pending Verification
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            Expiring Soon ({days}d)
          </span>
        );
      case 'MATURED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 border border-rose-200">
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            Matured / Overdue
          </span>
        );
      case 'RENEWED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 border border-blue-200">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Renewed
          </span>
        );
      case 'RELEASED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-300">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            Released / Discharged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Risk badge helper
  const renderRiskBadge = (risk: FDRRiskLevel, score: number) => {
    switch (risk) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            High Risk ({score}/100)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            Medium Risk ({score}/100)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            Low Risk ({score}/100)
          </span>
        );
    }
  };

  // Timeline icon helper
  const renderTimelineIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'SUBMISSION':
        return <FileText className="h-4 w-4 text-teal-700" />;
      case 'SCRUTINY':
        return <ShieldCheck className="h-4 w-4 text-teal-700" />;
      case 'CORRECTION':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'VERIFICATION':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'RENEWAL':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'RELEASE':
        return <FileCheck2 className="h-4 w-4 text-slate-600" />;
      default:
        return <History className="h-4 w-4 text-slate-600" />;
    }
  };

  // Handle Edit Submission
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(editAmount) || fdr.amount;
    const newDays = calculateDaysToMaturity(editMaturityDate);

    const newTimelineEvent: TimelineEvent = {
      id: `time-edit-${Date.now()}`,
      timestamp: `${formatIndianDate(SYSTEM_TODAY_DATE, 'short')}, 04:30 PM`,
      actor: 'Shri R. K. Sharma (Scrutiny Officer)',
      action: 'Record Particulars Adjusted (Demo Edit)',
      details: `Updated branch to "${editBranch}", amount to ${formatIndianCurrency(parsedAmount)}, and maturity to ${formatIndianDate(editMaturityDate, 'short')}.`,
      type: 'SCRUTINY',
    };

    const updated: FDRRecord = {
      ...fdr,
      amount: parsedAmount,
      branchName: editBranch,
      maturityDate: editMaturityDate,
      jointHolder: editJointHolder,
      daysToMaturity: newDays,
      timeline: [newTimelineEvent, ...fdr.timeline],
    };

    onUpdateFDR(updated);
    setIsEditModalOpen(false);
  };

  // Handle Observation Submission
  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationText.trim()) return;

    const newNote: ScrutinyNote = {
      id: `note-${Date.now()}`,
      officer: 'Shri R. K. Sharma (Scrutiny Officer)',
      timestamp: `${formatIndianDate(SYSTEM_TODAY_DATE, 'short')}, 04:45 PM`,
      category: observationCategory,
      note: observationText.trim(),
    };

    const newTimelineEvent: TimelineEvent = {
      id: `time-obs-${Date.now()}`,
      timestamp: `${formatIndianDate(SYSTEM_TODAY_DATE, 'short')}, 04:45 PM`,
      actor: 'Shri R. K. Sharma (Scrutiny Officer)',
      action: `Scrutiny Observation Recorded: ${observationCategory.replace('_', ' ')}`,
      details: observationText.trim(),
      type: 'SCRUTINY',
    };

    const updated: FDRRecord = {
      ...fdr,
      scrutinyNotes: [newNote, ...(fdr.scrutinyNotes || [])],
      timeline: [newTimelineEvent, ...fdr.timeline],
    };

    onUpdateFDR(updated);
    setObservationText('');
    setIsObservationModalOpen(false);
  };

  // Handle Record Verification (Transition from PENDING_VERIFICATION to ACTIVE)
  const handleConfirmVerification = () => {
    const newTimelineEvent: TimelineEvent = {
      id: `time-ver-${Date.now()}`,
      timestamp: `${formatIndianDate(SYSTEM_TODAY_DATE, 'short')}, 05:00 PM`,
      actor: 'Scrutiny Officer & Regional Officer (AICTE)',
      action: 'Statutory Verification Confirmed (Demo Execution)',
      details: 'Tripartite joint lien verified with branch schedule. Deposit transitioned to Active status.',
      type: 'VERIFICATION',
    };

    const updated: FDRRecord = {
      ...fdr,
      status: 'ACTIVE',
      scrutinyStatus: 'VERIFIED',
      riskLevel: 'LOW',
      riskScore: 15,
      submittedVsVerified: {
        ...fdr.submittedVsVerified,
        branchConfirmationStatus: 'CONFIRMED',
        amount: {
          submitted: fdr.amount,
          verified: fdr.amount,
          status: 'MATCHED',
        },
        lienMarked: {
          submitted: true,
          verified: true,
          status: 'CONFIRMED',
        },
        jointHolders: {
          submitted: fdr.jointHolder,
          verified: fdr.jointHolder,
          status: 'MATCHED',
        },
      },
      timeline: [newTimelineEvent, ...fdr.timeline],
    };

    onUpdateFDR(updated);
    setIsVerifyDialogOpen(false);
  };

  // Handle Correction Request (Sends clarification notice)
  const handleConfirmCorrectionRequest = () => {
    const newTimelineEvent: TimelineEvent = {
      id: `time-corr-${Date.now()}`,
      timestamp: `${formatIndianDate(SYSTEM_TODAY_DATE, 'short')}, 05:15 PM`,
      actor: 'Scrutiny Desk (AICTE)',
      action: 'Correction Directive Dispatched (Demo Action)',
      details: correctionDirective.trim(),
      type: 'CORRECTION',
    };

    const newNote: ScrutinyNote = {
      id: `note-corr-${Date.now()}`,
      officer: 'Shri R. K. Sharma (Scrutiny Officer)',
      timestamp: `${formatIndianDate(SYSTEM_TODAY_DATE, 'short')}, 05:15 PM`,
      category: 'COMPLIANCE_NOTICE',
      note: `Correction notice dispatched: "${correctionDirective.trim()}"`,
    };

    const updated: FDRRecord = {
      ...fdr,
      scrutinyStatus: 'DISCREPANCY',
      timeline: [newTimelineEvent, ...fdr.timeline],
      scrutinyNotes: [newNote, ...(fdr.scrutinyNotes || [])],
    };

    onUpdateFDR(updated);
    setIsCorrectionDialogOpen(false);
  };

  // Determine whether "Request Correction" is appropriate
  const canRequestCorrection =
    fdr.status === 'PENDING_VERIFICATION' ||
    fdr.status === 'EXPIRING_SOON' ||
    fdr.riskLevel === 'HIGH' ||
    fdr.riskLevel === 'MEDIUM';

  // Determine whether "Verify Record" is appropriate
  const canVerifyRecord = fdr.status === 'PENDING_VERIFICATION';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header Action Banner (Editorial Style) */}
      <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-stone-500 mb-3">
          <button
            type="button"
            onClick={onBackToRegistry}
            className="hover:text-teal-800 font-medium hover:underline inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>FDR Registry</span>
          </button>
          <span>/</span>
          <span className="font-mono text-stone-700">{fdr.referenceNo}</span>
          <span>/</span>
          <span className="font-semibold text-slate-900 font-sans">Dossier Details</span>
        </div>

        {/* Title & Badges */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs bg-stone-100 text-slate-800 px-2.5 py-0.5 rounded-md border border-stone-200">
                {fdr.referenceNo}
              </span>
              {renderStatusBadge(fdr.status, fdr.daysToMaturity)}
              {renderRiskBadge(fdr.riskLevel, fdr.riskScore)}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              {fdr.institutionName}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 font-sans">
              <span>AICTE ID: <strong className="font-mono text-slate-900">{fdr.aictePermanentId}</strong></span>
              <span className="text-stone-300">•</span>
              <span>{fdr.regionalOffice}</span>
              <span className="text-stone-300">•</span>
              <span>State: {fdr.state}</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2 self-start">
            <button
              type="button"
              onClick={onBackToRegistry}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-200/90 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-stone-50 transition-colors shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-stone-400" />
              <span>Back to Registry</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-200/90 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-stone-50 transition-colors shadow-xs"
            >
              <Edit3 className="h-3.5 w-3.5 text-stone-500" />
              <span>Edit Record</span>
            </button>

            <button
              type="button"
              onClick={() => setIsObservationModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-200/90 bg-white px-3.5 py-2 text-xs font-medium text-teal-800 hover:bg-teal-50/50 transition-colors shadow-xs"
            >
              <MessageSquare className="h-3.5 w-3.5 text-teal-800" />
              <span>Record Observation</span>
            </button>

            {/* Request Correction (conditional) */}
            {canRequestCorrection && (
              <button
                type="button"
                onClick={() => setIsCorrectionDialogOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-200/90 bg-amber-50/70 px-3.5 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100/70 transition-colors shadow-xs"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                <span>Request Correction</span>
              </button>
            )}

            {/* Verify Record (conditional) */}
            {canVerifyRecord && (
              <button
                type="button"
                onClick={() => setIsVerifyDialogOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs border border-slate-900"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-300" />
                <span>Verify Record</span>
              </button>
            )}
          </div>
        </div>

        {/* Demo Mode Sub-banner */}
        <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono">
          <div className="flex items-center gap-2 font-sans">
            <Info className="h-3.5 w-3.5 text-teal-800" />
            <span>Interactive Demo: Actions update shared in-memory state across Registry & Dashboard.</span>
          </div>
          <span className="font-mono text-[10px] text-stone-400">PROTOTYPE-LEDGER</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Overview, Verification Compare, Risk Assessment, Documents (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: FDR Overview & Information Comparison */}
          <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="border-b border-stone-200/80 pb-4">
              <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                1. FDR Overview & Deposit Particulars
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Statutory deposit terms, banking details, and maturity calculations under AICTE lien.
              </p>
            </div>

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
              <div className="rounded-lg border border-stone-200/90 bg-stone-50/40 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
                  Deposit Amount
                </span>
                <div className="mt-1 font-serif text-2xl font-semibold tracking-tight text-slate-900">
                  {formatIndianCurrency(fdr.amount)}
                </div>
                <div className="mt-1 text-xs text-stone-500">
                  Statutory security pledge
                </div>
              </div>

              <div className="rounded-lg border border-stone-200/90 bg-stone-50/40 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
                  Banking Institution
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <BankLogoBadge bankName={fdr.bankName} size="sm" />
                  <span className="font-serif text-base font-semibold text-slate-900 truncate">
                    {fdr.bankName}
                  </span>
                </div>
                <div className="mt-1 text-xs text-stone-600">
                  Branch: {fdr.branchName}
                </div>
                <div className="text-[11px] font-mono text-stone-500">
                  IFSC: {fdr.ifscCode}
                </div>
              </div>

              <div className="rounded-lg border border-stone-200/90 bg-stone-50/40 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
                  Maturity Horizon
                </span>
                <div className="mt-1 font-mono text-base font-semibold text-slate-900">
                  {formatIndianDate(fdr.maturityDate, 'short')}
                </div>
                <div
                  className={`mt-1 text-xs font-semibold ${
                    fdr.daysToMaturity < 0
                      ? 'text-rose-700'
                      : fdr.daysToMaturity <= 30
                      ? 'text-amber-700'
                      : 'text-teal-800'
                  }`}
                >
                  {fdr.daysToMaturity < 0
                    ? `Overdue by ${Math.abs(fdr.daysToMaturity)} days`
                    : `${fdr.daysToMaturity} calendar days remaining`}
                </div>
                <div className="text-[11px] text-stone-500 font-mono">
                  Issued: {formatIndianDate(fdr.issueDate, 'short')}
                </div>
              </div>
            </div>

            {/* Distinction: Institution-Submitted vs Independently Verified Information */}
            <div className="border border-stone-200/90 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="bg-stone-50/75 px-4 py-3 border-b border-stone-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                    Verification Reconciliation Ledger
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Distinguishing self-declared institutional entries from independently confirmed banking records.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-stone-500">AUDIT REF: REC-2026-FDR</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-stone-200/80 bg-stone-50/40 text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                      <th className="py-2.5 px-3">Field / Particular</th>
                      <th className="py-2.5 px-3">Institution-Submitted Value</th>
                      <th className="py-2.5 px-3">Independently Verified Record</th>
                      <th className="py-2.5 px-3 text-right">Reconciliation State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {/* Amount */}
                    <tr className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        Principal Deposit Sum
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {formatIndianCurrency(fdr.submittedVsVerified.amount.submitted)}
                      </td>
                      <td className="py-2.5 px-3 text-stone-800">
                        {fdr.submittedVsVerified.amount.verified !== null
                          ? formatIndianCurrency(fdr.submittedVsVerified.amount.verified)
                          : <span className="text-stone-500 italic">Awaiting branch ledger confirmation</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {fdr.submittedVsVerified.amount.status === 'MATCHED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Confirmed Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                            <Clock className="h-3 w-3" />
                            Feed Pending
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Joint Lien Clause */}
                    <tr className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        Joint Lien Clause Marking
                      </td>
                      <td className="py-2.5 px-3 text-stone-800">
                        Declared Pledged in favor of AICTE
                      </td>
                      <td className="py-2.5 px-3 text-stone-800">
                        {fdr.submittedVsVerified.lienMarked.verified ? (
                          <span>Endorsement stamped on bank ledger</span>
                        ) : (
                          <span className="text-stone-500 italic">Branch confirmation pending</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {fdr.submittedVsVerified.lienMarked.status === 'CONFIRMED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                            <Clock className="h-3 w-3" />
                            Pending Confirmation
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Joint Pledge Holders */}
                    <tr className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        Joint Title Nomenclature
                      </td>
                      <td className="py-2.5 px-3 text-stone-800 max-w-xs truncate">
                        {fdr.submittedVsVerified.jointHolders.submitted}
                      </td>
                      <td className="py-2.5 px-3 text-stone-800 max-w-xs truncate">
                        {fdr.submittedVsVerified.jointHolders.verified || (
                          <span className="text-stone-500 italic">Verification in progress</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {fdr.submittedVsVerified.jointHolders.status === 'MATCHED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Matched
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                            <AlertCircle className="h-3 w-3" />
                            Discrepancy Flag
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Branch Confirmation Channel */}
                    <tr className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        Branch Handshake Channel
                      </td>
                      <td className="py-2.5 px-3 text-stone-800">
                        Physical Branch Endorsement Letter
                      </td>
                      <td className="py-2.5 px-3 text-stone-800">
                        {fdr.bankName} ({fdr.branchName})
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800">
                          {fdr.submittedVsVerified.branchConfirmationStatus}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION 2: Risk Assessment */}
          <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="border-b border-stone-200/80 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                  2. Risk Assessment & Regulatory Factors
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Algorithmically weighted compliance indicators based on maturity proximity, verification status, and lien validity.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider text-[11px]">Computed Score:</span>
                <span className="font-mono text-base font-semibold text-slate-900 bg-stone-100 px-2.5 py-0.5 rounded-md border border-stone-200">
                  {fdr.riskScore}/100
                </span>
              </div>
            </div>

            {/* Score visual meter (minimal enterprise bar) */}
            <div>
              <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5 font-sans">
                <span>Compliance Safety Threshold</span>
                <span className="font-semibold text-slate-900">
                  {fdr.riskLevel === 'HIGH' ? 'Critical Action Zone' : fdr.riskLevel === 'MEDIUM' ? 'Attention Zone' : 'Compliant Zone'}
                </span>
              </div>
              <div className="h-2 w-full rounded bg-stone-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    fdr.riskLevel === 'HIGH'
                      ? 'bg-rose-600'
                      : fdr.riskLevel === 'MEDIUM'
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, fdr.riskScore))}%` }}
                />
              </div>
            </div>

            {/* Risk Factors Breakdown with Evidence */}
            <div className="space-y-3 font-sans">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                Identified Risk Factors & Evidentiary Findings
              </h4>

              <div className="space-y-2.5">
                {fdr.riskFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="border border-stone-200/90 rounded-lg p-3.5 bg-stone-50/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        {factor.severity === 'HIGH' ? (
                          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                        ) : factor.severity === 'MEDIUM' ? (
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-teal-800 shrink-0" />
                        )}
                        <span>{factor.factor}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          factor.severity === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : factor.severity === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-200 text-stone-800'
                        }`}
                      >
                        {factor.severity}
                      </span>
                    </div>

                    <p className="text-stone-600 leading-relaxed">
                      {factor.description}
                    </p>

                    <div className="rounded-md bg-white p-2.5 border border-stone-200 text-slate-800 font-mono text-[11px]">
                      <span className="font-semibold text-stone-500 font-sans mr-1">Evidence:</span>
                      {factor.evidence}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Next Actions */}
            <div className="border-t border-stone-100 pt-4 space-y-2 font-sans">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                Recommended Regulatory Actions
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700">
                {fdr.recommendedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-teal-800 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Statutory Fraud Safeguard Note */}
            <div className="rounded-lg border border-stone-200/90 bg-stone-50/60 p-4 flex items-start gap-3 text-xs text-stone-700">
              <ShieldAlert className="h-4 w-4 text-teal-800 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-slate-900">Statutory Governance Safeguard:</strong> Discrepancies or pending document uploads represent procedural reconciliation flags under AICTE regulations. They must never be labeled or treated as fraudulent without formal inquiry and multi-tier council endorsement.
              </div>
            </div>
          </div>

          {/* SECTION 3: Document Section */}
          <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200/80 pb-4">
              <div>
                <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                  3. Uploaded Statutory Documents
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Institutional filings and bank endorsement exhibits (Clearly marked sample artifacts).
                </p>
              </div>

              <span className="text-xs font-mono font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200 self-start sm:self-auto">
                {fdr.documents.length} Exhibits Registered
              </span>
            </div>

            {/* Visual Certificate Exhibit & OCR Reconciliation */}
            <div className="pt-1 pb-2">
              <CertificatePreviewVisual fdr={fdr} allowToggleMode={true} />
            </div>

            <div className="space-y-3 font-sans">
              {fdr.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-lg border border-stone-200/90 bg-stone-50/40 hover:bg-stone-50/80 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white text-teal-800 mt-0.5">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">
                          {doc.filename}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200">
                          {doc.fileSize}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {doc.docType} • Uploaded {doc.uploadedAt}
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1 italic">
                        {doc.notes}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        doc.reviewStatus === 'OFFICER_VERIFIED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : doc.reviewStatus === 'DISCREPANCY_FLAGGED'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {doc.reviewStatus === 'OFFICER_VERIFIED'
                        ? 'Officer Verified'
                        : doc.reviewStatus === 'DISCREPANCY_FLAGGED'
                        ? 'Discrepancy Flag'
                        : 'Review Pending'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setPreviewDocument(doc)}
                      className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
                    >
                      <span>Preview</span>
                      <ExternalLink className="h-3 w-3 text-stone-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-stone-200/90 bg-stone-50/60 p-3 text-xs text-stone-600 flex items-center gap-2 font-sans">
              <Info className="h-4 w-4 text-teal-800 shrink-0" />
              <span>
                <strong>Document Authenticity Policy:</strong> Demo documents represent simulated test exhibits. No claim of authenticity or automated bank confirmation is fabricated.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Lifecycle Timeline & Scrutiny Observations (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* SECTION 4: Lifecycle Timeline */}
          <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="border-b border-stone-200/80 pb-3">
              <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                4. Lifecycle Timeline
              </h3>
              <p className="text-xs text-stone-500 mt-0.5 font-sans">
                Audit trail of regulatory filings, notices, and approvals.
              </p>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 font-sans">
              {fdr.timeline.map((event) => (
                <div key={event.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-stone-100 shadow-xs ring-1 ring-stone-200 group-hover:ring-teal-700 transition-all">
                    {renderTimelineIcon(event.type)}
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono text-stone-500">
                      {event.timestamp}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 leading-snug">
                      {event.action}
                    </div>
                    <div className="text-[11px] text-teal-800 font-medium">
                      By: {event.actor}
                    </div>
                    <p className="text-xs text-stone-600 pt-0.5 leading-relaxed">
                      {event.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: Scrutiny Observations */}
          <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] font-sans">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
              <div>
                <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                  5. Scrutiny Observations
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Internal notes recorded by scrutiny officers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsObservationModalOpen(true)}
                className="text-xs font-semibold text-teal-800 hover:text-teal-900 inline-flex items-center gap-1 hover:underline"
              >
                <span>Add Note</span>
              </button>
            </div>

            {(!fdr.scrutinyNotes || fdr.scrutinyNotes.length === 0) ? (
              <div className="text-xs text-stone-500 py-4 text-center">
                No scrutiny observations recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {fdr.scrutinyNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-stone-200/90 bg-stone-50/40 p-3.5 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-900">
                        {note.officer}
                      </span>
                      <span className="text-stone-500 font-mono text-[10px]">
                        {note.timestamp}
                      </span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                      {note.category.replace('_', ' ')}
                    </div>
                    <p className="text-stone-700 mt-1 leading-relaxed">
                      {note.note}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Institutional Contact & Joint Pledge Summary */}
          <div className="rounded-lg border border-stone-200/90 bg-white p-6 space-y-3 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.02)] font-sans">
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] border-b border-stone-200/80 pb-2">
              Statutory Joint Holder Reference
            </h4>
            <div className="space-y-2 text-stone-700">
              <div>
                <span className="text-stone-500 block text-[11px]">Joint Pledge Holder:</span>
                <span className="font-medium text-slate-900">{fdr.jointHolder}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Council Office:</span>
                <span className="font-medium text-slate-900">{fdr.regionalOffice}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Core Banking IFSC:</span>
                <span className="font-mono font-medium text-slate-900">{fdr.ifscCode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Edit Record Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-stone-200/80 bg-stone-50/70 px-6 py-4">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-teal-800" />
                <h3 className="font-serif text-base font-semibold text-slate-900">
                  Edit FDR Record (Prototype Mode)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-md p-1.5 text-stone-400 hover:text-slate-800 hover:bg-stone-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-900 mb-1">
                  Deposit Amount (₹ INR)
                </label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full rounded-md border border-stone-200 bg-stone-50/30 p-2 text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-900 mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={editBranch}
                  onChange={(e) => setEditBranch(e.target.value)}
                  className="w-full rounded-md border border-stone-200 bg-stone-50/30 p-2 text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-900 mb-1">
                  Maturity Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={editMaturityDate}
                  onChange={(e) => setEditMaturityDate(e.target.value)}
                  className="w-full rounded-md border border-stone-200 bg-stone-50/30 p-2 text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-900 mb-1">
                  Joint Holder Nomenclature
                </label>
                <input
                  type="text"
                  value={editJointHolder}
                  onChange={(e) => setEditJointHolder(e.target.value)}
                  className="w-full rounded-md border border-stone-200 bg-stone-50/30 p-2 text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div className="rounded-lg border border-teal-200/80 bg-teal-50/50 p-3 text-[11px] text-teal-900">
                Notice: Changes will update this record across the FDR Registry and Dashboard for the current session.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200/80">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-md border border-stone-200 bg-white px-3.5 py-1.5 font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-1.5 font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Scrutiny Observation Dialog */}
      {isObservationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-stone-200/80 bg-stone-50/70 px-6 py-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-teal-800" />
                <h3 className="font-serif text-base font-semibold text-slate-900">
                  Record Scrutiny Observation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsObservationModalOpen(false)}
                className="rounded-md p-1.5 text-stone-400 hover:text-slate-800 hover:bg-stone-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveObservation} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-900 mb-1">
                  Observation Classification
                </label>
                <select
                  value={observationCategory}
                  onChange={(e) =>
                    setObservationCategory(
                      e.target.value as 'AUDIT_NOTE' | 'COMPLIANCE_NOTICE' | 'LEGAL_ADVISORY'
                    )
                  }
                  className="w-full rounded-md border border-stone-200 bg-white p-2 text-slate-900 focus:border-teal-700 focus:outline-hidden"
                >
                  <option value="AUDIT_NOTE">Audit Note (Internal Examination)</option>
                  <option value="COMPLIANCE_NOTICE">Compliance Notice (To Institution)</option>
                  <option value="LEGAL_ADVISORY">Legal Advisory (Tripartite Lien)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-900 mb-1">
                  Officer Designation
                </label>
                <input
                  type="text"
                  disabled
                  value="Shri R. K. Sharma (Scrutiny Officer, AICTE)"
                  className="w-full rounded-md border border-stone-200 bg-stone-50/70 p-2 text-stone-600 font-medium font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-900 mb-1">
                  Official Observation / Findings
                </label>
                <textarea
                  rows={4}
                  value={observationText}
                  onChange={(e) => setObservationText(e.target.value)}
                  placeholder="Detail the scrutiny findings, discrepancy notes, or verification reconciliation status..."
                  className="w-full rounded-md border border-stone-200 bg-stone-50/30 p-2 text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200/80">
                <button
                  type="button"
                  onClick={() => setIsObservationModalOpen(false)}
                  className="rounded-md border border-stone-200 bg-white px-3.5 py-1.5 font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-1.5 font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Append Observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: Verify Record */}
      {isVerifyDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden p-6 space-y-4 font-sans">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-slate-900">
                  Confirm Statutory Verification
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Ref: {fdr.referenceNo}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              Are you sure you want to verify this Fixed Deposit Receipt? This will transition the status to <strong>Active & Verified</strong>, lower the risk tier to Low, and record your regulatory sign-off in the audit trail.
            </p>

            <div className="rounded-lg border border-teal-200/80 bg-teal-50/50 p-3 text-[11px] text-teal-900 leading-relaxed">
              <strong>Demo Disclaimer:</strong> This action updates the local session data. No actual bank clearing or SFMS transmission is executed.
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200/80">
              <button
                type="button"
                onClick={() => setIsVerifyDialogOpen(false)}
                className="rounded-md border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerification}
                className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                Confirm Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: Request Correction */}
      {isCorrectionDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden p-6 space-y-4 text-xs font-sans">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-slate-900">
                  Issue Correction Directive to Institution
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Institutional ID: {fdr.aictePermanentId}
                </p>
              </div>
            </div>

            <p className="text-stone-700 leading-relaxed">
              Draft the statutory rectification instructions to be logged against this deposit. The institution will be flagged for clarification in the registry.
            </p>

            <div>
              <label className="block font-medium text-slate-900 mb-1">
                Correction Directive Text:
              </label>
              <textarea
                rows={3}
                value={correctionDirective}
                onChange={(e) => setCorrectionDirective(e.target.value)}
                className="w-full rounded-md border border-stone-200 bg-stone-50/30 p-2 text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200/80">
              <button
                type="button"
                onClick={() => setIsCorrectionDialogOpen(false)}
                className="rounded-md border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCorrectionRequest}
                className="rounded-md bg-amber-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-900 transition-colors shadow-xs"
              >
                Dispatch Correction Directive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAMPLE ARTIFACT PREVIEW DIALOG */}
      {previewDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-stone-200/80 bg-stone-50/70 px-6 py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-800" />
                <h3 className="font-serif text-base font-semibold text-slate-900">
                  Sample Document Exhibit Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="rounded-md p-1.5 text-stone-400 hover:text-slate-800 hover:bg-stone-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Document Banner & Visual Certificate Exhibit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 font-mono">{previewDocument.filename}</span>
                    <span className="text-[10px] text-stone-500 font-mono bg-white px-2 py-0.5 rounded border border-stone-200">{previewDocument.fileSize}</span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Uploaded: {previewDocument.uploadedAt} • Status: <span className="font-semibold text-teal-800">{previewDocument.reviewStatus.replace('_', ' ')}</span>
                  </div>
                </div>

                <CertificatePreviewVisual fdr={fdr} allowToggleMode={true} />
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-900 leading-relaxed font-sans">
                <strong>Important Notice:</strong> This exhibit is a simulated prototype artifact for compliance workflow testing. AICTE does not claim automated banking verification or endorse external authenticity in this demo view.
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewDocument(null)}
                  className="rounded-md bg-slate-900 px-4 py-1.5 font-medium text-white hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
