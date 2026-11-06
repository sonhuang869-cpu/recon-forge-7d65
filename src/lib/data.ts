import type {
  ReconRun,
  Transaction,
  MatchPair,
  Exception,
  AuditEntry,
} from '../types';

// ─── Seed Transactions ────────────────────────────────────────────────────────

function makeTx(
  id: string,
  runId: string,
  source: 1 | 2,
  date: string,
  description: string,
  amount: number,
  reference: string,
  accountCode: string,
  type: 'debit' | 'credit' = 'debit'
): Transaction {
  return { id, runId, source, date, description, amount, reference, accountCode, currency: 'USD', type };
}

// November 2026 — GL
const NOV_GL: Transaction[] = [
  makeTx('t1-gl-01','run-nov-26',1,'2026-11-01','Wire Transfer — Meridian Capital LLC',42500,'WT-2026-110001','4100-WIRE'),
  makeTx('t1-gl-02','run-nov-26',1,'2026-11-02','ACH Credit — Payroll Clearing',215300,'ACH-2026-110002','4200-PAYRL','credit'),
  makeTx('t1-gl-03','run-nov-26',1,'2026-11-03','Vendor Payment — Clearpath Systems Ltd',8750,'VND-2026-110003','5100-VEND'),
  makeTx('t1-gl-04','run-nov-26',1,'2026-11-04','Wire Transfer — Atlas Infrastructure',125000,'WT-2026-110004','4100-WIRE'),
  makeTx('t1-gl-05','run-nov-26',1,'2026-11-05','Service Fee — CoreBanking Platform',1250,'SVC-2026-110005','6100-FEES'),
  makeTx('t1-gl-06','run-nov-26',1,'2026-11-06','ACH Debit — Insurance Premium',4680,'ACH-2026-110006','5200-INS'),
  makeTx('t1-gl-07','run-nov-26',1,'2026-11-07','Wire Transfer — Nexus Holdings Ltd',78900,'WT-2026-110007','4100-WIRE'),
  makeTx('t1-gl-08','run-nov-26',1,'2026-11-08','Check Payment — Office Lease',12500,'CHK-2026-110008','5300-RENT'),
  makeTx('t1-gl-09','run-nov-26',1,'2026-11-09','ACH Credit — Customer Remittance',33780,'ACH-2026-110009','4300-REM','credit'),
  makeTx('t1-gl-10','run-nov-26',1,'2026-11-10','Vendor Payment — TechServ Group',5500,'VND-2026-110010','5100-VEND'),
  makeTx('t1-gl-11','run-nov-26',1,'2026-11-11','Wire Transfer — Opal Investments',250000,'WT-2026-110011','4100-WIRE'),
  makeTx('t1-gl-12','run-nov-26',1,'2026-11-12','ACH Debit — Utility Services',3420,'ACH-2026-110012','6200-UTIL'),
  makeTx('t1-gl-13','run-nov-26',1,'2026-11-13','Vendor Payment — Datalink Corp',11200,'VND-2026-110013','5100-VEND'),
  makeTx('t1-gl-14','run-nov-26',1,'2026-11-14','Wire Transfer — Brightstone Capital',320000,'WT-2026-110014','4100-WIRE'),
  makeTx('t1-gl-15','run-nov-26',1,'2026-11-14','Service Fee — Compliance Monitoring',2100,'SVC-2026-110015','6100-FEES'),
  makeTx('t1-gl-16','run-nov-26',1,'2026-11-15','ACH Credit — Interbank Settlement',89500,'ACH-2026-110016','4400-SETT','credit'),
  makeTx('t1-gl-17','run-nov-26',1,'2026-11-17','Check Payment — Legal Counsel',7500,'CHK-2026-110017','5400-LEGAL'),
  makeTx('t1-gl-18','run-nov-26',1,'2026-11-18','Wire Transfer — Sovereign Assets',175000,'WT-2026-110018','4100-WIRE'),
  makeTx('t1-gl-19','run-nov-26',1,'2026-11-19','Vendor Payment — Helix Solutions',4300,'VND-2026-110019','5100-VEND'),
  makeTx('t1-gl-20','run-nov-26',1,'2026-11-20','ACH Debit — Pension Contributions',31400,'ACH-2026-110020','5200-PENS'),
  makeTx('t1-gl-exc1','run-nov-26',1,'2026-11-21','Wire Transfer — Valor Fund Partners',55000,'WT-2026-110021','4100-WIRE'),
  makeTx('t1-gl-exc2','run-nov-26',1,'2026-11-22','Vendor Payment — Meridian IT Systems',9800,'VND-2026-110022','5100-VEND'),
  makeTx('t1-gl-exc3','run-nov-26',1,'2026-11-22','ACH Credit — International Remittance',18750,'ACH-2026-110023','4300-REM','credit'),
];

