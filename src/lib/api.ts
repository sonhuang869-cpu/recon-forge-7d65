import {
  SEED_RUNS,
  SEED_EXCEPTIONS,
  SEED_AUDIT,
  getTransactionsByRun,
  getMatchesByRun,
} from './data';
import type { ReconRun, Exception, ExceptionStatus, AuditEntry, MatchPair, Transaction } from '../types';
import { sleep } from './utils';

const RUNS_KEY = 'rf_runs';
const EXCEPTIONS_KEY = 'rf_exceptions';
const AUDIT_KEY = 'rf_audit';

function loadRuns(): ReconRun[] {
  try {
    const raw = localStorage.getItem(RUNS_KEY);
    return raw ? (JSON.parse(raw) as ReconRun[]) : SEED_RUNS;
  } catch {
    return SEED_RUNS;
  }
}

function saveRuns(runs: ReconRun[]): void {
  try { localStorage.setItem(RUNS_KEY, JSON.stringify(runs)); } catch { /* noop */ }
}

function loadExceptions(): Exception[] {
  try {
    const raw = localStorage.getItem(EXCEPTIONS_KEY);
    return raw ? (JSON.parse(raw) as Exception[]) : SEED_EXCEPTIONS;
  } catch {
    return SEED_EXCEPTIONS;
  }
}

function saveExceptions(exceptions: Exception[]): void {
  try { localStorage.setItem(EXCEPTIONS_KEY, JSON.stringify(exceptions)); } catch { /* noop */ }
}

function loadAudit(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : SEED_AUDIT;
  } catch {
    return SEED_AUDIT;
  }
}

function saveAudit(entries: AuditEntry[]): void {
  try { localStorage.setItem(AUDIT_KEY, JSON.stringify(entries)); } catch { /* noop */ }
}

