import React from 'react';
import {
  LayoutDashboard,
  Landmark,
  Building2,
  ShieldCheck,
  CalendarClock,
  RefreshCw,
  FileCheck2,
  FileBarChart2,
  History,
  Sliders,
  X,
  Shield,
  Award,
} from 'lucide-react';
import { NavItem, NavViewId, NAV_ITEMS } from '../../types/navigation.ts';
import { GovernmentSeal } from '../visuals/GovernmentSeal.tsx';

interface SidebarProps {
  currentView: NavViewId;
  onSelectView: (viewId: NavViewId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  LayoutDashboard,
  Landmark,
  Building2,
  ShieldCheck,
  CalendarClock,
  RefreshCw,
  FileCheck2,
  FileBarChart2,
  History,
  Sliders,
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-stone-200/90 bg-[#fafaf9] transition-transform duration-200 ease-in-out md:translate-x-0 shadow-[1px_0_10px_rgba(0,0,0,0.02)] ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo section (Editorial government header) */}
        <div className="flex h-20 items-center justify-between border-b border-stone-200/80 px-5 bg-white/60">
          <div className="flex items-center gap-3">
            <GovernmentSeal size="md" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                  FDR Sentinel
                </span>
                <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-widest text-teal-800 uppercase border border-teal-200/70">
                  AI
                </span>
              </div>
              <span className="text-[10px] font-medium tracking-wide uppercase text-stone-500">
                AICTE • Security Deposit Portal
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Government Jurisdiction Sub-bar */}
        <div className="px-5 py-2.5 bg-stone-100/50 border-b border-stone-200/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-600">
            <Award className="h-3 w-3 text-teal-800" />
            <span>Govt. of India • Statutory Registry</span>
          </div>
          <span className="text-[10px] font-mono text-stone-400">AY 26–27</span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
          <div>
            <div className="mb-2 px-2.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-stone-400">
              Regulatory Navigation
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item: NavItem) => {
                const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectView(item.id);
                      onCloseMobile();
                    }}
                    className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-slate-950 font-semibold shadow-xs border border-stone-200/80 border-l-3 border-l-teal-800'
                        : 'text-stone-600 hover:bg-white/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-teal-800'
                            : 'text-stone-400 group-hover:text-stone-700'
                        }`}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                      <span className="truncate tracking-tight">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold ${
                          item.badge === 'AI'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer meta / Government identifier */}
        <div className="border-t border-stone-200/90 bg-white p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif font-medium text-slate-800">Bureau Node 01</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-teal-800">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
              Connected
            </span>
          </div>
          <p className="mt-1 text-[11px] text-stone-500 leading-tight">
            AICTE HQ • 7th Floor, Chanderlok Bldg., New Delhi
          </p>
        </div>
      </aside>
    </>
  );
};
