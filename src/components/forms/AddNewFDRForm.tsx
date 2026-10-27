import React, { useState, useId } from 'react';
import {
  Landmark,
  Building2,
  Calendar,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  RotateCcw,
  ArrowLeft,
  Info,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import {
  FDRRecord,
  FDRStatus,
  FDRRiskLevel,
  calculateDaysToMaturity,
  formatIndianCurrency,
  formatIndianDate,
  SYSTEM_TODAY_DATE,
} from '../../data/fdrData.ts';

interface InstitutionOption {
  id: string;
  name: string;
  aicteId: string;
  state: string;
  regionalOffice: string;
  society: string;
}

const PRESET_INSTITUTIONS: InstitutionOption[] = [
  {
    id: 'inst-1',
    name: 'Vidarbha Polytechnic & Engineering Institute',
    aicteId: '1-4829103',
    state: 'Maharashtra',
    regionalOffice: 'Western Regional Office (WRO)',
    society: 'Vidarbha Education Society',
  },
  {
    id: 'inst-2',
    name: 'Bundelkhand Institute of Applied Technology',
    aicteId: '1-3829102',
    state: 'Uttar Pradesh',
    regionalOffice: 'Northern Regional Office (NRO)',
    society: 'Bundelkhand Vikas Trust',
  },
  {
    id: 'inst-3',
    name: 'Kalinga Academy of Technical Studies',
    aicteId: '1-7291045',
    state: 'Odisha',
    regionalOffice: 'Eastern Regional Office (ERO)',
    society: 'Utkal Pragati Parishad',
  },
  {
    id: 'inst-4',
    name: 'Bangalore Rural Institute of Technology',
    aicteId: '1-5910294',
    state: 'Karnataka',
    regionalOffice: 'South Western Regional Office (SWRO)',
    society: 'Cauvery Educational Foundation',
  },
  {
    id: 'inst-5',
    name: 'Saraswati College of Architecture & Planning',
    aicteId: '1-6102938',
    state: 'Gujarat',
    regionalOffice: 'Central Regional Office (CRO)',
    society: 'Sharda Vidyapeeth Trust',
  },
  {
    id: 'inst-6',
    name: 'Deccan Institute of Pharmacy & Research',
    aicteId: '1-8492019',
    state: 'Telangana',
    regionalOffice: 'South Central Regional Office (SCRO)',
    society: 'Deccan Education Society',
  },
  {
    id: 'inst-7',
    name: 'Shivalik Technical University Affiliated College',
    aicteId: '1-2910493',
    state: 'Uttarakhand',
    regionalOffice: 'Northern Regional Office (NRO)',
    society: 'Shivalik Higher Education Trust',
  },
  {
    id: 'inst-8',
    name: 'Malabar Institute of Technology & Sciences',
    aicteId: '1-9328401',
    state: 'Kerala',
    regionalOffice: 'Southern Regional Office (SRO)',
    society: 'Malabar Educational Trust',
  },
  {
    id: 'inst-9',
    name: 'Greater Noida Academy of Applied Sciences',
    aicteId: '1-9102941',
    state: 'Uttar Pradesh',
    regionalOffice: 'Northern Regional Office (NRO)',
    society: 'NCR Higher Education Trust',
  },
  {
    id: 'inst-10',
    name: 'Cyberabad Institute of Computer Applications',
    aicteId: '1-8102947',
    state: 'Telangana',
    regionalOffice: 'South Central Regional Office (SCRO)',
    society: 'Cyberabad Vidya Samithi',
  },
];

const SCHEDULED_BANKS = [
  'State Bank of India',
  'Punjab National Bank',
  'Canara Bank',
  'Bank of Baroda',
  'Union Bank of India',
  'Indian Bank',
  'Central Bank of India',
  'Indian Overseas Bank',
  'Bank of Maharashtra',
  'HDFC Bank Ltd',
  'ICICI Bank Ltd',
  'Axis Bank Ltd',
  'Kotak Mahindra Bank',
  'IDBI Bank Ltd',
];

interface AddNewFDRFormProps {
  onCancel: () => void;
  onSubmitSuccess: (newFDR: FDRRecord) => void;
}

export const AddNewFDRForm: React.FC<AddNewFDRFormProps> = ({
  onCancel,
  onSubmitSuccess,
}) => {
  // Form input states
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>(
    PRESET_INSTITUTIONS[0].id
  );
  const [customInstitutionName, setCustomInstitutionName] = useState('');
  const [customAicteId, setCustomAicteId] = useState('');
  const [customState, setCustomState] = useState('New Delhi');
  const [customRegionalOffice, setCustomRegionalOffice] = useState(
    'Northern Regional Office (NRO)'
  );

  const [bankName, setBankName] = useState(SCHEDULED_BANKS[0]);
  const [branchName, setBranchName] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // Auto-generate a realistic initial reference
  const generatedSuffix = Math.floor(10000 + Math.random() * 90000);
  const [referenceNo, setReferenceNo] = useState(
    `FDR/SBIN/2026/${generatedSuffix}`
  );

  const [depositAmount, setDepositAmount] = useState('5000000'); // Default ₹50 Lakh
  const [issueDate, setIssueDate] = useState('2026-10-26');
  // 5-year default maturity
  const [maturityDate, setMaturityDate] = useState('2031-10-26');
  const [jointHolder, setJointHolder] = useState(
    'Regional Officer, AICTE & Secretary, Sponsoring Educational Society'
  );
  const [remarks, setRemarks] = useState('');

  // Document staging state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Form validation errors & submission state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // When bank changes, update reference prefix
  const handleBankChange = (newBank: string) => {
    setBankName(newBank);
    const bankCode =
      newBank === 'State Bank of India'
        ? 'SBIN'
        : newBank === 'Punjab National Bank'
        ? 'PUNB'
        : newBank === 'Canara Bank'
        ? 'CNRB'
        : newBank === 'Bank of Baroda'
        ? 'BARB'
        : newBank === 'HDFC Bank Ltd'
        ? 'HDFC'
        : newBank === 'ICICI Bank Ltd'
        ? 'ICIC'
        : 'BANK';
    setReferenceNo(`FDR/${bankCode}/2026/${generatedSuffix}`);
  };

  // When preset institution changes, prefill joint holder
  const handleInstitutionChange = (instId: string) => {
    setSelectedInstitutionId(instId);
    if (instId !== 'CUSTOM') {
      const found = PRESET_INSTITUTIONS.find((i) => i.id === instId);
      if (found) {
        setJointHolder(
          `Regional Officer, AICTE ${found.regionalOffice.split('(')[1]?.replace(')', '') || ''} & Secretary, ${found.society}`
        );
      }
    }
  };

  // Quick slab selection helper
  const handleQuickSlab = (amount: number) => {
    setDepositAmount(amount.toString());
    if (errors.depositAmount) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.depositAmount;
        return next;
      });
    }
  };

  // File upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }

    const file = e.target.files[0];
    const allowedExtensions = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (!allowedExtensions.includes(file.type)) {
      setFileError('Unsupported file type. Please upload a PDF, JPG, or PNG document.');
      setSelectedFile(null);
      return;
    }

    if (file.size > maxSizeBytes) {
      setFileError('File exceeds 10MB limit. Please upload a compressed document.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    if (errors.document) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.document;
        return next;
      });
    }
  };

  // Form reset action
  const handleReset = () => {
    setSelectedInstitutionId(PRESET_INSTITUTIONS[0].id);
    setCustomInstitutionName('');
    setCustomAicteId('');
    setBankName(SCHEDULED_BANKS[0]);
    setBranchName('');
    setIfscCode('');
    setReferenceNo(`FDR/SBIN/2026/${Math.floor(10000 + Math.random() * 90000)}`);
    setDepositAmount('5000000');
    setIssueDate('2026-10-26');
    setMaturityDate('2031-10-26');
    setJointHolder('Regional Officer, AICTE & Secretary, Sponsoring Educational Society');
    setRemarks('');
    setSelectedFile(null);
    setFileError(null);
    setErrors({});
  };

  // Validate inputs
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedInstitutionId === 'CUSTOM') {
      if (!customInstitutionName.trim()) {
        newErrors.institution = 'Institution name is required.';
      }
      if (!customAicteId.trim()) {
        newErrors.aicteId = 'AICTE Permanent ID is required (e.g. 1-9876543).';
      }
    }

    if (!branchName.trim()) {
      newErrors.branchName = 'Bank branch name is required.';
    }

    if (!referenceNo.trim()) {
      newErrors.referenceNo = 'FDR reference number is required.';
    }

    const numAmount = parseFloat(depositAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.depositAmount = 'Deposit amount must be a positive number greater than ₹0.';
    }

    if (!issueDate) {
      newErrors.issueDate = 'Issue date is required.';
    }

    if (!maturityDate) {
      newErrors.maturityDate = 'Maturity date is required.';
    } else if (issueDate) {
      const issueTime = new Date(issueDate).getTime();
      const matTime = new Date(maturityDate).getTime();
      if (matTime <= issueTime) {
        newErrors.maturityDate = 'Maturity date must be after the issue date.';
      }
    }

    if (!selectedFile) {
      newErrors.document = 'A scanned deposit receipt or tripartite endorsement file (PDF/JPG/PNG) is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Resolve institution metadata
    let instName = '';
    let aicteId = '';
    let state = '';
    let ro = '';

    if (selectedInstitutionId === 'CUSTOM') {
      instName = customInstitutionName.trim();
      aicteId = customAicteId.trim();
      state = customState;
      ro = customRegionalOffice;
    } else {
      const matched = PRESET_INSTITUTIONS.find(
        (i) => i.id === selectedInstitutionId
      )!;
      instName = matched.name;
      aicteId = matched.aicteId;
      state = matched.state;
      ro = matched.regionalOffice;
    }

    const numericAmount = parseFloat(depositAmount);
    const newId = `fdr-${Date.now()}`;
    const calculatedDays = calculateDaysToMaturity(maturityDate);

    // Build newly registered FDR record strictly with Pending Verification status
    const newRecord: FDRRecord = {
      id: newId,
      referenceNo: referenceNo.trim(),
      institutionName: instName,
      aictePermanentId: aicteId,
      state,
      regionalOffice: ro,
      bankName,
      branchName: branchName.trim(),
      ifscCode: ifscCode.trim() || 'SBIN0001015',
      amount: numericAmount,
      issueDate,
      maturityDate,
      status: 'PENDING_VERIFICATION' as FDRStatus, // Never marked verified automatically
      riskLevel: 'MEDIUM' as FDRRiskLevel,
      riskScore: 48,
      jointHolder: jointHolder.trim(),
      scrutinyStatus: 'UNDER_REVIEW',
      daysToMaturity: calculatedDays,
      riskFactors: [
        {
          factor: 'Initial Lodgement Intake',
          severity: 'MEDIUM',
          description: 'Fresh deposit submitted via portal. Core banking branch reconciliation pending.',
          evidence: `Lien endorsement certificate submitted on ${formatIndianDate(SYSTEM_TODAY_DATE, 'short')}. Awaiting Council verification sign-off.`,
        },
      ],
      recommendedActions: [
        'Perform tripartite endorsement verification against AICTE Approval Process Handbook (APH 2026-27).',
        'Verify branch IFSC and bank endorsement signature with nodal officer.',
        'Upon satisfactory scrutiny, officer will execute "Verify Record" to activate deposit.',
      ],
      submittedVsVerified: {
        amount: {
          submitted: numericAmount,
          verified: null,
          status: 'PENDING_FEED',
        },
        lienMarked: {
          submitted: true,
          verified: null,
          status: 'PENDING_BRANCH',
        },
        jointHolders: {
          submitted: jointHolder.trim(),
          verified: null,
          status: 'PENDING_BRANCH',
        },
        branchConfirmationStatus: 'PENDING',
      },
      documents: [
        {
          id: `doc-${newId}-1`,
          filename: selectedFile ? selectedFile.name : `${referenceNo.replace(/[^a-zA-Z0-9]/g, '_')}_Intake.pdf`,
          docType: 'Fixed Deposit Receipt (Intake Submission)',
          fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB',
          uploadedAt: formatIndianDate(SYSTEM_TODAY_DATE, 'short'),
          reviewStatus: 'PENDING_REVIEW',
          isSampleArtifact: true,
          notes: remarks.trim() || 'Newly submitted institutional fixed deposit lodgement exhibit.',
        },
      ],
      timeline: [
        {
          id: `time-${newId}-1`,
          timestamp: `${formatIndianDate(SYSTEM_TODAY_DATE, 'short')}, 04:55 PM`,
          actor: 'Institution Registrar & Scrutiny Desk',
          action: 'New FDR Lodgement Lodged (Portal Intake)',
          details: `Registered statutory security deposit of ${formatIndianCurrency(numericAmount)} with ${bankName} (${branchName.trim()}). Staged for verification.`,
          type: 'SUBMISSION',
        },
      ],
      scrutinyNotes: remarks.trim()
        ? [
            {
              id: `note-${newId}-1`,
              officer: 'System Intake Desk',
              timestamp: `${formatIndianDate(SYSTEM_TODAY_DATE, 'short')}, 04:55 PM`,
              category: 'AUDIT_NOTE',
              note: `Submission remarks: "${remarks.trim()}"`,
            },
          ]
        : [],
    };

    // Simulate brief saving delay to prevent double-click and give feedback
    setTimeout(() => {
      setSubmissionSuccess(true);
      setTimeout(() => {
        onSubmitSuccess(newRecord);
      }, 700);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb (Editorial Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 mb-1">
            <button
              type="button"
              onClick={onCancel}
              className="hover:text-teal-800 font-medium hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>FDR Registry</span>
            </button>
            <span>/</span>
            <span className="font-semibold text-slate-900">Add New FDR</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Register New Institutional Fixed Deposit Receipt
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
            Statutory security deposit intake and tripartite joint pledge lodging under AICTE Approval Process Handbook (APH 2026-27).
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-md border border-stone-200/90 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-stone-50 transition-colors self-start sm:self-auto shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Cancel & Return</span>
        </button>
      </div>

      {/* Success Notification Banner (shown only when saved) */}
      {submissionSuccess && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
          <div className="flex-1">
            <strong className="font-semibold">Deposit Successfully Registered:</strong> The FDR record has been saved with status <em>Pending Verification</em>. Redirecting to official dossier...
          </div>
        </div>
      )}

      {/* Primary Intake Form Container */}
      <form onSubmit={handleSubmit} className="rounded-lg border border-stone-200/90 bg-white p-6 sm:p-8 space-y-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Section 1: Institutional Identification */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-stone-200/80 pb-3">
            <Building2 className="h-4 w-4 text-teal-700" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              1. Institutional Identification
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Institution Selector */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Approved Technical Institution <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedInstitutionId}
                onChange={(e) => handleInstitutionChange(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white p-2.5 text-xs sm:text-sm text-slate-900 focus:border-teal-600 focus:outline-hidden"
              >
                {PRESET_INSTITUTIONS.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} — (ID: {inst.aicteId}, {inst.state})
                  </option>
                ))}
                <option value="CUSTOM">+ Register Other / Unlisted Approved Institution</option>
              </select>
            </div>

            {/* Custom institution fields if selected */}
            {selectedInstitutionId === 'CUSTOM' && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Institution Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={customInstitutionName}
                    onChange={(e) => setCustomInstitutionName(e.target.value)}
                    placeholder="e.g. National Institute of Technology & Management"
                    className="w-full rounded border border-slate-300 p-2 text-slate-900 focus:border-teal-600 focus:outline-hidden"
                  />
                  {errors.institution && (
                    <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.institution}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    AICTE Permanent ID <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={customAicteId}
                    onChange={(e) => setCustomAicteId(e.target.value)}
                    placeholder="e.g. 1-9482019"
                    className="w-full rounded border border-slate-300 p-2 font-mono text-slate-900 focus:border-teal-600 focus:outline-hidden"
                  />
                  {errors.aicteId && (
                    <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.aicteId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    State / UT
                  </label>
                  <input
                    type="text"
                    value={customState}
                    onChange={(e) => setCustomState(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-slate-900 focus:border-teal-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Regional Office
                  </label>
                  <select
                    value={customRegionalOffice}
                    onChange={(e) => setCustomRegionalOffice(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-slate-900 focus:border-teal-600 focus:outline-hidden"
                  >
                    <option>Northern Regional Office (NRO)</option>
                    <option>Western Regional Office (WRO)</option>
                    <option>Southern Regional Office (SRO)</option>
                    <option>Eastern Regional Office (ERO)</option>
                    <option>Central Regional Office (CRO)</option>
                    <option>South Western Regional Office (SWRO)</option>
                    <option>South Central Regional Office (SCRO)</option>
                    <option>North Western Regional Office (NWRO)</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 2: Scheduled Bank & Branch Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <Landmark className="h-4 w-4 text-teal-700" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              2. Scheduled Commercial Bank Particulars
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Designated Scheduled Bank <span className="text-rose-600">*</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => handleBankChange(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white p-2 text-slate-900 focus:border-teal-600 focus:outline-hidden"
              >
                {SCHEDULED_BANKS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Branch Location & Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => {
                  setBranchName(e.target.value);
                  if (errors.branchName) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.branchName;
                      return next;
                    });
                  }
                }}
                placeholder="e.g. Connaught Place, New Delhi"
                className={`w-full rounded border p-2 text-slate-900 focus:outline-hidden ${
                  errors.branchName
                    ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {errors.branchName && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.branchName}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Branch IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0000691"
                className="w-full rounded border border-slate-300 p-2 font-mono text-slate-900 focus:border-teal-600 focus:outline-hidden uppercase"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Deposit Amount, Reference & Tenure Dates */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <Calendar className="h-4 w-4 text-teal-700" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              3. Deposit Amount, Instrument Reference & Tenure
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* FDR Reference */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                FDR Reference Number <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => {
                  setReferenceNo(e.target.value);
                  if (errors.referenceNo) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.referenceNo;
                      return next;
                    });
                  }
                }}
                className={`w-full rounded border p-2 font-mono font-medium text-slate-900 focus:outline-hidden ${
                  errors.referenceNo
                    ? 'border-rose-300 focus:border-rose-500'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {errors.referenceNo && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.referenceNo}
                </p>
              )}
            </div>

            {/* Deposit Amount in ₹ */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Principal Amount (₹ INR) <span className="text-rose-600">*</span>
                </label>
                <span className="text-[11px] font-mono font-bold text-teal-800">
                  {parseFloat(depositAmount) > 0 ? formatIndianCurrency(parseFloat(depositAmount)) : ''}
                </span>
              </div>
              <input
                type="number"
                min="1000"
                step="50000"
                value={depositAmount}
                onChange={(e) => {
                  setDepositAmount(e.target.value);
                  if (errors.depositAmount) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.depositAmount;
                      return next;
                    });
                  }
                }}
                className={`w-full rounded border p-2 font-mono text-slate-900 focus:outline-hidden ${
                  errors.depositAmount
                    ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {errors.depositAmount && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.depositAmount}
                </p>
              )}

              {/* Standard AICTE Slabs Shortcuts */}
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                <span className="text-slate-500">Quick Slabs:</span>
                <button
                  type="button"
                  onClick={() => handleQuickSlab(3500000)}
                  className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-700 hover:bg-slate-100"
                >
                  ₹35 Lakh
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSlab(5000000)}
                  className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-700 hover:bg-slate-100"
                >
                  ₹50 Lakh
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSlab(10000000)}
                  className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-700 hover:bg-slate-100"
                >
                  ₹1.00 Crore
                </button>
              </div>
            </div>

            {/* Joint Lien Holding */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">
                Joint Lien Clause Designation <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={jointHolder}
                onChange={(e) => setJointHolder(e.target.value)}
                className="w-full rounded border border-slate-300 p-2 text-slate-900 focus:border-teal-600 focus:outline-hidden"
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Issue / Pledging Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => {
                  setIssueDate(e.target.value);
                  if (errors.issueDate) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.issueDate;
                      return next;
                    });
                  }
                }}
                className={`w-full rounded border p-2 text-slate-900 focus:outline-hidden ${
                  errors.issueDate
                    ? 'border-rose-300 focus:border-rose-500'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {errors.issueDate && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.issueDate}
                </p>
              )}
            </div>

            {/* Maturity Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Maturity Date (Minimum 3–5 Years Tenure) <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={maturityDate}
                onChange={(e) => {
                  setMaturityDate(e.target.value);
                  if (errors.maturityDate) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.maturityDate;
                      return next;
                    });
                  }
                }}
                className={`w-full rounded border p-2 text-slate-900 focus:outline-hidden ${
                  errors.maturityDate
                    ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {errors.maturityDate && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.maturityDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Document Upload (Local Staging) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <Upload className="h-4 w-4 text-teal-700" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              4. Document Upload (Scanned Deposit Receipt or Endorsement)
            </h3>
          </div>

          <div className="text-xs space-y-3">
            <label className="block font-semibold text-slate-700">
              Select Scanned Instrument Exhibit <span className="text-rose-600">*</span>
              <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                Supported formats: PDF, JPG, PNG (Max 10MB). Document will be staged locally for scrutiny simulation.
              </span>
            </label>

            <div className="border-2 border-dashed border-slate-300 hover:border-teal-600 rounded p-6 text-center bg-slate-50/50 transition-colors">
              <input
                type="file"
                id="fdr-file-upload"
                accept=".pdf,image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="fdr-file-upload"
                className="cursor-pointer inline-flex flex-col items-center justify-center"
              >
                <Upload className="h-8 w-8 text-slate-400 mb-2 hover:text-teal-700 transition-colors" />
                <span className="text-xs font-semibold text-teal-700 hover:underline">
                  Click to select file from device
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  PDF, JPG, or PNG up to 10MB
                </span>
              </label>

              {/* Selected File Badge */}
              {selectedFile && (
                <div className="mt-4 inline-flex items-center gap-2 rounded border border-teal-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-xs">
                  <FileCheck className="h-4 w-4 text-teal-700" />
                  <span className="font-semibold text-slate-900">{selectedFile.name}</span>
                  <span className="text-slate-500 text-[11px]">
                    ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFile(null);
                    }}
                    className="ml-1 text-slate-400 hover:text-slate-700"
                    title="Remove file"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {fileError && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                {fileError}
              </p>
            )}

            {errors.document && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.document}
              </p>
            )}

            <div className="rounded border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 flex items-center gap-2">
              <Info className="h-4 w-4 text-teal-700 shrink-0" />
              <span>
                <strong>Client Memory Staging:</strong> Uploaded files are handled in local browser memory for this demonstration. Files are not sent to external cloud storage or certified authentic automatically.
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Optional Remarks */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            5. Optional Regulatory Remarks / Officer Notes
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Record any specific intake notes, joint pledge endorsement caveats, or regional office instructions..."
            className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-hidden"
          />
        </div>

        {/* Form Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-stone-200/80 bg-stone-50/50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 sm:p-8 rounded-b-lg">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
            <span className="h-2 w-2 rounded-full bg-teal-800" />
            <span>New submissions register with status <strong className="text-slate-900">Pending Verification</strong>.</span>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 text-stone-400" />
              <span>Reset Form</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-teal-300" />
              <span>{isSubmitting ? 'Registering Deposit...' : 'Register & Lodge FDR'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
