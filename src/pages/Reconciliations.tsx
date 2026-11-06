import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  ArrowRight,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { getRuns } from '../lib/api';
import type { ReconRun } from '../types';
import { formatCurrency, formatDate, formatPct, formatDateTime } from '../lib/utils';
import { RunStatusBadge } from '../components/ui/StatusBadge';
import { PageLoader } from '../components/ui/LoadingSpinner';

export default function Reconciliations() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<ReconRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    getRuns().then(r => { setRuns(r); setLoading(false); });
  }, []);

  const filtered = runs.filter(r => {
    const matchSearch = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.period.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <PageLoader />;

  const statusCounts = {
    all: runs.length,
    review: runs.filter(r => r.status === 'review').length,
    approved: runs.filter(r => r.status === 'approved').length,
    processing: runs.filter(r => r.status === 'processing').length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Reconciliations</h1>
          <p className="text-sm text-slate-500 mt-0.5">Import, match, and approve reconciliation runs.</p>
        </div>
        <button
          onClick={() => navigate('/reconciliations/new')}
          className="rf-btn-primary flex-shrink-0"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">New Run</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit flex-wrap">
        {(['all', 'review', 'approved', 'processing'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {s === 'all' ? 'All' : s === 'review' ? 'Needs Review' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 text-slate-400">{statusCounts[s as keyof typeof statusCounts]}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search period or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rf-input pl-9"
        />
      </div>

      {/* Runs grid */}
      {filtered.length === 0 ? (
        <div className="rf-card py-16 text-center">
          <RefreshCw size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">
            {runs.length === 0 ? 'No reconciliation runs yet.' : 'No runs match your filters.'}
          </p>
          {runs.length === 0 && (
            <button
              onClick={() => navigate('/reconciliations/new')}
              className="rf-btn-primary mt-4 mx-auto"
            >
              <Plus size={15} /> Create First Run
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(run => {
            const openExceptions = run.exceptionCount - run.resolvedExceptions;
            return (
              <div
                key={run.id}
                className="rf-card hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(`/reconciliations/${run.id}`)}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold text-slate-900">{run.name}</h3>
                        <RunStatusBadge status={run.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(run.createdAt)}
                        </span>
                        <span>by {run.createdBy}</span>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-slate-300 group-hover:text-forge-600 transition-colors flex-shrink-0 mt-1"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {/* Match rate */}
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Match Rate</div>
                      <div className="flex items-center gap-2">
                        <div className="confidence-bar flex-1">
                          <div
                            className={`confidence-bar-fill ${run.matchRate >= 95 ? 'bg-forge-500' : run.matchRate >= 85 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${run.matchRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold tabular-nums text-slate-800">
                          {formatPct(run.matchRate)}
                        </span>
                      </div>
                    </div>

                    {/* Matched pairs */}
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Matched Pairs</div>
                      <div className="text-sm font-semibold text-slate-800 tabular-nums">
                        {run.matchedCount}
                        <span className="text-xs font-normal text-slate-400"> / {run.totalSource1}</span>
                      </div>
                    </div>

                    {/* Exceptions */}
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Exceptions</div>
                      <div className={`text-sm font-semibold tabular-nums ${openExceptions > 0 ? 'text-red-600' : 'text-forge-600'}`}>
                        {openExceptions > 0 ? (
                          <span className="flex items-center gap-1">
                            <AlertCircle size={12} />
                            {openExceptions} open
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            All resolved
                          </span>
                        )}
                      </div>
                    </div>

                    {/* GL total */}
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">GL Total</div>
                      <div className="amount-mono text-sm font-semibold text-slate-800">
                        {formatCurrency(run.totalAmount1)}
                      </div>
                    </div>
                  </div>

                  {/* Source labels */}
                  <div className="mt-3 flex gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                      {run.source1Name}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
                      {run.source2Name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
