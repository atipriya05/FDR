import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Building2,
  Landmark,
  X,
  Info,
} from 'lucide-react';
import {
  FDRRecord,
  SAMPLE_FDR_DATASET,
  TimelineEvent,
  SYSTEM_TODAY_DATE,
  formatIndianCurrency,
  formatIndianDate,
} from '../../data/fdrData.ts';

interface ReleaseRequestsPageProps {
  dataset: FDRRecord[];
  onSelectFDR: (fdrId: string) => void;
  onUpdateFDR?: (updated: FDRRecord) => void;
}

interface ReleaseRequest {
  id: string;
  requestRef: string;
  institutionName: string;
  aictePermanentId: string;
  fdrReference: string;
  fdrId: string;
  amount: number;
  submittedDate: string;
  statutoryGround: string;
  approvalStatus:
    | 'PENDING_BUREAU_REVIEW'
    | 'REGIONAL_DIRECTOR_CONCURRENCE'
    | 'DISCHARGE_APPROVED'
    | 'CLARIFICATION_REQUESTED';
  requiresDirectorSignoff: boolean;
}

const INITIAL_RELEASE_REQUESTS: ReleaseRequest[] = [
  {
    id: 'rel-1',
    requestRef: 'REL/AICTE/2026/0412',
    institutionName: 'Kongu Rural Polytechnic Institute',
    aictePermanentId: '1-1920394',
    fdrReference: 'FDR/SBIN/2019/33019',
    fdrId: 'fdr-019',
    amount: 3500000,
    submittedDate: '2026-10-12',
    statutoryGround: 'Formal Closure of Unviable Mechanical Engineering Diploma with full student relocation NOC.',
    approvalStatus: 'DISCHARGE_APPROVED',
    requiresDirectorSignoff: false,
  },
  {
    id: 'rel-2',
    requestRef: 'REL/AICTE/2026/0418',
    institutionName: 'Narmada Valley College of Architecture',
    aictePermanentId: '1-4401928',
    fdrReference: 'FDR/BARB/2018/19402',
    fdrId: 'fdr-020',
    amount: 5000000,
    submittedDate: '2026-10-15',
    statutoryGround: 'Surrender of Council Approval after 10 years of statutory tenure fulfillment.',
    approvalStatus: 'DISCHARGE_APPROVED',
    requiresDirectorSignoff: false,
  },
  {
    id: 'rel-3',
    requestRef: 'REL/AICTE/2026/0425',
    institutionName: 'Chola Engineering College & Technology',
    aictePermanentId: '1-8829104',
    fdrReference: 'FDR/IDIB/2021/72910',
    fdrId: 'fdr-013',
    amount: 6500000,
    submittedDate: '2026-10-20',
    statutoryGround: 'Excess corpus realignment upon revision of approved intake capacity under APH 2026-27.',
    approvalStatus: 'REGIONAL_DIRECTOR_CONCURRENCE',
    requiresDirectorSignoff: true,
  },
  {
    id: 'rel-4',
    requestRef: 'REL/AICTE/2026/0430',
    institutionName: 'Bundelkhand Institute of Applied Technology',
    aictePermanentId: '1-3829102',
    fdrReference: 'FDR/PUNB/2021/30291',
    fdrId: 'fdr-002',
    amount: 3500000,
    submittedDate: '2026-10-22',
    statutoryGround: 'Closure of evening shift polytechnic division with state DTE concurrence.',
    approvalStatus: 'PENDING_BUREAU_REVIEW',
    requiresDirectorSignoff: false,
  },
  {
    id: 'rel-5',
    requestRef: 'REL/AICTE/2026/0438',
    institutionName: 'Kalinga Academy of Technical Studies',
    aictePermanentId: '1-7291045',
    fdrReference: 'FDR/CBIN/2023/94012',
    fdrId: 'fdr-003',
    amount: 10000000,
    submittedDate: '2026-10-25',
    statutoryGround: 'Partial deposit release request following university affiliation autonomous status grant.',
    approvalStatus: 'CLARIFICATION_REQUESTED',
    requiresDirectorSignoff: true,
  },
];

