import React from 'react';
import { Menu, Bell, Shield, UserCheck, ChevronRight } from 'lucide-react';
import { NavItem } from '../../types/navigation.ts';

interface TopNavProps {
  activeItem: NavItem;
  customTitle?: string;
  onOpenMobileSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeItem,
  customTitle,
  onOpenMobileSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200/90 bg-white/90 backdrop-blur-md px-4 md:px-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Left side: Mobile trigger & editorial breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 md:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[11px] uppercase tracking-wider text-stone-500 sm:inline">
            AICTE Portal
          </span>
          <ChevronRight className="hidden h-3.5 w-3.5 text-stone-300 sm:inline" />
          <h1 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
            {customTitle || activeItem.label}
          </h1>
        </div>
      </div>

      {/* Right side: Regulatory indicators and profile pill */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Ministry / Authority Badge */}
        <div className="hidden items-center gap-2 rounded-md border border-stone-200/80 bg-stone-50/70 px-2.5 py-1 text-xs text-stone-600 lg:flex">
          <Shield className="h-3.5 w-3.5 text-teal-800" />
          <span className="font-medium">Bureau of Approval</span>
        </div>

        {/* Financial Year / Session */}
        <div className="hidden sm:flex items-center rounded-md border border-stone-200/80 bg-white px-2.5 py-1 font-mono text-xs text-stone-600 shadow-xs">
          AY 2026-27
        </div>

        {/* Notifications trigger */}
        <div className="relative">
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-slate-900 transition-colors"
            aria-label="System notifications"
            title="Regulatory alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-teal-700" />
          </button>
        </div>

        {/* User profile pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200/80 sm:pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-slate-800 border border-stone-200 text-xs font-semibold shadow-xs">
            <UserCheck className="h-4 w-4 text-teal-800" />
          </div>
          <div className="hidden text-left xl:block">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              Shri R. K. Sharma
            </div>
            <div className="text-[11px] font-mono text-stone-500 leading-tight">
              Scrutiny Officer • AICTE HQ
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