// November 2026 — Bank
const NOV_BANK: Transaction[] = [
  makeTx('t2-bk-01','run-nov-26',2,'2026-11-01','WIRE CREDIT MERIDIAN CAP LLC',42500,'WT-2026-110001','','credit'),
  makeTx('t2-bk-02','run-nov-26',2,'2026-11-02','ACH CREDIT PAYROLL CLEARING',215300,'ACH-2026-110002','','credit'),
  makeTx('t2-bk-03','run-nov-26',2,'2026-11-03','VENDOR PMT CLEARPATH SYSTEMS',8750,'VND-2026-110003',''),
  makeTx('t2-bk-04','run-nov-26',2,'2026-11-04','WIRE DEBIT ATLAS INFRASTRUCTURE',125000,'WT-2026-110004',''),
  makeTx('t2-bk-05','run-nov-26',2,'2026-11-05','SERVICE FEE COREBANKING',1250,'SVC-2026-110005',''),
  makeTx('t2-bk-06','run-nov-26',2,'2026-11-06','ACH DEBIT INSURANCE PREMIUM',4680,'ACH-2026-110006',''),
  makeTx('t2-bk-07','run-nov-26',2,'2026-11-07','WIRE DEBIT NEXUS HOLDINGS LTD',78900,'WT-2026-110007',''),
  makeTx('t2-bk-08','run-nov-26',2,'2026-11-08','CHK PMT OFFICE LEASE',12500,'CHK-2026-110008',''),
  makeTx('t2-bk-09','run-nov-26',2,'2026-11-09','ACH CREDIT CUSTOMER REMIT',33780,'ACH-2026-110009','','credit'),
  makeTx('t2-bk-10','run-nov-26',2,'2026-11-10','VENDOR PMT TECHSERV GROUP',5500,'VND-2026-110010',''),
  makeTx('t2-bk-11','run-nov-26',2,'2026-11-11','WIRE DEBIT OPAL INVESTMENTS',250000,'WT-2026-110011',''),
  makeTx('t2-bk-12','run-nov-26',2,'2026-11-12','ACH DEBIT UTILITY SERVICES',3420,'ACH-2026-110012',''),
  makeTx('t2-bk-13','run-nov-26',2,'2026-11-13','VENDOR PMT DATALINK CORP',11200,'VND-2026-110013',''),
  makeTx('t2-bk-14','run-nov-26',2,'2026-11-14','WIRE DEBIT BRIGHTSTONE CAP',320000,'WT-2026-110014',''),
  makeTx('t2-bk-15','run-nov-26',2,'2026-11-14','SVC FEE COMPLIANCE MON',2100,'SVC-2026-110015',''),
  makeTx('t2-bk-16','run-nov-26',2,'2026-11-15','ACH CREDIT INTERBANK SETT',89500,'ACH-2026-110016','','credit'),
  makeTx('t2-bk-17','run-nov-26',2,'2026-11-17','CHK PMT LEGAL COUNSEL',7500,'CHK-2026-110017',''),
  makeTx('t2-bk-18','run-nov-26',2,'2026-11-18','WIRE DEBIT SOVEREIGN ASSETS',175000,'WT-2026-110018',''),
  makeTx('t2-bk-19','run-nov-26',2,'2026-11-19','VENDOR PMT HELIX SOLUTIONS',4300,'VND-2026-110019',''),
  makeTx('t2-bk-20','run-nov-26',2,'2026-11-20','ACH DEBIT PENSION CONTRIB',31400,'ACH-2026-110020',''),
  makeTx('t2-bk-exc1','run-nov-26',2,'2026-11-21','WIRE DEBIT VALOR FUND PARTNERS',54840,'WT-2026-110021',''),
  makeTx('t2-bk-exc4','run-nov-26',2,'2026-11-23','ACH DEBIT FOREX SETTLEMENT',22100,'ACH-2026-110024',''),
];

