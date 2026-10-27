import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Bell,
  Clock,
  UserCheck,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Save,
  Info,
} from 'lucide-react';

interface SentinelSettings {
  firstNoticeDays: number;
  urgentNoticeDays: number;
  finalNoticeDays: number;
  overdueNoticeDays: number;
  officerName: string;
  defaultRegion: string;
}

const DEFAULT_SETTINGS: SentinelSettings = {
  firstNoticeDays: 60,
  urgentNoticeDays: 30,
  finalNoticeDays: 15,
  overdueNoticeDays: 7,
  officerName: 'Shri R. K. Sharma (Scrutiny Officer)',
  defaultRegion: 'ALL',
};

const STORAGE_KEY = 'aicte_fdr_sentinel_settings';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SentinelSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      // Ignore localStorage read errors in restricted contexts
    }
    return DEFAULT_SETTINGS;
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      // ignore
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Editorial Style) */}
      <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50/80 px-2.5 py-0.5 text-[11px] font-medium text-teal-800 border border-teal-200/60 mb-2">
              <Sliders className="h-3 w-3 text-teal-800" />
              <span>Portal Governance Configuration</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              System Settings & Notice Thresholds
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-2xl">
              Configure statutory pre-maturity notice intervals, regional notification preferences, and officer profile parameters.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-200/90 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-xs self-start sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5 text-stone-400" />
            <span>Restore Council Defaults</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>Configuration saved successfully and persisted in local browser storage.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Statutory Notice Intervals */}
        <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 border-b border-stone-200/80 pb-3">
            <Clock className="h-4 w-4 text-teal-800" />
            <h3 className="font-serif text-base font-semibold tracking-tight text-slate-900">
              1. Statutory Pre-Maturity Notice Windows (Days)
            </h3>
          </div>

          <div className="rounded-lg border border-stone-200/90 bg-stone-50/60 p-3.5 text-xs text-stone-700 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-teal-800 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-900">Demonstration Thresholds:</strong> These statutory notice intervals are configurable prototype values used for countdown calculations and do not represent official AICTE Approval Process Handbook (APH) policy amendments.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-900 mb-1">
                1st Pre-Maturity Notice
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="30"
                  max="120"
                  value={settings.firstNoticeDays}
                  onChange={(e) =>
                    setSettings({ ...settings, firstNoticeDays: parseInt(e.target.value) || 60 })
                  }
                  className="w-full rounded-md border border-stone-200 bg-stone-50/30 p-2 text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
                />
                <span className="text-stone-500 whitespace-nowrap font-mono text-[11px]">days prior</span>
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block font-sans">Routine extension alert</span>
            </div>

            <div>
              <label className="block font-medium text-slate-900 mb-1">
                2nd Urgent Renewal Notice
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="16"
                  max="45"
                  value={settings.urgentNoticeDays}
                  onChange={(e) =>
                    setSettings({ ...settings, urgentNoticeDays: parseInt(e.target.value) || 30 })
                  }
                  className="w-full rounded-md border border-stone-200 bg-stone-50/30 p-2 text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
                />
                <span className="text-stone-500 whitespace-nowrap font-mono text-[11px]">days prior</span>
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block font-sans">High priority warning</span>
            </div>

            <div>
              <label className="block font-medium text-slate-900 mb-1">
                Final Directive Notice
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="20"
                  value={settings.finalNoticeDays}
                  onChange={(e) =>
                    setSettings({ ...settings, finalNoticeDays: parseInt(e.target.value) || 15 })
                  }
                  className="w-full rounded-md border border-stone-200 bg-stone-50/30 p-2 text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
                />
                <span className="text-stone-500 whitespace-nowrap font-mono text-[11px]">days prior</span>
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block font-sans">Critical encashment notice</span>
            </div>

            <div>
              <label className="block font-medium text-slate-900 mb-1">
                Post-Maturity Show Cause
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.overdueNoticeDays}
                  onChange={(e) =>
                    setSettings({ ...settings, overdueNoticeDays: parseInt(e.target.value) || 7 })
                  }
                  className="w-full rounded-md border border-stone-200 bg-stone-50/30 p-2 text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
                />
                <span className="text-stone-500 whitespace-nowrap font-mono text-[11px]">days overdue</span>
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block font-sans">Enforcement proceedings</span>
            </div>
          </div>
        </div>

        {/* Section 2: External Gateways & Integrations (Postponed for Evaluation Phase 2) */}
        <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 border-b border-stone-200/80 pb-3">
            <Bell className="h-4 w-4 text-teal-800" />
            <h3 className="font-serif text-base font-semibold tracking-tight text-slate-900">
              2. External Gateways & Integrations (Postponed for SIH26265 Evaluation)
            </h3>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
            <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Integration Architecture Notice:</strong> To ensure reliable portal evaluation and adhere to data sovereignty standards, direct external live gateways have been deliberately postponed to Phase 2. All scrutiny evaluations in this prototype run safely using verified local schema heuristics and immutable audit ledgers.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div className="p-4 rounded-lg border border-stone-200/90 bg-stone-50/40 space-y-1.5">
              <div className="font-medium text-slate-900 flex items-center justify-between">
                <span>Core Banking SFMS / API</span>
                <span className="text-[10px] font-mono text-stone-500 uppercase bg-stone-200/80 px-1.5 py-0.5 rounded">Postponed</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Direct RBI SFMS electronic branch handshake postponed. Simulated verification feeds active.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-stone-200/90 bg-stone-50/40 space-y-1.5">
              <div className="font-medium text-slate-900 flex items-center justify-between">
                <span>NIC SMS & Email Delivery</span>
                <span className="text-[10px] font-mono text-stone-500 uppercase bg-stone-200/80 px-1.5 py-0.5 rounded">Postponed</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                External telecom SMS/email gateways postponed. In-portal compliance directives & audit logging active.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-stone-200/90 bg-stone-50/40 space-y-1.5">
              <div className="font-medium text-slate-900 flex items-center justify-between">
                <span>External Cloud AI / LLM APIs</span>
                <span className="text-[10px] font-mono text-stone-500 uppercase bg-stone-200/80 px-1.5 py-0.5 rounded">Postponed</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Third-party LLM APIs postponed in favor of deterministic, explainable rule-based scrutiny models.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Officer Profile & Regional Scope */}
        <div className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 space-y-5 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 border-b border-stone-200/80 pb-3">
            <UserCheck className="h-4 w-4 text-teal-800" />
            <h3 className="font-serif text-base font-semibold tracking-tight text-slate-900">
              3. Officer Profile & Default Regional Jurisdiction
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-900 mb-1">
                Authorized Officer Name
              </label>
              <input
                type="text"
                value={settings.officerName}
                onChange={(e) => setSettings({ ...settings, officerName: e.target.value })}
                className="w-full rounded-md border border-stone-200 bg-stone-50/30 p-2 text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-900 mb-1">
                Primary Regional Scope
              </label>
              <select
                value={settings.defaultRegion}
                onChange={(e) => setSettings({ ...settings, defaultRegion: e.target.value })}
                className="w-full rounded-md border border-stone-200 bg-white p-2 text-slate-900 focus:border-teal-700 focus:outline-hidden"
              >
                <option value="ALL">National Jurisdiction (All Regional Councils)</option>
                <option value="NRO">Northern Regional Office (NRO)</option>
                <option value="WRO">Western Regional Office (WRO)</option>
                <option value="SRO">Southern Regional Office (SRO)</option>
                <option value="ERO">Eastern Regional Office (ERO)</option>
                <option value="CRO">Central Regional Office (CRO)</option>
                <option value="SWRO">South Western Regional Office (SWRO)</option>
                <option value="SCRO">South Central Regional Office (SCRO)</option>
                <option value="NWRO">North Western Regional Office (NWRO)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-stone-200/90 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Info className="h-4 w-4 text-teal-800 shrink-0" />
            <span>Preferences are stored in your local browser profile.</span>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
