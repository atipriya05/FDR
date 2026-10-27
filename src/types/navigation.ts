export type NavViewId =
  | 'command-centre'
  | 'fdr-registry'
  | 'institutions'
  | 'ai-scrutiny'
  | 'deadlines'
  | 'renewals'
  | 'release-requests'
  | 'reports'
  | 'audit-trail'
  | 'settings';

export interface NavItem {
  id: NavViewId;
  label: string;
  iconName: string;
  badge?: string;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'command-centre',
    label: 'Command Centre',
    iconName: 'LayoutDashboard',
    description: 'Executive overview, pending actions, and FDR compliance metrics.',
  },
  {
    id: 'fdr-registry',
    label: 'FDR Registry',
    iconName: 'Landmark',
    badge: 'Live',
    description: 'Central register of all institutional Fixed Deposit Receipts and pledges.',
  },
  {
    id: 'institutions',
    label: 'Institutions',
    iconName: 'Building2',
    description: 'AICTE-approved polytechnics, colleges, and university affiliates.',
  },
  {
    id: 'ai-scrutiny',
    label: 'AI Scrutiny',
    iconName: 'ShieldCheck',
    badge: 'AI',
    description: 'Automated verification, OCR extraction, and bank endorsement validation.',
  },
  {
    id: 'deadlines',
    label: 'Deadlines',
    iconName: 'CalendarClock',
    description: 'Upcoming maturity windows and statutory compliance timelines.',
  },
  {
    id: 'renewals',
    label: 'Renewals',
    iconName: 'RefreshCw',
    description: 'Deposit extension requests and bank renewal confirmations.',
  },
  {
    id: 'release-requests',
    label: 'Release Requests',
    iconName: 'FileCheck2',
    description: 'Security deposit discharge and encashment authorization workflows.',
  },
  {
    id: 'reports',
    label: 'Reports',
    iconName: 'FileBarChart2',
    description: 'Audit exports, regional council summaries, and bank-wise ledgers.',
  },
  {
    id: 'audit-trail',
    label: 'Audit Trail',
    iconName: 'History',
    description: 'Immutable ledger of regulatory actions, officer approvals, and edits.',
  },
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'Sliders',
    description: 'Portal governance, notification rules, and role permissions.',
  },
];
