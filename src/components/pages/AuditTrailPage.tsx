import React, { useState, useMemo } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Lock,
} from 'lucide-react';
import {
  FDRRecord,
  SAMPLE_FDR_DATASET,
  SAMPLE_ACTIVITY_EVENTS,
  TimelineEvent,
  formatIndianDate,
} from '../../data/fdrData.ts';

interface AuditTrailPageProps {
  dataset: FDRRecord[];
  onSelectFDR: (fdrId: string) => void;
}

interface UnifiedAuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  category: 'VERIFICATION' | 'SUBMISSION' | 'CORRECTION' | 'SCRUTINY' | 'RENEWAL' | 'RELEASE';
  referenceNo: string;
  fdrId?: string;
}

export const AuditTrailPage: React.FC<AuditTrailPageProps> = ({
  dataset = SAMPLE_FDR_DATASET,
  onSelectFDR,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Combine baseline activity events and all timeline events from dataset
  const unifiedEvents = useMemo<UnifiedAuditEvent[]>(() => {
    const list: UnifiedAuditEvent[] = [];

    // 1. Add baseline sample activity events
    SAMPLE_ACTIVITY_EVENTS.forEach((evt) => {
      const matchedFdr = dataset.find((r) => r.referenceNo === evt.referenceNo);
      list.push({
        id: evt.id,
        timestamp: evt.timestamp,
        actor: 'Statutory Verification Desk',
        action: evt.title,
        details: evt.description,
        category: evt.type as UnifiedAuditEvent['category'],
        referenceNo: evt.referenceNo,
        fdrId: matchedFdr?.id,
      });
    });

    // 2. Add all timeline entries from active dataset
    dataset.forEach((rec) => {
      rec.timeline.forEach((item) => {
        list.push({
          id: item.id,
          timestamp: item.timestamp,
          actor: item.actor,
          action: item.action,
          details: item.details,
          category: item.type as UnifiedAuditEvent['category'],
          referenceNo: rec.referenceNo,
          fdrId: rec.id,
        });
      });
    });

    // Remove duplicates if any
    const seen = new Set<string>();
    return list.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [dataset]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return unifiedEvents.filter((evt) => {
      if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = evt.referenceNo.toLowerCase().includes(q);
        const matchesActor = evt.actor.toLowerCase().includes(q);
        const matchesAction = evt.action.toLowerCase().includes(q);
        const matchesDetails = evt.details.toLowerCase().includes(q);
        if (!matchesRef && !matchesActor && !matchesAction && !matchesDetails) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedEvents, selectedCategory, searchQuery]);

  const renderCategoryBadge = (cat: UnifiedAuditEvent['category']) => {
    switch (cat) {
      case 'VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Verification
          </span>
        );
      case 'CORRECTION':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-800 border border-rose-200">
            <AlertTriangle className="h-3 w-3 text-rose-600" />
            Correction
          </span>
        );
      case 'SCRUTINY':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800 border border-teal-200">
            <ShieldCheck className="h-3 w-3 text-teal-700" />
            Scrutiny
          </span>
        );
      case 'SUBMISSION':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
            <FileText className="h-3 w-3 text-slate-600" />
            Lodgement
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
            {cat}
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
              <History className="h-3 w-3 text-teal-800" />
              <span>AICTE Compliance Ledger</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Audit Trail
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-2xl">
              Chronological log of approvals, scrutiny remarks, and verification events.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-md border border-stone-200/90 bg-stone-50/60 px-3 py-1.5 text-xs text-stone-700 self-start">
            <Lock className="h-3.5 w-3.5 text-teal-800" />
            <span>Ledger Integrity: <strong className="text-slate-900 font-semibold">Verified</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-stone-200/90 bg-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, reference, or details..."
            className="w-full rounded-md border border-stone-200 bg-stone-50/30 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-600 uppercase text-[10px] tracking-wider">Event Type:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-stone-200 bg-stone-50/30 p-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-hidden"
          >
            <option value="ALL">All Event Types ({unifiedEvents.length})</option>
            <option value="VERIFICATION">Verification Sign-offs</option>
            <option value="SCRUTINY">Scrutiny Observations</option>
            <option value="SUBMISSION">Intake & Lodgements</option>
            <option value="CORRECTION">Correction Directives</option>
          </select>
        </div>
      </div>

      {/* Chronological Table */}
      <div className="rounded-lg border border-stone-200/90 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">
            No audit records match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-stone-200/80 bg-stone-50/75 text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                  <th scope="col" className="py-3 px-4">Timestamp</th>
                  <th scope="col" className="py-3 px-3">Actor / Authorizer</th>
                  <th scope="col" className="py-3 px-3">Category</th>
                  <th scope="col" className="py-3 px-3">Record Reference</th>
                  <th scope="col" className="py-3 px-3">Regulatory Description</th>
                  <th scope="col" className="py-3 px-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    className="hover:bg-stone-50/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                      {evt.timestamp}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{evt.actor}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {renderCategoryBadge(evt.category)}
                    </td>

                    <td className="py-3 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {evt.referenceNo}
                    </td>

                    <td className="py-3 px-3 text-stone-700 max-w-md">
                      <div className="font-medium text-slate-900">{evt.action}</div>
                      <div className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                        {evt.details}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {evt.fdrId ? (
                        <button
                          type="button"
                          onClick={() => onSelectFDR(evt.fdrId!)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-800 hover:text-teal-900 hover:underline"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-stone-300 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