// October 2026 — GL
const OCT_GL: Transaction[] = [
  makeTx('t3-gl-01','run-oct-26',1,'2026-10-01','Wire Transfer — Meridian Capital LLC',38200,'WT-2026-100001','4100-WIRE'),
  makeTx('t3-gl-02','run-oct-26',1,'2026-10-03','ACH Credit — Payroll Clearing',215300,'ACH-2026-100002','4200-PAYRL','credit'),
  makeTx('t3-gl-03','run-oct-26',1,'2026-10-05','Vendor Payment — Clearpath Systems',7900,'VND-2026-100003','5100-VEND'),
  makeTx('t3-gl-04','run-oct-26',1,'2026-10-08','Wire Transfer — Atlas Infrastructure',110000,'WT-2026-100004','4100-WIRE'),
  makeTx('t3-gl-05','run-oct-26',1,'2026-10-12','ACH Credit — Customer Remittance',28650,'ACH-2026-100005','4300-REM','credit'),
  makeTx('t3-gl-06','run-oct-26',1,'2026-10-15','Service Fee — CoreBanking Platform',1250,'SVC-2026-100006','6100-FEES'),
  makeTx('t3-gl-07','run-oct-26',1,'2026-10-18','Wire Transfer — Nexus Holdings Ltd',92000,'WT-2026-100007','4100-WIRE'),
  makeTx('t3-gl-08','run-oct-26',1,'2026-10-21','Check Payment — Office Lease',12500,'CHK-2026-100008','5300-RENT'),
  makeTx('t3-gl-09','run-oct-26',1,'2026-10-24','ACH Debit — Insurance Premium',4680,'ACH-2026-100009','5200-INS'),
  makeTx('t3-gl-exc1','run-oct-26',1,'2026-10-28','Vendor Payment — Prism Analytics',3200,'VND-2026-100010','5100-VEND'),
];

// October 2026 — Bank
const OCT_BANK: Transaction[] = [
  makeTx('t4-bk-01','run-oct-26',2,'2026-10-01','WIRE CREDIT MERIDIAN CAP',38200,'WT-2026-100001','','credit'),
  makeTx('t4-bk-02','run-oct-26',2,'2026-10-03','ACH CREDIT PAYROLL CLEARING',215300,'ACH-2026-100002','','credit'),
  makeTx('t4-bk-03','run-oct-26',2,'2026-10-05','VENDOR PMT CLEARPATH SYSTEMS',7900,'VND-2026-100003',''),
  makeTx('t4-bk-04','run-oct-26',2,'2026-10-08','WIRE DEBIT ATLAS INFRA',110000,'WT-2026-100004',''),
  makeTx('t4-bk-05','run-oct-26',2,'2026-10-12','ACH CREDIT CUST REMIT',28650,'ACH-2026-100005','','credit'),
  makeTx('t4-bk-06','run-oct-26',2,'2026-10-15','SVC FEE COREBANKING',1250,'SVC-2026-100006',''),
  makeTx('t4-bk-07','run-oct-26',2,'2026-10-18','WIRE DEBIT NEXUS HOLDINGS',92000,'WT-2026-100007',''),
  makeTx('t4-bk-08','run-oct-26',2,'2026-10-21','CHK PMT OFFICE LEASE',12500,'CHK-2026-100008',''),
  makeTx('t4-bk-09','run-oct-26',2,'2026-10-24','ACH DEBIT INSURANCE PREM',4680,'ACH-2026-100009',''),
  makeTx('t4-bk-exc1','run-oct-26',2,'2026-10-29','VENDOR PMT PRISM ANALYTICS',3200,'VND-2026-100010',''),
];

