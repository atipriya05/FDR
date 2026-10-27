import React, { useState } from 'react';
import {
  FileText,
  Scan,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Info,
  ArrowRight,
} from 'lucide-react';
import { FDRRecord } from '../../data/fdrData.ts';
import { NavViewId } from '../../types/navigation.ts';

interface LifecycleProcessFlowProps {
  dataset: FDRRecord[];
  onNavigate?: (viewId: NavViewId) => void;
  className?: string;
}

interface StepInfo {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  statusMatch: (r: FDRRecord) => boolean;
  navView?: NavViewId;
  description: string;
  authority: string;
}

const LIFECYCLE_STEPS: StepInfo[] = [
  {
    id: 'step-1',
    number: '01',
    title: 'Intake Lodgement',
    subtitle: 'Institutional Filing',
    statusMatch: (r) => r.status === 'PENDING_VERIFICATION' && r.scrutinyStatus === 'UNDER_REVIEW',
    navView: 'fdr-registry',
    description: 'Institution deposits statutory collateral with a scheduled commercial bank and registers instrument particulars.',
    authority: 'Sponsoring Trust / Society',
  },
  {
    id: 'step-2',
    number: '02',
    title: 'AI Review',
    subtitle: 'Field Verification',
    statusMatch: (r) => r.scrutinyStatus === 'DISCREPANCY' || r.riskLevel === 'HIGH',
    navView: 'ai-scrutiny',
    description: 'Automated field cross-check against AICTE Approval Process Handbook (APH 2026-27) parameters.',
    authority: 'Scrutiny Officer Desk',
  },
  {
    id: 'step-3',
    number: '03',
    title: 'Bank Handshake',
    subtitle: 'Tripartite Lien Confirmed',
    statusMatch: (r) => r.status === 'ACTIVE' || r.status === 'RENEWED',
    navView: 'institutions',
    description: 'Verification of joint lien endorsement with core banking branch schedule and tripartite seal.',
    authority: 'Scheduled Bank & AICTE RO',
  },
  {
    id: 'step-4',
    number: '04',
    title: 'Maturity Watch',
    subtitle: '60/30/15-Day Directives',
    statusMatch: (r) => r.daysToMaturity <= 30 || r.status === 'EXPIRING_SOON',
    navView: 'deadlines',
    description: 'Automated countdown monitors 5-year statutory tenure and issues compliance extension directives.',
    authority: 'Regional Officer (AICTE)',
  },
  {
    id: 'step-5',
    number: '05',
    title: 'Discharge / Encashment',
    subtitle: 'NOC / Course Surrender',
    statusMatch: (r) => r.status === 'RELEASED',
    navView: 'release-requests',
    description: 'Formal release upon institution course closure NOC or surplus realignment approved by Council.',
    authority: 'Regional Director & Bureau',
  },
];

export const LifecycleProcessFlow: React.FC<LifecycleProcessFlowProps> = ({
  dataset,
  onNavigate,
  className = '',
}) => {
  const [activeStepId, setActiveStepId] = useState<string>('step-3');

  const activeStep = LIFECYCLE_STEPS.find((s) => s.id === activeStepId) || LIFECYCLE_STEPS[2];

  return (
    <div className={`rounded-xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200/80 pb-4 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-semibold text-teal-800 border border-teal-200/60 mb-1">
            <ShieldCheck className="h-3 w-3 text-teal-800" />
            <span>Statutory Lifecycle Architecture</span>
          </div>
          <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
            End-to-End Security Deposit Workflow
          </h3>
          <p className="text-xs text-stone-500">
            Visual pipeline tracing collateral from institutional intake to bank discharge
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
          <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Interactive Stage Pipeline</span>
        </div>
      </div>

      {/* Visual Step Pipeline Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {LIFECYCLE_STEPS.map((step, idx) => {
          const matchCount = dataset.filter(step.statusMatch).length;
          const isSelected = activeStepId === step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStepId(step.id)}
              className={`text-left p-3.5 rounded-lg border transition-all relative group flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-900 bg-stone-50 shadow-xs ring-1 ring-slate-900'
                  : 'border-stone-200/90 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              }`}
            >
              {/* Step indicator arrow for desktop */}
              {idx < LIFECYCLE_STEPS.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <div className="h-4 w-4 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400">
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      isSelected ? 'text-teal-800' : 'text-stone-400'
                    }`}
                  >
                    STAGE {step.number}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      matchCount > 0
                        ? 'bg-slate-900 text-white'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {matchCount}
                  </span>
                </div>

                <div className="font-serif text-sm font-semibold text-slate-900 leading-snug">
                  {step.title}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                  {step.subtitle}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] font-medium text-stone-400 group-hover:text-teal-800">
                <span>Inspect Stage</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Active Stage Detail Drawer */}
      <div className="mt-5 p-4 rounded-lg border border-stone-200/90 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-sans">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
              ACTIVE STAGE {activeStep.number}
            </span>
            <span className="font-serif font-bold text-slate-900 text-sm">
              {activeStep.title} — {activeStep.subtitle}
            </span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            {activeStep.description}
          </p>
          <div className="text-[11px] text-stone-500 pt-0.5">
            Designated Authority: <strong className="text-slate-800">{activeStep.authority}</strong>
          </div>
        </div>

        {onNavigate && activeStep.navView && (
          <button
            type="button"
            onClick={() => onNavigate(activeStep.navView!)}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <span>Open {activeStep.title}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
