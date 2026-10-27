import React, { useState } from 'react';
import { Sidebar } from './Sidebar.tsx';
import { TopNav } from './TopNav.tsx';
import { CommandCentrePage } from '../pages/CommandCentrePage.tsx';
import { FDRRegistryPage } from '../pages/FDRRegistryPage.tsx';
import { FDRDetailsPage } from '../pages/FDRDetailsPage.tsx';
import { InstitutionsPage } from '../pages/InstitutionsPage.tsx';
import { AIScrutinyPage } from '../pages/AIScrutinyPage.tsx';
import { DeadlinesPage } from '../pages/DeadlinesPage.tsx';
import { RenewalsPage } from '../pages/RenewalsPage.tsx';
import { ReleaseRequestsPage } from '../pages/ReleaseRequestsPage.tsx';
import { ReportsPage } from '../pages/ReportsPage.tsx';
import { AuditTrailPage } from '../pages/AuditTrailPage.tsx';
import { SettingsPage } from '../pages/SettingsPage.tsx';
import { NavViewId, NAV_ITEMS } from '../../types/navigation.ts';
import { FDRRecord, SAMPLE_FDR_DATASET } from '../../data/fdrData.ts';

export const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavViewId>('command-centre');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Desktop sidebar collapsed state with localStorage persistence
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fdr_sentinel_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('fdr_sentinel_sidebar_collapsed', String(next));
      } catch {
        // ignore in restricted context
      }
      return next;
    });
  };

  // Shared in-memory dataset state across all pages
  const [fdrDataset, setFdrDataset] = useState<FDRRecord[]>(SAMPLE_FDR_DATASET);
  const [selectedFDRId, setSelectedFDRId] = useState<string | null>(null);

  const activeItem =
    NAV_ITEMS.find((item) => item.id === currentView) || NAV_ITEMS[0];

  const handleSelectView = (viewId: NavViewId) => {
    setCurrentView(viewId);
    setSelectedFDRId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFDR = (fdrId: string) => {
    setSelectedFDRId(fdrId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToRegistry = () => {
    setSelectedFDRId(null);
    setCurrentView('fdr-registry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateFDR = (updatedFDR: FDRRecord) => {
    setFdrDataset((prev) =>
      prev.map((rec) => (rec.id === updatedFDR.id ? updatedFDR : rec))
    );
  };

  const handleAddFDR = (newRecord: FDRRecord) => {
    setFdrDataset((prev) => [newRecord, ...prev]);
    setSelectedFDRId(newRecord.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFDR = selectedFDRId
    ? fdrDataset.find((rec) => rec.id === selectedFDRId) || null
    : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={handleSelectView}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content Area (Offset by 72 (18rem) or 20 (5rem) on md screens) */}
      <div
        className={`flex min-h-screen flex-col transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-72'
        }`}
      >
        {/* Top Navigation */}
        <TopNav
          activeItem={activeItem}
          customTitle={
            activeFDR
              ? `${activeFDR.referenceNo} · Dossier`
              : undefined
          }
          onOpenMobileSidebar={() => setIsMobileMenuOpen(true)}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeFDR ? (
            <FDRDetailsPage
              fdr={activeFDR}
              onBackToRegistry={handleBackToRegistry}
              onUpdateFDR={handleUpdateFDR}
              onNavigate={handleSelectView}
            />
          ) : currentView === 'command-centre' ? (
            <CommandCentrePage
              onNavigate={handleSelectView}
              dataset={fdrDataset}
              onSelectFDR={handleSelectFDR}
            />
          ) : currentView === 'fdr-registry' ? (
            <FDRRegistryPage
              onNavigate={handleSelectView}
              dataset={fdrDataset}
              onSelectFDR={handleSelectFDR}
              onAddFDR={handleAddFDR}
            />
          ) : currentView === 'institutions' ? (
            <InstitutionsPage
              dataset={fdrDataset}
              onSelectFDR={handleSelectFDR}
            />
          ) : currentView === 'ai-scrutiny' ? (
            <AIScrutinyPage
              dataset={fdrDataset}
              onSelectFDR={handleSelectFDR}
              onUpdateFDR={handleUpdateFDR}
            />
          ) : currentView === 'deadlines' ? (
            <DeadlinesPage
              dataset={fdrDataset}
              onSelectFDR={handleSelectFDR}
              onUpdateFDR={handleUpdateFDR}
            />
          ) : currentView === 'renewals' ? (
            <RenewalsPage
              dataset={fdrDataset}
              onSelectFDR={handleSelectFDR}
              onUpdateFDR={handleUpdateFDR}
            />
          ) : currentView === 'release-requests' ? (
            <ReleaseRequestsPage
              dataset={fdrDataset}
              onSelectFDR={handleSelectFDR}
              onUpdateFDR={handleUpdateFDR}
            />
          ) : currentView === 'reports' ? (
            <ReportsPage
              dataset={fdrDataset}
            />
          ) : currentView === 'audit-trail' ? (
            <AuditTrailPage
              dataset={fdrDataset}
              onSelectFDR={handleSelectFDR}
            />
          ) : currentView === 'settings' ? (
            <SettingsPage />
          ) : (
            <CommandCentrePage
              onNavigate={handleSelectView}
              dataset={fdrDataset}
              onSelectFDR={handleSelectFDR}
            />
          )}
        </main>
      </div>
    </div>
  );
};