function appendAudit(entry: Omit<AuditEntry, 'id'>): void {
  const entries = loadAudit();
  const id = `aud-${Date.now()}`;
  saveAudit([{ id, ...entry }, ...entries]);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getRuns(): Promise<ReconRun[]> {
  await sleep(120);
  return loadRuns();
}

export async function getRun(id: string): Promise<ReconRun | undefined> {
  await sleep(80);
  return loadRuns().find(r => r.id === id);
}

export async function getRunTransactions(runId: string): Promise<{ gl: Transaction[]; bank: Transaction[] }> {
  await sleep(100);
  return getTransactionsByRun(runId);
}

export async function getRunMatches(runId: string): Promise<MatchPair[]> {
  await sleep(100);
  return getMatchesByRun(runId);
}

export async function getExceptions(runId?: string): Promise<Exception[]> {
  await sleep(100);
  const all = loadExceptions();
  return runId ? all.filter(e => e.runId === runId) : all;
}

export async function updateExceptionStatus(
  id: string,
  status: ExceptionStatus,
  resolution?: string,
  user = 'Henry M.'
): Promise<Exception> {
  const exceptions = loadExceptions();
  const idx = exceptions.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('Exception not found');

  const updated: Exception = {
    ...exceptions[idx],
    status,
    resolution: resolution ?? exceptions[idx].resolution,
    resolvedAt: status === 'resolved' || status === 'waived' ? new Date().toISOString() : undefined,
    resolvedBy: status === 'resolved' || status === 'waived' ? user : undefined,
  };
  exceptions[idx] = updated;
  saveExceptions(exceptions);

  appendAudit({
    runId: updated.runId,
    exceptionId: updated.id,
    timestamp: new Date().toISOString(),
    user,
    action: `Exception ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    detail: resolution ?? `Status changed to ${status}.`,
  });

  // Sync run exception counts
  syncRunExceptionCount(updated.runId);

  return updated;
}

export async function assignException(
  id: string,
  assignee: string,
  user = 'Henry M.'
): Promise<Exception> {
  const exceptions = loadExceptions();
  const idx = exceptions.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('Exception not found');
  exceptions[idx] = { ...exceptions[idx], assignee };
  saveExceptions(exceptions);
  appendAudit({
    runId: exceptions[idx].runId,
    exceptionId: id,
    timestamp: new Date().toISOString(),
    user,
    action: 'Exception Assigned',
    detail: `Assigned to ${assignee}.`,
  });
  return exceptions[idx];
}

export async function addExceptionNote(
  id: string,
  notes: string,
  user = 'Henry M.'
): Promise<Exception> {
  const exceptions = loadExceptions();
  const idx = exceptions.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('Exception not found');
  exceptions[idx] = { ...exceptions[idx], notes };
  saveExceptions(exceptions);
  appendAudit({
    runId: exceptions[idx].runId,
    exceptionId: id,
    timestamp: new Date().toISOString(),
    user,
    action: 'Note Added',
    detail: notes,
  });
  return exceptions[idx];
}

export async function approveRun(id: string, user = 'Henry M.'): Promise<ReconRun> {
  const runs = loadRuns();
  const idx = runs.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Run not found');
  runs[idx] = { ...runs[idx], status: 'approved', completedAt: new Date().toISOString() };
  saveRuns(runs);
  appendAudit({
    runId: id,
    timestamp: new Date().toISOString(),
    user,
    action: 'Run Approved',
    detail: `Reconciliation approved and closed by ${user}.`,
  });
  return runs[idx];
}

export async function createRun(
  name: string,
  period: string,
  source1Name: string,
  source2Name: string,
  user = 'Henry M.'
): Promise<ReconRun> {
  await sleep(2000); // simulate processing

  const id = `run-${Date.now()}`;
  const matched = Math.floor(Math.random() * 15) + 25;
  const exceptions = Math.floor(Math.random() * 3) + 1;
  const total = matched + exceptions;
  const amount = parseFloat((Math.random() * 800000 + 400000).toFixed(2));

  const run: ReconRun = {
    id,
    name,
    period,
    source1Name,
    source2Name,
    status: 'review',
    createdAt: new Date().toISOString(),
    createdBy: user,
    matchedCount: matched,
    exceptionCount: exceptions,
    resolvedExceptions: 0,
    totalSource1: total,
    totalSource2: total + Math.floor(Math.random() * 2),
    totalAmount1: amount,
    totalAmount2: parseFloat((amount - Math.random() * 500).toFixed(2)),
    matchRate: parseFloat(((matched / (matched + exceptions)) * 100).toFixed(1)),
  };

  const runs = loadRuns();
  saveRuns([run, ...runs]);

  appendAudit({
    runId: id,
    timestamp: new Date().toISOString(),
    user,
    action: 'Run Created',
    detail: `${name} initiated by ${user}.`,
  });
  appendAudit({
    runId: id,
    timestamp: new Date().toISOString(),
    user: 'System',
    action: 'Matching Complete',
    detail: `${matched} pairs matched (${run.matchRate}% match rate). ${exceptions} exception(s) raised.`,
  });

  return run;
}

export async function getAuditLog(runId?: string): Promise<AuditEntry[]> {
  await sleep(80);
  const all = loadAudit();
  return runId ? all.filter(e => e.runId === runId) : all;
}

export function resetDemoData(): void {
  localStorage.removeItem(RUNS_KEY);
  localStorage.removeItem(EXCEPTIONS_KEY);
  localStorage.removeItem(AUDIT_KEY);
}

function syncRunExceptionCount(runId: string): void {
  const runs = loadRuns();
  const exceptions = loadExceptions();
  const idx = runs.findIndex(r => r.id === runId);
  if (idx === -1) return;
  const runExceptions = exceptions.filter(e => e.runId === runId);
  const resolved = runExceptions.filter(e => e.status === 'resolved' || e.status === 'waived').length;
  runs[idx] = { ...runs[idx], resolvedExceptions: resolved };
  saveRuns(runs);
}
