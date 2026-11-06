import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { getRuns, getExceptions } from '../lib/api';
import type { ReconRun, Exception } from '../types';
import { formatCurrency, formatDate, formatPct, formatDateTime } from '../lib/utils';
import { RunStatusBadge, ExcStatusBadge, PriorityBadge } from '../components/ui/StatusBadge';
import { PageLoader } from '../components/ui/LoadingSpinner';

interface KPI {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<ReconRun[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRuns(), getExceptions()]).then(([r, e]) => {
      setRuns(r);
      setExceptions(e);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageLoader />;

  const totalRuns = runs.length;
  const approvedRuns = runs.filter(r => r.status === 'approved').length;
  const reviewRuns = runs.filter(r => r.status === 'review').length;
  const openExceptions = exceptions.filter(e => e.status === 'open' || e.status === 'investigating').length;
  const avgMatchRate = runs.length
    ? runs.reduce((s, r) => s + r.matchRate, 0) / runs.length
    : 0;

  const kpis: KPI[] = [
    {
      label: 'Reconciliation Runs',
      value: String(totalRuns),
      sub: `${approvedRuns} approved · ${reviewRuns} in review`,
      icon: <RefreshCw size={18} />,
      accent: 'bg-forge-50 text-forge-700',
    },
    {
      label: 'Avg. Match Rate',
      value: formatPct(avgMatchRate),
      sub: 'Across all periods',
      icon: <TrendingUp size={18} />,
      accent: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Open Exceptions',
      value: String(openExceptions),
      sub: `${exceptions.filter(e => e.priority === 'high' && (e.status === 'open' || e.status === 'investigating')).length} high priority`,
      icon: <AlertTriangle size={18} />,
      accent: openExceptions > 0 ? 'bg-red-50 text-red-600' : 'bg-forge-50 text-forge-700',
    },
    {
      label: 'Resolved (All Time)',
      value: String(exceptions.filter(e => e.status === 'resolved' || e.status === 'waived').length),
      sub: 'Exceptions closed',
      icon: <CheckCircle2 size={18} />,
      accent: 'bg-forge-50 text-forge-700',
    },
  ];

  const recentRuns = [...runs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);

  const recentExceptions = [...exceptions]
    .filter(e => e.status === 'open' || e.status === 'investigating')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/reconciliations/new')}
          className="rf-btn-primary flex-shrink-0 hidden sm:flex"
        >
          <Plus size={15} />
          New Reconciliation
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rf-card p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight">
                {kpi.label}
              </p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${kpi.accent}`}>
                {kpi.icon}
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{kpi.value}</div>
            <div className="text-xs text-slate-500 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-column lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Recent Runs — takes 3/5 */}
        <div className="lg:col-span-3 rf-card flex flex-col">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Recent Reconciliation Runs</h2>
            <Link to="/reconciliations" className="text-xs text-forge-600 hover:text-forge-700 flex items-center gap-1 font-medium">
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div className="flex-1">
            {recentRuns.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No reconciliation runs yet.</div>
            ) : (
              <div className="table-scroll">
                <table className="rf-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th className="hidden sm:table-cell">Match Rate</th>
                      <th className="hidden sm:table-cell">Exceptions</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRuns.map(run => (
                      <tr key={run.id}>
                        <td>
                          <div className="font-medium text-slate-800 text-sm truncate max-w-[160px]">{run.period}</div>
                          <div className="text-xs text-slate-400">{formatDate(run.createdAt)}</div>
                        </td>
                        <td className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="confidence-bar w-20">
                              <div
                                className={`confidence-bar-fill ${run.matchRate >= 95 ? 'bg-forge-500' : run.matchRate >= 85 ? 'bg-amber-400' : 'bg-red-400'}`}
                                style={{ width: `${run.matchRate}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium tabular-nums">{formatPct(run.matchRate)}</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell">
                          <span className={`text-sm font-medium tabular-nums ${run.exceptionCount - run.resolvedExceptions > 0 ? 'text-red-600' : 'text-forge-600'}`}>
                            {run.exceptionCount - run.resolvedExceptions} open
                          </span>
                          <span className="text-xs text-slate-400 ml-1">/ {run.exceptionCount}</span>
                        </td>
                        <td><RunStatusBadge status={run.status} /></td>
                        <td>
                          <Link
                            to={`/reconciliations/${run.id}`}
                            className="text-forge-600 hover:text-forge-700"
                            aria-label={`View ${run.name}`}
                          >
                            <ArrowRight size={15} />
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

        {/* Open Exceptions — takes 2/5 */}
        <div className="lg:col-span-2 rf-card flex flex-col">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Open Exceptions</h2>
            <Link to="/exceptions" className="text-xs text-forge-600 hover:text-forge-700 flex items-center gap-1 font-medium">
              Manage <ChevronRight size={13} />
            </Link>
          </div>
          <div className="flex-1 divide-y divide-slate-100">
            {recentExceptions.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 size={32} className="mx-auto text-forge-400 mb-2" />
                <p className="text-sm text-slate-500">All exceptions resolved</p>
              </div>
            ) : (
              recentExceptions.map(exc => (
                <Link
                  key={exc.id}
                  to="/exceptions"
                  className="flex items-start gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${exc.priority === 'high' ? 'bg-red-500' : exc.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-500">{exc.id.toUpperCase()}</span>
                      <PriorityBadge priority={exc.priority} />
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5 truncate">
                      {exc.tx1?.description ?? exc.tx2?.description ?? 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <ExcStatusBadge status={exc.status} />
                      {exc.amountDiff != null && exc.amountDiff > 0 && (
                        <span className="text-xs text-slate-500">
                          {formatCurrency(exc.amountDiff)} diff
                        </span>
                      )}
                    </div>
                  </div>
                  <Clock size={12} className="text-slate-300 flex-shrink-0 mt-1" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Period summary strip */}
      <div className="rf-card overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Period Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="rf-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Source 1</th>
                <th>Source 2</th>
                <th>Matched</th>
                <th>Exceptions</th>
                <th>GL Total</th>
                <th>Bank Total</th>
                <th>Variance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(run => {
                const variance = run.totalAmount1 - run.totalAmount2;
                return (
                  <tr key={run.id}>
                    <td>
                      <Link to={`/reconciliations/${run.id}`} className="font-medium text-forge-700 hover:text-forge-800">
                        {run.period}
                      </Link>
                    </td>
                    <td className="text-slate-600 max-w-[140px] truncate">{run.source1Name}</td>
                    <td className="text-slate-600 max-w-[140px] truncate">{run.source2Name}</td>
                    <td>
                      <span className="text-sm font-semibold tabular-nums">{formatPct(run.matchRate)}</span>
                      <span className="text-xs text-slate-400 ml-1">({run.matchedCount}/{run.totalSource1})</span>
                    </td>
                    <td>
                      <span className={`font-medium tabular-nums ${run.exceptionCount - run.resolvedExceptions > 0 ? 'text-red-600' : 'text-forge-600'}`}>
                        {run.exceptionCount - run.resolvedExceptions}
                      </span>
                      {run.resolvedExceptions > 0 && (
                        <span className="text-xs text-slate-400 ml-1">({run.resolvedExceptions} resolved)</span>
                      )}
                    </td>
                    <td className="amount-mono">{formatCurrency(run.totalAmount1)}</td>
                    <td className="amount-mono">{formatCurrency(run.totalAmount2)}</td>
                    <td className={`amount-mono font-medium ${Math.abs(variance) > 0 ? 'text-red-600' : 'text-forge-600'}`}>
                      {variance === 0 ? '—' : (variance > 0 ? '+' : '') + formatCurrency(variance)}
                    </td>
                    <td><RunStatusBadge status={run.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