// September 2026 — GL
const SEP_GL: Transaction[] = [
  makeTx('t5-gl-01','run-sep-26',1,'2026-09-02','Wire Transfer — Meridian Capital LLC',35000,'WT-2026-090001','4100-WIRE'),
  makeTx('t5-gl-02','run-sep-26',1,'2026-09-04','ACH Credit — Payroll Clearing',215300,'ACH-2026-090002','4200-PAYRL','credit'),
  makeTx('t5-gl-03','run-sep-26',1,'2026-09-07','Vendor Payment — Clearpath Systems',8100,'VND-2026-090003','5100-VEND'),
  makeTx('t5-gl-04','run-sep-26',1,'2026-09-10','Wire Transfer — Sovereign Assets',155000,'WT-2026-090004','4100-WIRE'),
  makeTx('t5-gl-05','run-sep-26',1,'2026-09-15','ACH Debit — Insurance Premium',4680,'ACH-2026-090005','5200-INS'),
  makeTx('t5-gl-06','run-sep-26',1,'2026-09-18','Service Fee — CoreBanking Platform',1250,'SVC-2026-090006','6100-FEES'),
  makeTx('t5-gl-07','run-sep-26',1,'2026-09-22','Wire Transfer — Nexus Holdings Ltd',68000,'WT-2026-090007','4100-WIRE'),
  makeTx('t5-gl-08','run-sep-26',1,'2026-09-25','Check Payment — Office Lease',12500,'CHK-2026-090008','5300-RENT'),
];

// September 2026 — Bank
const SEP_BANK: Transaction[] = [
  makeTx('t6-bk-01','run-sep-26',2,'2026-09-02','WIRE CREDIT MERIDIAN CAP',35000,'WT-2026-090001','','credit'),
  makeTx('t6-bk-02','run-sep-26',2,'2026-09-04','ACH CREDIT PAYROLL CLEARING',215300,'ACH-2026-090002','','credit'),
  makeTx('t6-bk-03','run-sep-26',2,'2026-09-07','VENDOR PMT CLEARPATH SYSTEMS',8100,'VND-2026-090003',''),
  makeTx('t6-bk-04','run-sep-26',2,'2026-09-10','WIRE DEBIT SOVEREIGN ASSETS',155000,'WT-2026-090004',''),
  makeTx('t6-bk-05','run-sep-26',2,'2026-09-15','ACH DEBIT INSURANCE PREM',4680,'ACH-2026-090005',''),
  makeTx('t6-bk-06','run-sep-26',2,'2026-09-18','SVC FEE COREBANKING',1250,'SVC-2026-090006',''),
  makeTx('t6-bk-07','run-sep-26',2,'2026-09-22','WIRE DEBIT NEXUS HOLDINGS',68000,'WT-2026-090007',''),
  makeTx('t6-bk-08','run-sep-26',2,'2026-09-25','CHK PMT OFFICE LEASE',12500,'CHK-2026-090008',''),
];

// ─── Match Pairs ──────────────────────────────────────────────────────────────

function makeMatch(
  id: string,
  runId: string,
  tx1: Transaction,
  tx2: Transaction,
  matchType: MatchPair['matchType'],
  confidence: number,
  status: MatchPair['status'] = 'auto-matched'
): MatchPair {
  return { id, runId, tx1, tx2, matchType, confidence, status };
}

