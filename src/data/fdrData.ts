export type FDRStatus =
  | 'ACTIVE'
  | 'PENDING_VERIFICATION'
  | 'EXPIRING_SOON'
  | 'MATURED'
  | 'RENEWED'
  | 'RELEASED';

export type FDRRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskFactor {
  factor: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  evidence: string;
}

export interface FDRDocument {
  id: string;
  filename: string;
  docType: string;
  fileSize: string;
  uploadedAt: string; // DD/MM/YYYY
  reviewStatus: 'OFFICER_VERIFIED' | 'PENDING_REVIEW' | 'DISCREPANCY_FLAGGED';
  isSampleArtifact: boolean;
  notes: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // Indian date/time format e.g. "24/10/2026, 11:30 AM"
  actor: string;
  action: string;
  details: string;
  type: 'SUBMISSION' | 'SCRUTINY' | 'CORRECTION' | 'VERIFICATION' | 'RENEWAL' | 'RELEASE';
}

export interface SubmittedVsVerifiedData {
  amount: {
    submitted: number;
    verified: number | null;
    status: 'MATCHED' | 'DISCREPANCY' | 'PENDING_FEED';
  };
  lienMarked: {
    submitted: boolean;
    verified: boolean | null;
    status: 'CONFIRMED' | 'UNCONFIRMED' | 'PENDING_BRANCH';
  };
  jointHolders: {
    submitted: string;
    verified: string | null;
    status: 'MATCHED' | 'DISCREPANCY' | 'PENDING_BRANCH';
  };
  branchConfirmationStatus: 'CONFIRMED' | 'PENDING' | 'REVISION_REQUESTED';
}

export interface ScrutinyNote {
  id: string;
  officer: string;
  timestamp: string;
  category: 'AUDIT_NOTE' | 'COMPLIANCE_NOTICE' | 'LEGAL_ADVISORY';
  note: string;
}

export interface FDRRecord {
  id: string;
  referenceNo: string;
  institutionName: string;
  aictePermanentId: string;
  state: string;
  regionalOffice: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  amount: number; // in INR
  issueDate: string; // ISO format YYYY-MM-DD
  maturityDate: string; // ISO format YYYY-MM-DD
  status: FDRStatus;
  riskLevel: FDRRiskLevel;
  riskScore: number; // 0 to 100
  riskFactors: RiskFactor[];
  recommendedActions: string[];
  submittedVsVerified: SubmittedVsVerifiedData;
  documents: FDRDocument[];
  timeline: TimelineEvent[];
  jointHolder: string; // Joint name with AICTE officer
  scrutinyStatus: 'VERIFIED' | 'UNDER_REVIEW' | 'DISCREPANCY';
  daysToMaturity: number;
  scrutinyNotes?: ScrutinyNote[];
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  timeAgo: string;
  title: string;
  description: string;
  type: 'VERIFICATION' | 'RENEWAL' | 'MATURITY_ALERT' | 'RELEASE_NOTICE';
  referenceNo: string;
}

// Reference system date: 26 October 2026
export const SYSTEM_TODAY_DATE = '2026-10-26';

/**
 * Accurately calculate calendar days to maturity from the reference date (2026-10-26)
 */
