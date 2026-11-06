import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ThumbsUp,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { getRun, getRunTransactions, getRunMatches, getExceptions, approveRun } from '../lib/api';
import type { ReconRun, Transaction, MatchPair, Exception } from '../types';
import { formatCurrency, formatDate, formatPct, formatDateTime } from '../lib/utils';
import { RunStatusBadge, ExcStatusBadge, ExcTypeBadge, PriorityBadge } from '../components/ui/StatusBadge';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { toast } from 'sonner';

type Tab = 'overview' | 'matches' | 'exceptions';

export default function ReconcileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<ReconRun | null>(null);
  const [gl, setGl] = useState<Transaction[]>([]);
  const [bank, setBank] = useState<Transaction[]>([]);
  const [matches, setMatches] = useState<MatchPair[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getRun(id),
      getRunTransactions(id),
      getRunMatches(id),
      getExceptions(id),
    ]).then(([r, { gl, bank }, m, e]) => {
      if (!r) { navigate('/reconciliations'); return; }
      setRun(r);
      setGl(gl);
      setBank(bank);
      setMatches(m);
      setExceptions(e);
      setLoading(false);
    });
  }, [id]);

  async function handleApprove() {
    if (!run) return;
    setApproving(true);
    try {
      const updated = await approveRun(run.id);
      setRun(updated);
      toast.success('Reconciliation approved successfully.');
    } catch {
      toast.error('Failed to approve reconciliation.');
    } finally {
      setApproving(false);
    }
  }

  if (loading) return <PageLoader />;
  if (!run) return null;

  const openExceptions = exceptions.filter(e => e.status === 'open' || e.status === 'investigating').length;
  const canApprove = run.status === 'review';

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'matches', label: 'Matched Pairs', count: matches.length },
    { key: 'exceptions', label: 'Exceptions', count: exceptions.length },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/reconciliations')}
          className="rf-btn-ghost text-sm mb-3 -ml-2"
        >
          <ArrowLeft size={15} />
          Reconciliations
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{run.name}</h1>
              <RunStatusBadge status={run.status} />
            </div>
            <div className="text-sm text-slate-500">
              Created {formatDateTime(run.createdAt)} · by {run.createdBy}
              {run.completedAt && ` · Completed ${formatDate(run.completedAt)}`}
            </div>
          </div>
          {canApprove && (
            <button
              onClick={handleApprove}
              disabled={approving || openExceptions > 0}
              className="rf-btn-primary flex-shrink-0"
              title={openExceptions > 0 ? 'Resolve all exceptions before approving' : ''}
            >
              {approving ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <ThumbsUp size={15} />
              )}
              <span className="hidden sm:inline">Approve Run</span>
              <span className="sm:hidden">Approve</span>
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rf-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Match Rate</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{formatPct(run.matchRate)}</div>
          <div className="confidence-bar mt-2">
            <div
              className={`confidence-bar-fill ${run.matchRate >= 95 ? 'bg-forge-500' : run.matchRate >= 85 ? 'bg-amber-400' : 'bg-red-400'}`}
              style={{ width: `${run.matchRate}%` }}
            />
          </div>
        </div>
        <div className="rf-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Matched Pairs</div>
          <div className="text-2xl font-bold text-forge-700 tabular-nums">{run.matchedCount}</div>
          <div className="text-xs text-slate-400 mt-1">of {run.totalSource1} GL items</div>
        </div>
        <div className="rf-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Open Exceptions</div>
          <div className={`text-2xl font-bold tabular-nums ${openExceptions > 0 ? 'text-red-600' : 'text-forge-600'}`}>
            {openExceptions}
          </div>
          <div className="text-xs text-slate-400 mt-1">{run.resolvedExceptions} resolved</div>
        </div>
        <div className="rf-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">GL vs Bank Variance</div>
          <div className={`text-2xl font-bold tabular-nums ${Math.abs(run.totalAmount1 - run.totalAmount2) > 0 ? 'text-amber-600' : 'text-forge-600'} amount-mono text-xl`}>
            {run.totalAmount1 === run.totalAmount2
              ? 'Nil'
              : formatCurrency(Math.abs(run.totalAmount1 - run.totalAmount2))}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            GL: {formatCurrency(run.totalAmount1)}
          </div>
        </div>
      </div>

      {/* Approve banner */}
      {canApprove && openExceptions === 0 && (
        <div className="flex items-center gap-3 p-4 bg-forge-50 border border-forge-200 rounded-lg text-sm text-forge-800">
          <CheckCircle2 size={16} className="text-forge-600 flex-shrink-0" />
          <span>All exceptions resolved. This reconciliation is ready for approval.</span>
          <button onClick={handleApprove} disabled={approving} className="ml-auto rf-btn-primary py-1.5 px-3 text-xs">
            Approve Now
          </button>
        </div>
      )}

      {openExceptions > 0 && run.status === 'review' && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
          <span>{openExceptions} open exception{openExceptions > 1 ? 's' : ''} must be resolved before this run can be approved.</span>
          <button onClick={() => setTab('exceptions')} className="ml-auto text-xs font-medium text-amber-700 underline">
            View Exceptions
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.key
                  ? 'border-forge-600 text-forge-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {t.label}
              {t.count != null && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-forge-100 text-forge-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Overview ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Source 1 */}
          <div className="rf-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h3 className="text-sm font-semibold text-slate-700">{run.source1Name}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Records</span>
                <span className="font-semibold tabular-nums">{run.totalSource1}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-semibold amount-mono">{formatCurrency(run.totalAmount1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Matched</span>
                <span className="font-semibold text-forge-700 tabular-nums">{run.matchedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Unmatched</span>
                <span className="font-semibold text-amber-600 tabular-nums">
                  {run.totalSource1 - run.matchedCount}
                </span>
              </div>
            </div>
          </div>

          {/* Source 2 */}
          <div className="rf-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-slate-400"></div>
              <h3 className="text-sm font-semibold text-slate-700">{run.source2Name}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Records</span>
                <span className="font-semibold tabular-nums">{run.totalSource2}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-semibold amount-mono">{formatCurrency(run.totalAmount2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Matched</span>
                <span className="font-semibold text-forge-700 tabular-nums">{run.matchedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Unmatched</span>
                <span className="font-semibold text-amber-600 tabular-nums">
                  {run.totalSource2 - run.matchedCount}
                </span>
              </div>
            </div>
          </div>

          {/* Exception breakdown */}
          <div className="sm:col-span-2 rf-card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Exception Breakdown</h3>
            {exceptions.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400">
                <CheckCircle2 size={24} className="mx-auto text-forge-400 mb-2" />
                No exceptions in this run.
              </div>
            ) : (
              <div className="table-scroll">
                <table className="rf-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Amount Diff</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {exceptions.map(exc => (
                      <tr key={exc.id}>
                        <td className="font-mono text-xs text-slate-500">{exc.id.toUpperCase()}</td>
                        <td><ExcTypeBadge type={exc.type} /></td>
                        <td className="max-w-[200px] truncate">
                          {exc.tx1?.description ?? exc.tx2?.description ?? '—'}
                        </td>
                        <td className="amount-mono">
                          {exc.amountDiff != null && exc.amountDiff > 0
                            ? formatCurrency(exc.amountDiff)
                            : '—'}
                        </td>
                        <td><PriorityBadge priority={exc.priority} /></td>
                        <td><ExcStatusBadge status={exc.status} /></td>
                        <td>
                          <Link
                            to="/exceptions"
                            className="text-forge-600 hover:text-forge-700"
                            aria-label="Manage exception"
                          >
                            <ArrowRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Matches ── */}
      {tab === 'matches' && (
        <div className="rf-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Matched Transaction Pairs</h3>
            <span className="text-xs text-slate-400">{matches.length} pairs</span>
          </div>
          {matches.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">No matched pairs available.</div>
          ) : (
            <div className="table-scroll">
              <table className="rf-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="bg-blue-50/50">GL Description</th>
                    <th className="bg-blue-50/50">GL Amount</th>
                    <th className="bg-slate-50">Bank Description</th>
                    <th className="bg-slate-50">Bank Amount</th>
                    <th>Match Type</th>
                    <th>Confidence</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map(m => (
                    <tr key={m.id} className={m.status === 'disputed' ? 'bg-amber-50/40' : ''}>
                      <td className="text-xs text-slate-500">{formatDate(m.tx1.date)}</td>
                      <td className="bg-blue-50/30 max-w-[160px] truncate font-medium text-slate-800">
                        {m.tx1.description}
                      </td>
                      <td className="bg-blue-50/30 amount-mono">
                        {formatCurrency(m.tx1.amount)}
                      </td>
                      <td className="bg-slate-50/60 max-w-[160px] truncate text-slate-600">
                        {m.tx2.description}
                      </td>
                      <td className="bg-slate-50/60 amount-mono">
                        {formatCurrency(m.tx2.amount)}
                      </td>
                      <td>
                        <span className={`rf-badge text-[10px] ${
                          m.matchType === 'exact' ? 'bg-forge-100 text-forge-700' :
                          m.matchType === 'amount-match' ? 'bg-blue-100 text-blue-700' :
                          m.matchType === 'fuzzy' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {m.matchType === 'exact' ? 'Exact' :
                           m.matchType === 'amount-match' ? 'Amount' :
                           m.matchType === 'fuzzy' ? 'Fuzzy' : 'Reference'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className="confidence-bar w-12">
                            <div
                              className={`confidence-bar-fill ${m.confidence === 100 ? 'bg-forge-500' : m.confidence >= 80 ? 'bg-amber-400' : 'bg-red-400'}`}
                              style={{ width: `${m.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-slate-500">{m.confidence}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`rf-badge text-[10px] ${
                          m.status === 'confirmed' ? 'bg-forge-100 text-forge-700' :
                          m.status === 'disputed' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {m.status === 'auto-matched' ? 'Auto' : m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Exceptions ── */}
      {tab === 'exceptions' && (
        <div className="rf-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Exceptions</h3>
            <Link to="/exceptions" className="text-xs text-forge-600 hover:text-forge-700 flex items-center gap-1 font-medium">
              Manage all <ArrowRight size={12} />
            </Link>
          </div>
          {exceptions.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle2 size={28} className="mx-auto text-forge-400 mb-2" />
              <p className="text-sm text-slate-500">No exceptions in this run.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {exceptions.map(exc => (
                <div key={exc.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-slate-500">{exc.id.toUpperCase()}</span>
                      <ExcTypeBadge type={exc.type} />
                      <PriorityBadge priority={exc.priority} />
                      <ExcStatusBadge status={exc.status} />
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 flex items-center gap-1">
                      <Clock size={11} />
                      {formatDate(exc.createdAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {exc.tx1 && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-[10px] font-semibold uppercase text-blue-500 mb-1">GL Entry</div>
                        <div className="font-medium text-slate-800">{exc.tx1.description}</div>
                        <div className="text-slate-500 mt-1 font-mono">{exc.tx1.reference}</div>
                        <div className="font-bold amount-mono text-slate-800 mt-1">{formatCurrency(exc.tx1.amount)}</div>
                      </div>
                    )}
                    {exc.tx2 ? (
                      <div className="bg-slate-100 rounded-lg p-3">
                        <div className="text-[10px] font-semibold uppercase text-slate-500 mb-1">Bank Entry</div>
                        <div className="font-medium text-slate-800">{exc.tx2.description}</div>
                        <div className="text-slate-500 mt-1 font-mono">{exc.tx2.reference || '—'}</div>
                        <div className="font-bold amount-mono text-slate-800 mt-1">{formatCurrency(exc.tx2.amount)}</div>
                      </div>
                    ) : (
                      <div className="bg-slate-100 rounded-lg p-3 flex items-center justify-center text-slate-400 text-xs">
                        No matching bank entry found
                      </div>
                    )}
                  </div>

                  {exc.amountDiff != null && exc.amountDiff > 0 && (
                    <div className="mt-2 text-xs font-medium text-amber-700">
                      Variance: {formatCurrency(exc.amountDiff)}
                    </div>
                  )}

                  {exc.notes && (
                    <div className="mt-2 text-xs text-slate-600 italic">{exc.notes}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