export const ReleaseRequestsPage: React.FC<ReleaseRequestsPageProps> = ({
  dataset = SAMPLE_FDR_DATASET,
  onSelectFDR,
  onUpdateFDR,
}) => {
  const [requests, setRequests] = useState<ReleaseRequest[]>(INITIAL_RELEASE_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ReleaseRequest | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      r.requestRef.toLowerCase().includes(q) ||
      r.institutionName.toLowerCase().includes(q) ||
      r.fdrReference.toLowerCase().includes(q)
    );
  });

  const handleApproveDischarge = (req: ReleaseRequest) => {
    // If onUpdateFDR is provided, mark linked FDR as RELEASED and append timeline event
    if (onUpdateFDR) {
      const target = dataset.find((f) => f.id === req.fdrId || f.referenceNo === req.fdrReference);
      if (target) {
        const newTimelineEvent: TimelineEvent = {
          id: `time-rel-${Date.now()}`,
          timestamp: `${formatIndianDate(SYSTEM_TODAY_DATE, 'short')}, 05:30 PM`,
          actor: req.requiresDirectorSignoff
            ? 'Regional Director & Scrutiny Officer (AICTE)'
            : 'Scrutiny Officer (AICTE Bureau)',
          action: 'Security Deposit Encashment / Discharge Authorized',
          details: `Statutory lien discharged and refund order sanctioned under request ${req.requestRef}. Ground: ${req.statutoryGround}`,
          type: 'RELEASE',
        };
        onUpdateFDR({
          ...target,
          status: 'RELEASED',
          timeline: [newTimelineEvent, ...target.timeline],
        });
      }
    }

    setRequests((prev) =>
      prev.map((item) =>
        item.id === req.id
          ? {
              ...item,
              approvalStatus: 'DISCHARGE_APPROVED',
            }
          : item
      )
    );

    const roleNotice = req.requiresDirectorSignoff
      ? ' (Regional Director co-authorization recorded for > ₹50L)'
      : '';

    setActionFeedback(
      `Discharge Authorization approved for ${req.institutionName} (Ref: ${req.requestRef})${roleNotice}. Linked FDR transitioned to Released.`
    );
    setSelectedRequest(null);
    setTimeout(() => setActionFeedback(null), 4500);
  };

  const renderStatusBadge = (status: ReleaseRequest['approvalStatus']) => {
    switch (status) {
      case 'DISCHARGE_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Discharge Approved
          </span>
        );
      case 'REGIONAL_DIRECTOR_CONCURRENCE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
            <Clock className="h-3 w-3 text-amber-600" />
            Awaiting Director Sign-off (&gt;₹50L)
          </span>
        );
      case 'CLARIFICATION_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-800 border border-rose-200">
            <AlertCircle className="h-3 w-3 text-rose-600" />
            Clarification Sought
          </span>
        );
      case 'PENDING_BUREAU_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200">
            <Clock className="h-3 w-3 text-teal-700" />
            Under Bureau Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Editorial Style) */}
      <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50/80 px-2.5 py-0.5 text-[11px] font-medium text-teal-800 border border-teal-200/60 mb-2">
              <FileCheck2 className="h-3 w-3 text-teal-800" />
              <span>Encashment & Security Refund Desk</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Release Requests
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-2xl">
              Review deposit release petitions and lien discharge authorizations.
            </p>
          </div>

          {/* Current Role Banner */}
          <div className="flex items-center gap-2 rounded-md border border-stone-200/90 bg-stone-50/60 px-3 py-1.5 text-xs text-stone-700 self-start">
            <UserCheck className="h-3.5 w-3.5 text-teal-800" />
            <span>Role: <strong className="text-slate-900 font-semibold">Scrutiny Officer (AICTE HQ)</strong></span>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionFeedback && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Role Disclaimer Notice */}
      <div className="rounded-lg border border-stone-200/90 bg-stone-50/60 p-4 text-xs text-stone-700 flex items-start gap-3">
        <Info className="h-4 w-4 text-teal-800 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900">Regulatory Delegation of Financial Powers:</strong> Scrutiny Officers hold authority to clear release requests up to ₹50.00 Lakh upon DTE/University student transfer clearance. Release requests exceeding ₹50.00 Lakh require Regional Director concurrence before bank transmission.
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-lg border border-stone-200/90 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by request ref, institution, or FDR ref..."
            className="w-full rounded-md border border-stone-200 bg-stone-50/30 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
          />
        </div>

        <span className="text-stone-500 font-mono text-[11px]">
          Total Dossiers: <strong className="text-slate-900 font-sans font-semibold">{requests.length}</strong>
        </span>
      </div>

      {/* Release Requests Table */}
      <div className="rounded-lg border border-stone-200/90 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 bg-stone-50/75 text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                <th scope="col" className="py-3 px-4">Request Ref</th>
                <th scope="col" className="py-3 px-3">Institution Name & AICTE ID</th>
                <th scope="col" className="py-3 px-3">Linked FDR Instrument</th>
                <th scope="col" className="py-3 px-3 text-right">Refund Sum</th>
                <th scope="col" className="py-3 px-3">Filing Date</th>
                <th scope="col" className="py-3 px-3">Workflow State</th>
                <th scope="col" className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="hover:bg-stone-50/70 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                    {req.requestRef}
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900 group-hover:text-teal-900">
                      {req.institutionName}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      ID: {req.aictePermanentId}
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-stone-700 whitespace-nowrap">
                    {req.fdrReference}
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-900 text-right whitespace-nowrap">
                    {formatIndianCurrency(req.amount)}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap font-mono text-stone-600">
                    {formatIndianDate(req.submittedDate, 'short')}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    {renderStatusBadge(req.approvalStatus)}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(req);
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1 text-[11px] font-medium text-white hover:bg-slate-800 transition-colors shadow-xs"
                    >
                      <span>Review Petition</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Request Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200/80 bg-stone-50/70 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50 text-teal-800 border border-teal-200/60">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-slate-900">
                    Release Petition Review
                  </h3>
                  <span className="font-mono text-[10px] text-stone-500">{selectedRequest.requestRef}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-md p-1.5 text-stone-400 hover:text-slate-800 hover:bg-stone-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="rounded-lg border border-stone-200/90 bg-stone-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{selectedRequest.requestRef}</span>
                  {renderStatusBadge(selectedRequest.approvalStatus)}
                </div>
                <div className="text-sm font-semibold text-slate-900 font-serif">
                  {selectedRequest.institutionName}
                </div>
                <div className="text-stone-600 font-sans text-xs">
                  Linked FDR: <strong className="font-mono text-slate-900">{selectedRequest.fdrReference}</strong> • Sum: <strong className="text-slate-900">{formatIndianCurrency(selectedRequest.amount)}</strong>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-900 block mb-1.5 text-xs">
                  Statutory Grounds for Security Discharge:
                </span>
                <p className="p-3.5 bg-stone-50/30 border border-stone-200/90 rounded-md text-stone-800 leading-relaxed text-xs">
                  {selectedRequest.statutoryGround}
                </p>
              </div>

              {selectedRequest.requiresDirectorSignoff && (
                <div className="rounded-md border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-900">
                  <strong>Authority Notice:</strong> Because this release amount exceeds ₹50 Lakh, co-concurrence by Regional Director is mandatory before final bank transmission.
                </div>
              )}

              <div className="rounded-md border border-stone-200/90 bg-stone-50/50 p-3 text-[11px] text-stone-600 flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-teal-800 shrink-0 mt-0.5" />
                <span>Notice: Approving this release will simulate Council concurrence and record the sign-off event in the audit trail.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-stone-200/80 bg-stone-50/50 px-6 py-3.5">
              <button
                type="button"
                onClick={() => {
                  const targetFdrId = selectedRequest.fdrId;
                  setSelectedRequest(null);
                  onSelectFDR(targetFdrId);
                }}
                className="text-xs font-semibold text-teal-800 hover:text-teal-900 inline-flex items-center gap-1 hover:underline"
              >
                <span>View Full FDR Dossier</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-md border border-stone-200 bg-white px-3.5 py-1.5 font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Close
                </button>

                {selectedRequest.approvalStatus !== 'DISCHARGE_APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleApproveDischarge(selectedRequest)}
                    className="rounded-md bg-slate-900 px-4 py-1.5 font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    Authorize Discharge (Demo)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