export function calculateDaysToMaturity(maturityDateStr: string, refDateStr = SYSTEM_TODAY_DATE): number {
  const [refY, refM, refD] = refDateStr.split('-').map(Number);
  const [matY, matM, matD] = maturityDateStr.split('-').map(Number);

  const ref = new Date(refY, refM - 1, refD);
  const mat = new Date(matY, matM - 1, matD);

  const diffTime = mat.getTime() - ref.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format currency with Indian grouping (Lakhs and Crores)
 * e.g., 5000000 -> ₹50.00 Lakh, 10000000 -> ₹1.00 Cr
 */
export function formatIndianCurrency(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string (YYYY-MM-DD) into Indian standard date (DD/MM/YYYY or DD MMM YYYY)
 * Default to DD/MM/YYYY as requested
 */
export function formatIndianDate(dateStr: string, format: 'short' | 'long' = 'short'): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);

  if (isNaN(date.getTime())) return dateStr;

  const dd = String(day).padStart(2, '0');
  const mm = String(month + 1).padStart(2, '0');

  if (format === 'short') {
    return `${dd}/${mm}/${year}`;
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${day} ${months[month]} ${year}`;
}

/**
 * Helper to generate comprehensive detail data for demo records
 */
function createFullFDRRecord(
  base: Omit<
    FDRRecord,
    | 'daysToMaturity'
    | 'riskScore'
    | 'riskFactors'
    | 'recommendedActions'
    | 'submittedVsVerified'
    | 'documents'
    | 'timeline'
    | 'scrutinyNotes'
  > & {
    riskScore?: number;
    riskFactors?: RiskFactor[];
    recommendedActions?: string[];
    submittedVsVerified?: Partial<SubmittedVsVerifiedData>;
    documents?: FDRDocument[];
    timeline?: TimelineEvent[];
    scrutinyNotes?: ScrutinyNote[];
  }
): FDRRecord {
  const days = calculateDaysToMaturity(base.maturityDate);

  // Compute default risk score if omitted
  let score = base.riskScore;
  if (score === undefined) {
    if (base.riskLevel === 'HIGH') score = days <= 15 ? 88 : 78;
    else if (base.riskLevel === 'MEDIUM') score = 48;
    else score = 15;
  }

  // Generate realistic risk factors based on data
  const riskFactors: RiskFactor[] = base.riskFactors || [];
  if (riskFactors.length === 0) {
    if (days < 0) {
      riskFactors.push({
        factor: 'Maturity Overdue',
        severity: 'HIGH',
        description: 'Statutory term deposit passed the agreed maturity date without renewal pledge certificate.',
        evidence: `Maturity date was ${formatIndianDate(base.maturityDate)}, overdue by ${Math.abs(days)} calendar days.`,
      });
    } else if (days <= 30) {
      riskFactors.push({
        factor: 'Imminent Maturity Horizon',
        severity: days <= 15 ? 'HIGH' : 'MEDIUM',
        description: 'Deposit maturity date is within the critical 30-day statutory notice threshold.',
        evidence: `Only ${days} days remaining before term completion. Mandatory 30-day pre-maturity notice cycle active.`,
      });
    }

    if (base.scrutinyStatus === 'DISCREPANCY') {
      riskFactors.push({
        factor: 'Bank Endorsement Under Reconciliation',
        severity: 'HIGH',
        description: 'Branch endorsement document contains wording deviations from the standard tripartite format.',
        evidence: 'Lien clause references local branch code instead of central AICTE approval schedule identifier.',
      });
    } else if (base.status === 'PENDING_VERIFICATION') {
      riskFactors.push({
        factor: 'Branch Feed Awaiting Handshake',
        severity: 'MEDIUM',
        description: 'Branch manager confirmation letter submitted but core banking SFMS transmission pending.',
        evidence: `Submitted via portal on ${formatIndianDate(base.issueDate)}; branch IFSC ${base.ifscCode} confirmation outstanding.`,
      });
    } else {
      riskFactors.push({
        factor: 'Routine Institutional Monitoring',
        severity: 'LOW',
        description: 'Security deposit complies with AICTE Approval Process Handbook guidelines.',
        evidence: `Verified multi-year pledge with ${base.bankName}. Regular quarterly audit cycle active.`,
      });
    }
  }

  // Recommended next actions
  const recommendedActions = base.recommendedActions || (
    days < 0
      ? [
          'Dispatch immediate show-cause notice for non-renewal of mandatory security deposit.',
          'Issue formal directive to Sponsoring Society President and College Principal.',
          'Notify Regional Officer for encashment contingency appraisal.',
        ]
      : days <= 30
      ? [
          'Transmit automated 15-day statutory renewal reminder via registered email and SMS.',
          'Solicit revised fixed deposit renewal advice letter from the designated bank branch.',
          'Schedule institutional dossier for upcoming Regional Committee review.',
        ]
      : base.status === 'PENDING_VERIFICATION'
      ? [
          'Verify tripartite clause phrasing against AICTE Standard Form Appendix 8.',
          'Contact bank branch verification nodal officer for electronic confirmation.',
          'Upon reconciliation, record scrutiny sign-off to transition deposit to Active status.',
        ]
      : [
          'Maintain in active statutory compliance registry.',
          'Perform automated biannual interest rate and lien confirmation sweep.',
        ]
  );

  // Submitted vs Independently Verified Particulars
  const submittedVsVerified: SubmittedVsVerifiedData = {
    amount: {
      submitted: base.amount,
      verified: base.scrutinyStatus === 'DISCREPANCY' ? null : base.amount,
      status: base.scrutinyStatus === 'DISCREPANCY' ? 'PENDING_FEED' : 'MATCHED',
    },
    lienMarked: {
      submitted: true,
      verified: base.status === 'PENDING_VERIFICATION' ? null : true,
      status: base.status === 'PENDING_VERIFICATION' ? 'PENDING_BRANCH' : 'CONFIRMED',
    },
    jointHolders: {
      submitted: base.jointHolder,
      verified: base.scrutinyStatus === 'DISCREPANCY' ? null : base.jointHolder,
      status: base.scrutinyStatus === 'DISCREPANCY' ? 'DISCREPANCY' : 'MATCHED',
    },
    branchConfirmationStatus:
      base.scrutinyStatus === 'DISCREPANCY'
        ? 'REVISION_REQUESTED'
        : base.status === 'PENDING_VERIFICATION'
        ? 'PENDING'
        : 'CONFIRMED',
    ...base.submittedVsVerified,
  };

  // Sample Documents
  const refSlug = base.referenceNo.replace(/[^a-zA-Z0-9]/g, '_');
  const documents: FDRDocument[] = base.documents || [
    {
      id: `doc-${base.id}-1`,
      filename: `${refSlug}_Original_Receipt.pdf`,
      docType: 'Fixed Deposit Certificate (Original Scan)',
      fileSize: '2.4 MB',
      uploadedAt: formatIndianDate(base.issueDate, 'short'),
      reviewStatus: base.scrutinyStatus === 'DISCREPANCY' ? 'DISCREPANCY_FLAGGED' : 'OFFICER_VERIFIED',
      isSampleArtifact: true,
      notes: 'Contains bank stamp, branch manager signature, and explicit AICTE lien clause.',
    },
    {
      id: `doc-${base.id}-2`,
      filename: `${refSlug}_Tripartite_Lien_Letter.pdf`,
      docType: 'Bank Tripartite Endorsement Letter',
      fileSize: '1.1 MB',
      uploadedAt: formatIndianDate(base.issueDate, 'short'),
      reviewStatus: base.status === 'PENDING_VERIFICATION' ? 'PENDING_REVIEW' : 'OFFICER_VERIFIED',
      isSampleArtifact: true,
      notes: 'Joint pledge declaration executed between Regional Officer, AICTE and Society Secretary.',
    },
    {
      id: `doc-${base.id}-3`,
      filename: `${refSlug}_Trust_Resolution.pdf`,
      docType: 'Sponsoring Trust Board Resolution',
      fileSize: '890 KB',
      uploadedAt: formatIndianDate(base.issueDate, 'short'),
      reviewStatus: 'OFFICER_VERIFIED',
      isSampleArtifact: true,
      notes: 'Authorizes pledging of institutional corpus towards AICTE statutory security deposit requirement.',
    },
  ];

  // Lifecycle Timeline
  const timeline: TimelineEvent[] = base.timeline || [
    {
      id: `time-${base.id}-1`,
      timestamp: `${formatIndianDate(base.issueDate, 'short')}, 10:30 AM`,
      actor: 'Institution Registrar',
      action: 'Initial FDR Lodgement Submitted',
      details: `Uploaded deposit certificate for ${formatIndianCurrency(base.amount)} with ${base.bankName}.`,
      type: 'SUBMISSION',
    },
    {
      id: `time-${base.id}-2`,
      timestamp: `${formatIndianDate(base.issueDate, 'short')}, 03:15 PM`,
      actor: 'AICTE Intake Desk',
      action: 'Document Ingestion & Intake Validation',
      details: 'All statutory documents parsed and registered under AICTE Permanent ID ' + base.aictePermanentId,
      type: 'SCRUTINY',
    },
    ...(base.scrutinyStatus === 'DISCREPANCY'
      ? [
          {
            id: `time-${base.id}-3`,
            timestamp: '24/10/2026, 11:45 AM',
            actor: 'Scrutiny Officer (AICTE)',
            action: 'Clarification Note Recorded',
            details: 'Noted branch endorsement discrepancy in joint holder nomenclature.',
            type: 'CORRECTION' as const,
          },
        ]
      : base.status === 'ACTIVE' || base.status === 'RENEWED'
      ? [
          {
            id: `time-${base.id}-4`,
            timestamp: `${formatIndianDate(base.issueDate, 'short')}, 05:00 PM`,
            actor: 'Regional Officer, AICTE',
            action: 'Tripartite Lien Ratified & Verified',
            details: 'Endorsement letter verified against bank schedule. Deposit marked active.',
            type: 'VERIFICATION' as const,
          },
        ]
      : []),
  ];

  return {
    ...base,
    daysToMaturity: days,
    riskScore: score,
    riskFactors,
    recommendedActions,
    submittedVsVerified,
    documents,
    timeline,
    scrutinyNotes: base.scrutinyNotes || [
      {
        id: `note-${base.id}-1`,
        officer: 'Shri R. K. Sharma (Scrutiny Officer)',
        timestamp: '25/10/2026, 02:40 PM',
        category: 'AUDIT_NOTE',
        note: `Initial regulatory check completed for ${base.institutionName}. Record staged for statutory compliance monitoring.`,
      },
    ],
  };
}

export const SAMPLE_FDR_DATASET: FDRRecord[] = [
  createFullFDRRecord({
    id: 'fdr-001',
    referenceNo: 'FDR/SBIN/2021/89410',
    institutionName: 'Vidarbha Polytechnic & Engineering Institute',
    aictePermanentId: '1-4829103',
    state: 'Maharashtra',
    regionalOffice: 'Western Regional Office (WRO)',
    bankName: 'State Bank of India',
    branchName: 'Civil Lines, Nagpur',
    ifscCode: 'SBIN0000432',
    amount: 5000000,
    issueDate: '2021-11-05',
    maturityDate: '2026-11-05',
    status: 'EXPIRING_SOON',
    riskLevel: 'HIGH',
    riskScore: 88,
    jointHolder: 'Regional Officer, AICTE WRO & Secretary, Vidarbha Education Society',
    scrutinyStatus: 'UNDER_REVIEW',
  }),
  createFullFDRRecord({
    id: 'fdr-002',
    referenceNo: 'FDR/PUNB/2021/30291',
    institutionName: 'Bundelkhand Institute of Applied Technology',
    aictePermanentId: '1-3829102',
    state: 'Uttar Pradesh',
    regionalOffice: 'Northern Regional Office (NRO)',
    bankName: 'Punjab National Bank',
    branchName: 'Sipri Bazar, Jhansi',
    ifscCode: 'PUNB0124900',
    amount: 3500000,
    issueDate: '2021-11-12',
    maturityDate: '2026-11-12',
    status: 'EXPIRING_SOON',
    riskLevel: 'HIGH',
    riskScore: 84,
    jointHolder: 'Regional Officer, AICTE NRO & Chairman, Bundelkhand Vikas Trust',
    scrutinyStatus: 'DISCREPANCY',
  }),
  createFullFDRRecord({
    id: 'fdr-003',
    referenceNo: 'FDR/CBIN/2023/94012',
    institutionName: 'Kalinga Academy of Technical Studies',
    aictePermanentId: '1-7291045',
    state: 'Odisha',
    regionalOffice: 'Eastern Regional Office (ERO)',
    bankName: 'Canara Bank',
    branchName: 'Saheed Nagar, Bhubaneswar',
    ifscCode: 'CNRB0002491',
    amount: 10000000,
    issueDate: '2023-10-10',
    maturityDate: '2026-11-20',
    status: 'PENDING_VERIFICATION',
    riskLevel: 'HIGH',
    riskScore: 79,
    jointHolder: 'Regional Officer, AICTE ERO & Trustee, Utkal Pragati Parishad',
    scrutinyStatus: 'UNDER_REVIEW',
  }),
  createFullFDRRecord({
    id: 'fdr-004',
    referenceNo: 'FDR/HDFC/2021/77103',
    institutionName: 'Bangalore Rural Institute of Technology',
    aictePermanentId: '1-5910294',
    state: 'Karnataka',
    regionalOffice: 'South Western Regional Office (SWRO)',
    bankName: 'HDFC Bank Ltd',
    branchName: 'Doddaballapur Main',
    ifscCode: 'HDFC0001892',
    amount: 7500000,
    issueDate: '2021-11-22',
    maturityDate: '2026-11-22',
    status: 'EXPIRING_SOON',
    riskLevel: 'MEDIUM',
    riskScore: 56,
    jointHolder: 'Regional Officer, AICTE SWRO & President, Cauvery Educational Foundation',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-005',
    referenceNo: 'FDR/BARB/2023/50192',
    institutionName: 'Saraswati College of Architecture & Planning',
    aictePermanentId: '1-6102938',
    state: 'Gujarat',
    regionalOffice: 'Central Regional Office (CRO)',
    bankName: 'Bank of Baroda',
    branchName: 'Navrangpura, Ahmedabad',
    ifscCode: 'BARB0NAVRAH',
    amount: 5000000,
    issueDate: '2023-11-02',
    maturityDate: '2026-11-24',
    status: 'PENDING_VERIFICATION',
    riskLevel: 'MEDIUM',
    riskScore: 49,
    jointHolder: 'Regional Officer, AICTE CRO & Secretary, Sharda Vidyapeeth Trust',
    scrutinyStatus: 'UNDER_REVIEW',
  }),
  createFullFDRRecord({
    id: 'fdr-006',
    referenceNo: 'FDR/UBIN/2022/41029',
    institutionName: 'Deccan Institute of Pharmacy & Research',
    aictePermanentId: '1-8492019',
    state: 'Telangana',
    regionalOffice: 'South Central Regional Office (SCRO)',
    bankName: 'Union Bank of India',
    branchName: 'Kukatpally, Hyderabad',
    ifscCode: 'UBIN0532109',
    amount: 6000000,
    issueDate: '2022-12-15',
    maturityDate: '2026-12-15',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 22,
    jointHolder: 'Regional Officer, AICTE SCRO & General Secretary, Deccan Society',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-007',
    referenceNo: 'FDR/SBIN/2022/67210',
    institutionName: 'Shivalik Technical University Affiliated College',
    aictePermanentId: '1-2910493',
    state: 'Uttarakhand',
    regionalOffice: 'Northern Regional Office (NRO)',
    bankName: 'State Bank of India',
    branchName: 'Rajpur Road, Dehradun',
    ifscCode: 'SBIN0001015',
    amount: 8500000,
    issueDate: '2022-01-20',
    maturityDate: '2027-01-20',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 18,
    jointHolder: 'Regional Officer, AICTE NRO & Registrar, Shivalik Higher Education',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-008',
    referenceNo: 'FDR/ICIC/2022/19402',
    institutionName: 'Malabar Institute of Technology & Sciences',
    aictePermanentId: '1-9328401',
    state: 'Kerala',
    regionalOffice: 'Southern Regional Office (SRO)',
    bankName: 'ICICI Bank Ltd',
    branchName: 'Mavoor Road, Kozhikode',
    ifscCode: 'ICIC0000084',
    amount: 10000000,
    issueDate: '2022-02-14',
    maturityDate: '2027-02-14',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 14,
    jointHolder: 'Regional Officer, AICTE SRO & Chairman, Malabar Educational Trust',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-009',
    referenceNo: 'FDR/SBIN/2024/55291',
    institutionName: 'Brahmaputra Polytechnic College',
    aictePermanentId: '1-7401928',
    state: 'Assam',
    regionalOffice: 'Eastern Regional Office (ERO)',
    bankName: 'State Bank of India',
    branchName: 'Paltan Bazar, Guwahati',
    ifscCode: 'SBIN0000088',
    amount: 3500000,
    issueDate: '2024-03-10',
    maturityDate: '2027-03-10',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 16,
    jointHolder: 'Regional Officer, AICTE ERO & Director, Assam Valley Society',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-010',
    referenceNo: 'FDR/IOBA/2022/88219',
    institutionName: 'Rayalaseema College of Engineering',
    aictePermanentId: '1-6382019',
    state: 'Andhra Pradesh',
    regionalOffice: 'South Central Regional Office (SCRO)',
    bankName: 'Indian Overseas Bank',
    branchName: 'Gandhi Road, Tirupati',
    ifscCode: 'IOBA0000122',
    amount: 5000000,
    issueDate: '2022-04-18',
    maturityDate: '2027-04-18',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 15,
    jointHolder: 'Regional Officer, AICTE SCRO & Trustee, Balaji Education Foundation',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-011',
    referenceNo: 'FDR/MAHB/2022/33910',
    institutionName: 'Marathwada Institute of Management Studies',
    aictePermanentId: '1-4910283',
    state: 'Maharashtra',
    regionalOffice: 'Western Regional Office (WRO)',
    bankName: 'Bank of Maharashtra',
    branchName: 'Cidco, Chhatrapati Sambhajinagar',
    ifscCode: 'MAHB0000214',
    amount: 4000000,
    issueDate: '2022-05-15',
    maturityDate: '2027-05-15',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 12,
    jointHolder: 'Regional Officer, AICTE WRO & President, Marathwada Education Society',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-012',
    referenceNo: 'FDR/PUNB/2024/11928',
    institutionName: 'Mewar Institute of Engineering & Technology',
    aictePermanentId: '1-3102948',
    state: 'Rajasthan',
    regionalOffice: 'North Western Regional Office (NWRO)',
    bankName: 'Punjab National Bank',
    branchName: 'Collectorate Circle, Chittorgarh',
    ifscCode: 'PUNB0389100',
    amount: 5000000,
    issueDate: '2024-06-25',
    maturityDate: '2027-06-25',
    status: 'PENDING_VERIFICATION',
    riskLevel: 'MEDIUM',
    riskScore: 42,
    jointHolder: 'Regional Officer, AICTE NWRO & General Secretary, Mewar Shiksha Samiti',
    scrutinyStatus: 'UNDER_REVIEW',
  }),
  createFullFDRRecord({
    id: 'fdr-013',
    referenceNo: 'FDR/IDIB/2021/72910',
    institutionName: 'Chola Engineering College & Technology',
    aictePermanentId: '1-8829104',
    state: 'Tamil Nadu',
    regionalOffice: 'Southern Regional Office (SRO)',
    bankName: 'Indian Bank',
    branchName: 'Thillai Nagar, Tiruchirappalli',
    ifscCode: 'IDIB000T012',
    amount: 6500000,
    issueDate: '2021-08-10',
    maturityDate: '2026-08-10',
    status: 'MATURED',
    riskLevel: 'HIGH',
    riskScore: 92,
    jointHolder: 'Regional Officer, AICTE SRO & Chairman, Chola Educational Trust',
    scrutinyStatus: 'DISCREPANCY',
  }),
  createFullFDRRecord({
    id: 'fdr-014',
    referenceNo: 'FDR/SBIN/2021/41028',
    institutionName: 'Ganga Valley Polytechnic Institute',
    aictePermanentId: '1-2940182',
    state: 'Bihar',
    regionalOffice: 'Northern Regional Office (NRO)',
    bankName: 'State Bank of India',
    branchName: 'Boring Road, Patna',
    ifscCode: 'SBIN0001234',
    amount: 3500000,
    issueDate: '2021-09-18',
    maturityDate: '2026-09-18',
    status: 'MATURED',
    riskLevel: 'HIGH',
    riskScore: 90,
    jointHolder: 'Regional Officer, AICTE NRO & Secretary, Magadh Shiksha Parishad',
    scrutinyStatus: 'DISCREPANCY',
  }),
  createFullFDRRecord({
    id: 'fdr-015',
    referenceNo: 'FDR/KKBK/2023/18290',
    institutionName: 'Konkan Coast Institute of Technology',
    aictePermanentId: '1-6920194',
    state: 'Goa',
    regionalOffice: 'Western Regional Office (WRO)',
    bankName: 'Kotak Mahindra Bank',
    branchName: 'Panaji Main Branch',
    ifscCode: 'KKBK0000301',
    amount: 5000000,
    issueDate: '2023-03-20',
    maturityDate: '2026-11-18',
    status: 'EXPIRING_SOON',
    riskLevel: 'HIGH',
    riskScore: 82,
    jointHolder: 'Regional Officer, AICTE WRO & Trustee, Mandovi Technical Foundation',
    scrutinyStatus: 'UNDER_REVIEW',
  }),
  createFullFDRRecord({
    id: 'fdr-016',
    referenceNo: 'FDR/CBIN/2021/66019',
    institutionName: 'Avadh Institute of Pharmacy Sciences',
    aictePermanentId: '1-5102938',
    state: 'Uttar Pradesh',
    regionalOffice: 'Northern Regional Office (NRO)',
    bankName: 'Central Bank of India',
    branchName: 'Hazratganj, Lucknow',
    ifscCode: 'CBIN0280145',
    amount: 4500000,
    issueDate: '2021-11-20',
    maturityDate: '2026-11-20',
    status: 'EXPIRING_SOON',
    riskLevel: 'MEDIUM',
    riskScore: 58,
    jointHolder: 'Regional Officer, AICTE NRO & President, Avadh Healthcare Society',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-017',
    referenceNo: 'FDR/AXIS/2024/91024',
    institutionName: 'Greater Noida Academy of Applied Sciences',
    aictePermanentId: '1-9102941',
    state: 'Uttar Pradesh',
    regionalOffice: 'Northern Regional Office (NRO)',
    bankName: 'Axis Bank Ltd',
    branchName: 'Knowledge Park II, Greater Noida',
    ifscCode: 'UTIB0001428',
    amount: 10000000,
    issueDate: '2024-05-10',
    maturityDate: '2029-05-10',
    status: 'RENEWED',
    riskLevel: 'LOW',
    riskScore: 10,
    jointHolder: 'Regional Officer, AICTE NRO & Director, NCR Higher Education Trust',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-018',
    referenceNo: 'FDR/PUNB/2024/77291',
    institutionName: 'Doaba Institute of Engineering & Technology',
    aictePermanentId: '1-3940182',
    state: 'Punjab',
    regionalOffice: 'North Western Regional Office (NWRO)',
    bankName: 'Punjab National Bank',
    branchName: 'Civil Lines, Jalandhar',
    ifscCode: 'PUNB0021400',
    amount: 7500000,
    issueDate: '2024-07-15',
    maturityDate: '2029-07-15',
    status: 'RENEWED',
    riskLevel: 'LOW',
    riskScore: 10,
    jointHolder: 'Regional Officer, AICTE NWRO & President, Doaba Welfare Society',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-019',
    referenceNo: 'FDR/SBIN/2019/33019',
    institutionName: 'Kongu Rural Polytechnic Institute',
    aictePermanentId: '1-1920394',
    state: 'Tamil Nadu',
    regionalOffice: 'Southern Regional Office (SRO)',
    bankName: 'State Bank of India',
    branchName: 'Perundurai, Erode',
    ifscCode: 'SBIN0004501',
    amount: 3500000,
    issueDate: '2019-06-01',
    maturityDate: '2024-06-01',
    status: 'RELEASED',
    riskLevel: 'LOW',
    riskScore: 5,
    jointHolder: 'Regional Officer, AICTE SRO & Managing Trustee, Kongu Trust',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-020',
    referenceNo: 'FDR/BARB/2018/19402',
    institutionName: 'Narmada Valley College of Architecture',
    aictePermanentId: '1-4401928',
    state: 'Madhya Pradesh',
    regionalOffice: 'Central Regional Office (CRO)',
    bankName: 'Bank of Baroda',
    branchName: 'MP Nagar, Bhopal',
    ifscCode: 'BARB0MPBHOP',
    amount: 5000000,
    issueDate: '2018-09-15',
    maturityDate: '2023-09-15',
    status: 'RELEASED',
    riskLevel: 'LOW',
    riskScore: 5,
    jointHolder: 'Regional Officer, AICTE CRO & Secretary, Narmada Shikshan Samiti',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-021',
    referenceNo: 'FDR/HDFC/2025/39102',
    institutionName: 'Cyberabad Institute of Computer Applications',
    aictePermanentId: '1-8102947',
    state: 'Telangana',
    regionalOffice: 'South Central Regional Office (SCRO)',
    bankName: 'HDFC Bank Ltd',
    branchName: 'Madhapur, Hyderabad',
    ifscCode: 'HDFC0000545',
    amount: 6000000,
    issueDate: '2025-01-10',
    maturityDate: '2028-01-10',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 12,
    jointHolder: 'Regional Officer, AICTE SCRO & Founder Trustee, Cyberabad Vidya Samithi',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-022',
    referenceNo: 'FDR/CNRB/2023/88102',
    institutionName: 'Thanjavur Institute of Marine Technology',
    aictePermanentId: '1-7401938',
    state: 'Tamil Nadu',
    regionalOffice: 'Southern Regional Office (SRO)',
    bankName: 'Canara Bank',
    branchName: 'South Rampart, Thanjavur',
    ifscCode: 'CNRB0001092',
    amount: 10000000,
    issueDate: '2023-08-22',
    maturityDate: '2028-08-22',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 11,
    jointHolder: 'Regional Officer, AICTE SRO & Chairman, Thanjavur Maritime Society',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-023',
    referenceNo: 'FDR/SBIN/2025/71029',
    institutionName: 'Ranchi Technical & Vocational Institute',
    aictePermanentId: '1-6201948',
    state: 'Jharkhand',
    regionalOffice: 'Eastern Regional Office (ERO)',
    bankName: 'State Bank of India',
    branchName: 'Main Road, Ranchi',
    ifscCode: 'SBIN0000167',
    amount: 3500000,
    issueDate: '2025-04-12',
    maturityDate: '2030-04-12',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 10,
    jointHolder: 'Regional Officer, AICTE ERO & General Secretary, Chotanagpur Parishad',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-024',
    referenceNo: 'FDR/UBIN/2024/99102',
    institutionName: 'Khandesh Institute of Pharmaceutical Studies',
    aictePermanentId: '1-5520194',
    state: 'Maharashtra',
    regionalOffice: 'Western Regional Office (WRO)',
    bankName: 'Union Bank of India',
    branchName: 'Station Road, Jalgaon',
    ifscCode: 'UBIN0531405',
    amount: 5000000,
    issueDate: '2024-09-01',
    maturityDate: '2029-09-01',
    status: 'PENDING_VERIFICATION',
    riskLevel: 'MEDIUM',
    riskScore: 46,
    jointHolder: 'Regional Officer, AICTE WRO & Secretary, Khandesh Education Society',
    scrutinyStatus: 'UNDER_REVIEW',
  }),
  createFullFDRRecord({
    id: 'fdr-025',
    referenceNo: 'FDR/IDBI/2022/44910',
    institutionName: 'Baroda Polytechnic for Women',
    aictePermanentId: '1-3310294',
    state: 'Gujarat',
    regionalOffice: 'Central Regional Office (CRO)',
    bankName: 'IDBI Bank Ltd',
    branchName: 'Alkapuri, Vadodara',
    ifscCode: 'IBKL0000042',
    amount: 3500000,
    issueDate: '2022-10-15',
    maturityDate: '2027-10-15',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 12,
    jointHolder: 'Regional Officer, AICTE CRO & Trustee, Gujarat Mahila Mandali',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-026',
    referenceNo: 'FDR/SBIN/2023/10294',
    institutionName: 'Shimla Hills Institute of Hotel Management',
    aictePermanentId: '1-2291048',
    state: 'Himachal Pradesh',
    regionalOffice: 'North Western Regional Office (NWRO)',
    bankName: 'State Bank of India',
    branchName: 'The Mall, Shimla',
    ifscCode: 'SBIN0000718',
    amount: 4000000,
    issueDate: '2023-05-18',
    maturityDate: '2028-05-18',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 14,
    jointHolder: 'Regional Officer, AICTE NWRO & President, Himachal Hospitality Forum',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-027',
    referenceNo: 'FDR/PUNB/2025/62019',
    institutionName: 'Karnal College of Dairy & Food Technology',
    aictePermanentId: '1-9018273',
    state: 'Haryana',
    regionalOffice: 'North Western Regional Office (NWRO)',
    bankName: 'Punjab National Bank',
    branchName: 'Kunjpura Road, Karnal',
    ifscCode: 'PUNB0024900',
    amount: 5000000,
    issueDate: '2025-02-28',
    maturityDate: '2030-02-28',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 10,
    jointHolder: 'Regional Officer, AICTE NWRO & Director, Haryana Agro Tech Foundation',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-028',
    referenceNo: 'FDR/ICIC/2023/48201',
    institutionName: 'Hooghly Engineering & Technical Institute',
    aictePermanentId: '1-7102948',
    state: 'West Bengal',
    regionalOffice: 'Eastern Regional Office (ERO)',
    bankName: 'ICICI Bank Ltd',
    branchName: 'Chinsurah, Hooghly',
    ifscCode: 'ICIC0000624',
    amount: 8500000,
    issueDate: '2023-12-05',
    maturityDate: '2028-12-05',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 12,
    jointHolder: 'Regional Officer, AICTE ERO & Secretary, Bengal Vidyapeeth Trust',
    scrutinyStatus: 'VERIFIED',
  }),
  createFullFDRRecord({
    id: 'fdr-029',
    referenceNo: 'FDR/SBIN/2024/84019',
    institutionName: 'Cuttack Institute of Textile Technology',
    aictePermanentId: '1-4192048',
    state: 'Odisha',
    regionalOffice: 'Eastern Regional Office (ERO)',
    bankName: 'State Bank of India',
    branchName: 'College Square, Cuttack',
    ifscCode: 'SBIN0000059',
    amount: 3500000,
    issueDate: '2024-10-02',
    maturityDate: '2029-10-02',
    status: 'PENDING_VERIFICATION',
    riskLevel: 'MEDIUM',
    riskScore: 44,
    jointHolder: 'Regional Officer, AICTE ERO & Trustee, Utkal Crafts & Industry Association',
    scrutinyStatus: 'UNDER_REVIEW',
  }),
  createFullFDRRecord({
    id: 'fdr-030',
    referenceNo: 'FDR/CBIN/2022/51920',
    institutionName: 'Tirunelveli Rural Polytechnic College',
    aictePermanentId: '1-8392019',
    state: 'Tamil Nadu',
    regionalOffice: 'Southern Regional Office (SRO)',
    bankName: 'Canara Bank',
    branchName: 'Tirunelveli Junction',
    ifscCode: 'CNRB0000951',
    amount: 5000000,
    issueDate: '2022-07-20',
    maturityDate: '2027-07-20',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 11,
    jointHolder: 'Regional Officer, AICTE SRO & Chairman, Nellai Education Council',
    scrutinyStatus: 'VERIFIED',
  }),
];

export const SAMPLE_ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: 'act-001',
    timestamp: '26 Oct 2026, 11:42 AM',
    timeAgo: '2 hrs ago',
    title: 'Verification Flag Raised',
    description: 'Canara Bank branch endorsement discrepancy flagged during automated scan.',
    type: 'VERIFICATION',
    referenceNo: 'FDR/CBIN/2023/94012',
  },
  {
    id: 'act-002',
    timestamp: '26 Oct 2026, 09:15 AM',
    timeAgo: '4 hrs ago',
    title: 'Maturity Alert Dispatched',
    description: '30-day statutory notice sent to Vidarbha Polytechnic via registered email & SMS.',
    type: 'MATURITY_ALERT',
    referenceNo: 'FDR/SBIN/2021/89410',
  },
  {
    id: 'act-003',
    timestamp: '25 Oct 2026, 04:30 PM',
    timeAgo: 'Yesterday',
    title: 'Renewal Pledge Lodged',
    description: 'Bank of Baroda verified fresh 3-year term deposit certificate under AICTE lien.',
    type: 'RENEWAL',
    referenceNo: 'FDR/BARB/2023/50192',
  },
  {
    id: 'act-004',
    timestamp: '25 Oct 2026, 02:10 PM',
    timeAgo: 'Yesterday',
    title: 'Joint Lien Ratified',
    description: 'SWRO Regional Officer approved tripartite endorsement with HDFC Bank.',
    type: 'VERIFICATION',
    referenceNo: 'FDR/HDFC/2021/77103',
  },
  {
    id: 'act-005',
    timestamp: '24 Oct 2026, 11:00 AM',
    timeAgo: '2 days ago',
    title: 'Encashment Clearance Staged',
    description: 'Course closure security deposit release dossier cleared stage 1 audit.',
    type: 'RELEASE_NOTICE',
    referenceNo: 'FDR/SBIN/2022/67210',
  },
];

/**
 * Maturity overview aggregated by quarterly/monthly period for Recharts
 */
export interface MaturityTimelineData {
  period: string;
  fdrCount: number;
  totalValueCrores: number;
  highRiskCount: number;
}

export function calculateMaturityDistribution(records: FDRRecord[]): MaturityTimelineData[] {
  const buckets: Record<string, { fdrCount: number; totalValue: number; highRiskCount: number }> = {
    'Nov 2026': { fdrCount: 0, totalValue: 0, highRiskCount: 0 },
    'Dec 2026': { fdrCount: 0, totalValue: 0, highRiskCount: 0 },
    'Q1 2027': { fdrCount: 0, totalValue: 0, highRiskCount: 0 },
    'Q2 2027': { fdrCount: 0, totalValue: 0, highRiskCount: 0 },
    'Q3 2027': { fdrCount: 0, totalValue: 0, highRiskCount: 0 },
    'Q4 2027+': { fdrCount: 0, totalValue: 0, highRiskCount: 0 },
  };

  records.forEach((record) => {
    if (record.status === 'RELEASED') return;

    const [yearStr, monthStr] = record.maturityDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    let key = 'Q4 2027+';
    if (year === 2026 && month === 11) key = 'Nov 2026';
    else if (year === 2026 && month === 12) key = 'Dec 2026';
    else if (year === 2027 && month >= 1 && month <= 3) key = 'Q1 2027';
    else if (year === 2027 && month >= 4 && month <= 6) key = 'Q2 2027';
    else if (year === 2027 && month >= 7 && month <= 9) key = 'Q3 2027';

    if (buckets[key]) {
      buckets[key].fdrCount += 1;
      buckets[key].totalValue += record.amount;
      if (record.riskLevel === 'HIGH') {
        buckets[key].highRiskCount += 1;
      }
    }
  });

  return Object.entries(buckets).map(([period, data]) => ({
    period,
    fdrCount: data.fdrCount,
    totalValueCrores: Number((data.totalValue / 10000000).toFixed(2)),
    highRiskCount: data.highRiskCount,
  }));
}
