export interface ReconRun {
  id: string;
  name: string;
  period: string;
  source1Name: string;
  source2Name: string;
  status: 'processing' | 'review' | 'approved' | 'draft';
  createdAt: string;
  completedAt?: string;
  createdBy: string;
  matchedCount: number;
  exceptionCount: number;
  resolvedExceptions: number;
  totalSource1: number;
  totalSource2: number;
  totalAmount1: number;
  totalAmount2: number;
  matchRate: number;
}

export interface Transaction {
  id: string;
  runId: string;
  source: 1 | 2;
  date: string;
  description: string;
  amount: number;
  reference: string;
  accountCode: string;
  currency: string;
  type: 'debit' | 'credit';
}

export type MatchType = 'exact' | 'amount-match' | 'reference-match' | 'fuzzy';
export type MatchStatus = 'auto-matched' | 'confirmed' | 'disputed';

export interface MatchPair {
  id: string;
  runId: string;
  tx1: Transaction;
  tx2: Transaction;
  matchType: MatchType;
  confidence: number;
  status: MatchStatus;
}

export type ExceptionType =
  | 'unmatched-gl'
  | 'unmatched-bank'
  | 'amount-mismatch'
  | 'duplicate'
  | 'timing-difference';

export type ExceptionStatus = 'open' | 'investigating' | 'resolved' | 'waived';
export type ExceptionPriority = 'high' | 'medium' | 'low';

export interface Exception {
  id: string;
  runId: string;
  runName: string;
  type: ExceptionType;
  tx1?: Transaction;
  tx2?: Transaction;
  amountDiff?: number;
  status: ExceptionStatus;
  priority: ExceptionPriority;
  assignee?: string;
  notes?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

export interface AuditEntry {
  id: string;
  runId: string;
  exceptionId?: string;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
}
