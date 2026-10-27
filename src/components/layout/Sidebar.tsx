import React, { useState } from 'react';
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
  Award,
  ChevronDown,
  ChevronRight,
  BarChart3,
  AlertCircle,
  PieChart,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { NavItem, NavViewId, NAV_ITEMS } from '../../types/navigation.ts';
import { GovernmentSeal } from '../visuals/GovernmentSeal.tsx';

interface SidebarProps {
  currentView: NavViewId;
  onSelectView: (viewId: NavViewId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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

// Sub-navigation anchors for Command Centre
const COMMAND_CENTRE_SUB_ITEMS = [
  { id: 'cc-overview', label: 'Overview', hash: '#overview-kpis', icon: LayoutGrid },
  { id: 'cc-maturity', label: 'Upcoming Maturities', hash: '#maturity-horizon', icon: BarChart3 },
  { id: 'cc-urgent', label: 'Urgent Cases', hash: '#urgent-cases', icon: AlertCircle },
  { id: 'cc-corpus', label: 'Deposit Breakdown', hash: '#corpus-distribution', icon: PieChart },
];

// Logical navigation groups for editorial government portal hierarchy
const NAV_GROUPS: { title: string; itemIds: NavViewId[] }[] = [
  {
    title: 'Surveillance & Registry',
    itemIds: ['command-centre', 'fdr-registry', 'institutions'],
  },
  {
    title: 'Scrutiny & Workflows',
    itemIds: ['ai-scrutiny', 'deadlines', 'renewals', 'release-requests'],
  },
  {
    title: 'Governance & Audit',
    itemIds: ['reports', 'audit-trail', 'settings'],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  // Command Centre collapsible section state
  const [isCommandCentreExpanded, setIsCommandCentreExpanded] = useState<boolean>(true);

  const handleSubItemClick = (hash: string) => {
    if (currentView !== 'command-centre') {
      onSelectView('command-centre');
    }
    onCloseMobile();
    // Smooth scroll to target section after view switch
    setTimeout(() => {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

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

      {/* Sidebar container with responsive width: w-72 on mobile or expanded desktop, md:w-20 on collapsed desktop */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200/90 bg-[#fbfcfd] transition-all duration-200 ease-in-out shadow-[1px_0_10px_rgba(0,0,0,0.02)] ${
          isOpenMobile
            ? 'translate-x-0 w-72'
            : `-translate-x-full md:translate-x-0 ${isCollapsed ? 'md:w-20 w-72' : 'md:w-72 w-72'}`
        }`}
      >
        {/* Brand / Logo section (Editorial government header) */}
        <div className={`flex h-20 items-center border-b border-slate-200/80 bg-white ${
          isCollapsed ? 'px-2 justify-center' : 'px-5 justify-between'
        }`}>
          {isCollapsed ? (
            /* Collapsed Desktop Header */
            <div className="flex flex-col items-center justify-center gap-1.5 w-full">
              <GovernmentSeal size="sm" />
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden md:inline-flex rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-teal-800 transition-colors"
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                >
                  <PanelLeftOpen className="h-4 w-4 text-teal-800" />
                </button>
              )}
            </div>
          ) : (
            /* Expanded Header */
            <>
              <div className="flex items-center gap-3 min-w-0">
                <GovernmentSeal size="md" />
                <div className="flex flex-col min-w-0">
                  <span className="font-serif text-lg font-semibold tracking-tight text-slate-900 truncate">
                    FDR Sentinel
                  </span>
                  <span className="text-[10px] font-medium tracking-wide uppercase text-slate-500 truncate">
                    FDR & Deposit Management
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Desktop Collapse Button */}
                {onToggleCollapse && (
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    className="hidden md:inline-flex rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    title="Collapse sidebar to icon rail"
                    aria-label="Collapse sidebar"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </button>
                )}

                {/* Mobile Drawer Close Button */}
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Government Jurisdiction Sub-bar */}
        {isCollapsed ? (
          <div
            className="py-2 flex justify-center bg-slate-50 border-b border-slate-200/70"
            title="Govt. of India · Statutory Registry · AY 26–27"
          >
            <Award className="h-3.5 w-3.5 text-teal-800" />
          </div>
        ) : (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 truncate">
              <Award className="h-3 w-3 text-teal-800 shrink-0" />
              <span className="truncate">Govt. of India · Statutory Registry</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">AY 26–27</span>
          </div>
        )}

        {/* Navigation list grouped logically */}
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2 py-3 space-y-3' : 'px-3.5 py-4 space-y-5'}`}>
          {NAV_GROUPS.map((group, groupIndex) => {
            const groupItems = group.itemIds
              .map((id) => NAV_ITEMS.find((item) => item.id === id))
              .filter((item): item is NavItem => Boolean(item));

            return (
              <div key={group.title}>
                {/* Group Heading or Divider */}
                {isCollapsed ? (
                  groupIndex > 0 && <div className="h-px bg-slate-200/70 mx-2 my-2" />
                ) : (
                  <div className="mb-1.5 px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    {group.title}
                  </div>
                )}

                <nav className="space-y-1">
                  {groupItems.map((item) => {
                    const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
                    const isActive = currentView === item.id;
                    const isCommandCentreItem = item.id === 'command-centre';

                    if (isCollapsed) {
                      /* Collapsed Icon-Only View */
                      return (
                        <div key={item.id} className="space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectView(item.id);
                              onCloseMobile();
                            }}
                            title={item.label}
                            aria-label={item.label}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-all ${
                              isActive
                                ? 'bg-white text-teal-900 font-semibold shadow-xs border border-slate-200 ring-1 ring-slate-900/5'
                                : 'text-slate-500 hover:bg-white/80 hover:text-slate-900'
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 ${isActive ? 'text-teal-800' : 'text-slate-500'}`}
                              strokeWidth={isActive ? 2.2 : 1.8}
                            />
                          </button>

                          {/* Sub-items in collapsed mode: rendered as compact stacked icons if CC is expanded */}
                          {isCommandCentreItem && isCommandCentreExpanded && (
                            <div
                              className="py-1 flex flex-col items-center gap-1 border-y border-slate-200/60 my-1 bg-slate-100/50 rounded-md"
                              title="Command Centre Sub-sections"
                            >
                              {COMMAND_CENTRE_SUB_ITEMS.map((subItem) => {
                                const SubIcon = subItem.icon;
                                return (
                                  <button
                                    key={subItem.id}
                                    type="button"
                                    onClick={() => handleSubItemClick(subItem.hash)}
                                    title={`Command Centre: ${subItem.label}`}
                                    aria-label={subItem.label}
                                    className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-white hover:text-teal-800 transition-colors"
                                  >
                                    <SubIcon className="h-3.5 w-3.5" />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    /* Expanded Full-Text View */
                    return (
                      <div key={item.id} className="space-y-1">
                        <div
                          className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200/90 border-l-3 border-l-teal-800'
                              : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                          }`}
                        >
                          {/* Main Nav Button */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectView(item.id);
                              if (isCommandCentreItem && !isCommandCentreExpanded) {
                                setIsCommandCentreExpanded(true);
                              }
                              onCloseMobile();
                            }}
                            className="flex flex-1 items-center gap-2.5 min-w-0 text-left focus:outline-hidden"
                          >
                            <Icon
                              className={`h-4 w-4 shrink-0 transition-colors ${
                                isActive
                                  ? 'text-teal-800'
                                  : 'text-slate-400 group-hover:text-slate-700'
                              }`}
                              strokeWidth={isActive ? 2.2 : 1.8}
                            />
                            <span className="truncate tracking-tight">{item.label}</span>
                          </button>

                          {/* Command Centre Collapsible Chevron Toggle */}
                          {isCommandCentreItem ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCommandCentreExpanded((prev) => !prev);
                              }}
                              aria-label={
                                isCommandCentreExpanded
                                  ? 'Collapse Command Centre navigation'
                                  : 'Expand Command Centre navigation'
                              }
                              aria-expanded={isCommandCentreExpanded}
                              className="ml-1 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-hidden"
                              title={isCommandCentreExpanded ? 'Collapse sub-sections' : 'Expand sub-sections'}
                            >
                              {isCommandCentreExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                              )}
                            </button>
                          ) : (
                            item.badge && (
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold ${
                                  item.badge === 'AI'
                                    ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )
                          )}
                        </div>

                        {/* Command Centre Nested Sub-Navigation (visible when expanded) */}
                        {isCommandCentreItem && isCommandCentreExpanded && (
                          <div className="ml-6 pl-2 border-l border-slate-200/80 space-y-0.5 py-1 transition-all">
                            {COMMAND_CENTRE_SUB_ITEMS.map((subItem) => {
                              const SubIcon = subItem.icon;
                              return (
                                <button
                                  key={subItem.id}
                                  type="button"
                                  onClick={() => handleSubItemClick(subItem.hash)}
                                  className="group flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100/70 hover:text-slate-900 transition-colors text-left"
                                >
                                  <SubIcon className="h-3 w-3 text-slate-400 group-hover:text-teal-800 transition-colors shrink-0" />
                                  <span className="truncate">{subItem.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>

        {/* Footer meta / Government identifier */}
        <div className="border-t border-slate-200/90 bg-white">
          {isCollapsed ? (
            /* Collapsed Footer */
            <div
              className="p-3 flex flex-col items-center justify-center text-center"
              title="Bureau Node 01 · Operational · AICTE HQ"
            >
              <span className="h-2 w-2 rounded-full bg-teal-600" />
              <span className="text-[9px] font-mono font-medium text-slate-400 mt-1">Node 01</span>
            </div>
          ) : (
            /* Expanded Footer */
            <div className="p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-medium text-slate-800">Bureau Node 01</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-teal-800">
                  Operational
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                AICTE HQ · 7th Floor, Chanderlok Bldg., New Delhi
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