export const NOV_MATCHES: MatchPair[] = [
  makeMatch('m-nov-01','run-nov-26', NOV_GL[0], NOV_BANK[0], 'exact', 100),
  makeMatch('m-nov-02','run-nov-26', NOV_GL[1], NOV_BANK[1], 'exact', 100),
  makeMatch('m-nov-03','run-nov-26', NOV_GL[2], NOV_BANK[2], 'exact', 100),
  makeMatch('m-nov-04','run-nov-26', NOV_GL[3], NOV_BANK[3], 'exact', 100),
  makeMatch('m-nov-05','run-nov-26', NOV_GL[4], NOV_BANK[4], 'exact', 100),
  makeMatch('m-nov-06','run-nov-26', NOV_GL[5], NOV_BANK[5], 'exact', 100),
  makeMatch('m-nov-07','run-nov-26', NOV_GL[6], NOV_BANK[6], 'exact', 100),
  makeMatch('m-nov-08','run-nov-26', NOV_GL[7], NOV_BANK[7], 'exact', 100),
  makeMatch('m-nov-09','run-nov-26', NOV_GL[8], NOV_BANK[8], 'exact', 100),
  makeMatch('m-nov-10','run-nov-26', NOV_GL[9], NOV_BANK[9], 'exact', 100),
  makeMatch('m-nov-11','run-nov-26', NOV_GL[10], NOV_BANK[10], 'exact', 100),
  makeMatch('m-nov-12','run-nov-26', NOV_GL[11], NOV_BANK[11], 'exact', 100),
  makeMatch('m-nov-13','run-nov-26', NOV_GL[12], NOV_BANK[12], 'exact', 100),
  makeMatch('m-nov-14','run-nov-26', NOV_GL[13], NOV_BANK[13], 'exact', 100),
  makeMatch('m-nov-15','run-nov-26', NOV_GL[14], NOV_BANK[14], 'exact', 100),
  makeMatch('m-nov-16','run-nov-26', NOV_GL[15], NOV_BANK[15], 'exact', 100),
  makeMatch('m-nov-17','run-nov-26', NOV_GL[16], NOV_BANK[16], 'exact', 100),
  makeMatch('m-nov-18','run-nov-26', NOV_GL[17], NOV_BANK[17], 'exact', 100),
  makeMatch('m-nov-19','run-nov-26', NOV_GL[18], NOV_BANK[18], 'exact', 100),
  makeMatch('m-nov-20','run-nov-26', NOV_GL[19], NOV_BANK[19], 'exact', 100),
  makeMatch('m-nov-exc','run-nov-26', NOV_GL[20], NOV_BANK[20], 'amount-match', 72, 'disputed'),
];

export const OCT_MATCHES: MatchPair[] = [
  makeMatch('m-oct-01','run-oct-26', OCT_GL[0], OCT_BANK[0], 'exact', 100, 'confirmed'),
  makeMatch('m-oct-02','run-oct-26', OCT_GL[1], OCT_BANK[1], 'exact', 100, 'confirmed'),
  makeMatch('m-oct-03','run-oct-26', OCT_GL[2], OCT_BANK[2], 'exact', 100, 'confirmed'),
  makeMatch('m-oct-04','run-oct-26', OCT_GL[3], OCT_BANK[3], 'exact', 100, 'confirmed'),
  makeMatch('m-oct-05','run-oct-26', OCT_GL[4], OCT_BANK[4], 'exact', 100, 'confirmed'),
  makeMatch('m-oct-06','run-oct-26', OCT_GL[5], OCT_BANK[5], 'exact', 100, 'confirmed'),
  makeMatch('m-oct-07','run-oct-26', OCT_GL[6], OCT_BANK[6], 'exact', 100, 'confirmed'),
  makeMatch('m-oct-08','run-oct-26', OCT_GL[7], OCT_BANK[7], 'exact', 100, 'confirmed'),
  makeMatch('m-oct-09','run-oct-26', OCT_GL[8], OCT_BANK[8], 'exact', 100, 'confirmed'),
  makeMatch('m-oct-exc','run-oct-26', OCT_GL[9], OCT_BANK[9], 'fuzzy', 88, 'confirmed'),
];

export const SEP_MATCHES: MatchPair[] = SEP_GL.map((gl, i) =>
  makeMatch(`m-sep-${String(i + 1).padStart(2, '0')}`, 'run-sep-26', gl, SEP_BANK[i], 'exact', 100, 'confirmed')
);

// ─── Seed Exceptions ──────────────────────────────────────────────────────────

export const SEED_EXCEPTIONS: Exception[] = [
  {
    id: 'exc-nov-01',
    runId: 'run-nov-26',
    runName: 'November 2026 — GL vs Bank',
    type: 'amount-mismatch',
    tx1: NOV_GL[20],
    tx2: NOV_BANK[20],
    amountDiff: 160,
    status: 'open',
    priority: 'high',
    assignee: 'Henry M.',
    notes: '',
    createdAt: '2026-11-21T08:00:00Z',
  },
  {
    id: 'exc-nov-02',
    runId: 'run-nov-26',
    runName: 'November 2026 — GL vs Bank',
    type: 'unmatched-gl',
    tx1: NOV_GL[21],
    amountDiff: 9800,
    status: 'investigating',
    priority: 'medium',
    assignee: 'Sarah K.',
    notes: 'Vendor confirmed payment processed. Awaiting bank confirmation.',
    createdAt: '2026-11-22T09:15:00Z',
  },
  {
    id: 'exc-nov-03',
    runId: 'run-nov-26',
    runName: 'November 2026 — GL vs Bank',
    type: 'unmatched-bank',
    tx2: NOV_BANK[21],
    amountDiff: 22100,
    status: 'open',
    priority: 'high',
    assignee: 'Henry M.',
    notes: '',
    createdAt: '2026-11-23T10:30:00Z',
  },
  {
    id: 'exc-nov-04',
    runId: 'run-nov-26',
    runName: 'November 2026 — GL vs Bank',
    type: 'timing-difference',
    tx1: NOV_GL[22],
    amountDiff: 18750,
    status: 'open',
    priority: 'low',
    assignee: undefined,
    notes: '',
    createdAt: '2026-11-22T11:00:00Z',
  },
  {
    id: 'exc-oct-01',
    runId: 'run-oct-26',
    runName: 'October 2026 — GL vs Bank',
    type: 'timing-difference',
    tx1: OCT_GL[9],
    tx2: OCT_BANK[9],
    amountDiff: 0,
    status: 'resolved',
    priority: 'low',
    assignee: 'Sarah K.',
    notes: 'Bank posted one day after GL entry. Normal cut-off timing.',
    createdAt: '2026-10-29T08:00:00Z',
    resolvedAt: '2026-10-30T14:22:00Z',
    resolvedBy: 'Sarah K.',
    resolution: 'Timing difference confirmed. Acceptable under policy.',
  },
  {
    id: 'exc-sep-01',
    runId: 'run-sep-26',
    runName: 'September 2026 — GL vs Bank',
    type: 'amount-mismatch',
    tx1: SEP_GL[2],
    tx2: SEP_BANK[2],
    amountDiff: 15,
    status: 'waived',
    priority: 'low',
    assignee: 'Henry M.',
    notes: 'Bank fee rounding difference. Under threshold.',
    createdAt: '2026-09-08T09:00:00Z',
    resolvedAt: '2026-09-09T11:00:00Z',
    resolvedBy: 'Henry M.',
    resolution: 'Waived — rounding variance under $50 threshold.',
  },
];

// ─── Seed Runs ────────────────────────────────────────────────────────────────

export const SEED_RUNS: ReconRun[] = [
  {
    id: 'run-nov-26',
    name: 'November 2026 — GL vs Bank',
    period: 'November 2026',
    source1Name: 'General Ledger (Nov 2026)',
    source2Name: 'Bank Statement (Nov 2026)',
    status: 'review',
    createdAt: '2026-11-24T07:00:00Z',
    createdBy: 'Henry M.',
    matchedCount: 20,
    exceptionCount: 4,
    resolvedExceptions: 0,
    totalSource1: 23,
    totalSource2: 22,
    totalAmount1: 1497010,
    totalAmount2: 1496850,
    matchRate: 86.96,
  },
  {
    id: 'run-oct-26',
    name: 'October 2026 — GL vs Bank',
    period: 'October 2026',
    source1Name: 'General Ledger (Oct 2026)',
    source2Name: 'Bank Statement (Oct 2026)',
    status: 'approved',
    createdAt: '2026-11-01T08:00:00Z',
    completedAt: '2026-11-01T10:14:00Z',
    createdBy: 'Henry M.',
    matchedCount: 9,
    exceptionCount: 1,
    resolvedExceptions: 1,
    totalSource1: 10,
    totalSource2: 10,
    totalAmount1: 512030,
    totalAmount2: 512030,
    matchRate: 90,
  },
  {
    id: 'run-sep-26',
    name: 'September 2026 — GL vs Bank',
    period: 'September 2026',
    source1Name: 'General Ledger (Sep 2026)',
    source2Name: 'Bank Statement (Sep 2026)',
    status: 'approved',
    createdAt: '2026-10-02T09:00:00Z',
    completedAt: '2026-10-02T11:30:00Z',
    createdBy: 'Sarah K.',
    matchedCount: 8,
    exceptionCount: 1,
    resolvedExceptions: 1,
    totalSource1: 8,
    totalSource2: 8,
    totalAmount1: 499830,
    totalAmount2: 499815,
    matchRate: 100,
  },
];

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const SEED_AUDIT: AuditEntry[] = [
  { id: 'aud-01', runId: 'run-nov-26', timestamp: '2026-11-24T07:00:00Z', user: 'Henry M.', action: 'Run Created', detail: 'November 2026 reconciliation run initiated.' },
  { id: 'aud-02', runId: 'run-nov-26', timestamp: '2026-11-24T07:01:30Z', user: 'System', action: 'Sources Imported', detail: 'GL: 23 records ($1,497,010.00). Bank: 22 records ($1,496,850.00).' },
  { id: 'aud-03', runId: 'run-nov-26', timestamp: '2026-11-24T07:02:00Z', user: 'System', action: 'Matching Complete', detail: '20 pairs matched (86.9% match rate). 4 exceptions raised.' },
  { id: 'aud-04', runId: 'run-nov-26', exceptionId: 'exc-nov-02', timestamp: '2026-11-24T09:15:00Z', user: 'Henry M.', action: 'Exception Assigned', detail: 'EXC-NOV-02 assigned to Sarah K. for investigation.' },
  { id: 'aud-05', runId: 'run-oct-26', timestamp: '2026-11-01T08:00:00Z', user: 'Henry M.', action: 'Run Created', detail: 'October 2026 reconciliation run initiated.' },
  { id: 'aud-06', runId: 'run-oct-26', timestamp: '2026-11-01T08:01:00Z', user: 'System', action: 'Matching Complete', detail: '9 pairs matched (90.0% match rate). 1 exception raised.' },
  { id: 'aud-07', runId: 'run-oct-26', exceptionId: 'exc-oct-01', timestamp: '2026-10-30T14:22:00Z', user: 'Sarah K.', action: 'Exception Resolved', detail: 'Timing difference confirmed as acceptable.' },
  { id: 'aud-08', runId: 'run-oct-26', timestamp: '2026-11-01T10:14:00Z', user: 'Henry M.', action: 'Run Approved', detail: 'October 2026 reconciliation approved and closed.' },
];

// ─── Transactions index ───────────────────────────────────────────────────────

export const ALL_TRANSACTIONS: Transaction[] = [
  ...NOV_GL, ...NOV_BANK,
  ...OCT_GL, ...OCT_BANK,
  ...SEP_GL, ...SEP_BANK,
];

export function getTransactionsByRun(runId: string): { gl: Transaction[]; bank: Transaction[] } {
  const all = ALL_TRANSACTIONS.filter(t => t.runId === runId);
  return {
    gl: all.filter(t => t.source === 1),
    bank: all.filter(t => t.source === 2),
  };
}

export function getMatchesByRun(runId: string): MatchPair[] {
  if (runId === 'run-nov-26') return NOV_MATCHES;
  if (runId === 'run-oct-26') return OCT_MATCHES;
  if (runId === 'run-sep-26') return SEP_MATCHES;
  return [];
}
