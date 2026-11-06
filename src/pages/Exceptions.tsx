import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Save,
  User,
  MessageSquare,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { getExceptions, updateExceptionStatus, assignException, addExceptionNote } from '../lib/api';
import type { Exception, ExceptionStatus, ExceptionPriority, ExceptionType } from '../types';
import { formatCurrency, formatDate, formatDateTime } from '../lib/utils';
import {
  ExcStatusBadge,
  ExcTypeBadge,
  PriorityBadge,
} from '../components/ui/StatusBadge';
import { Dialog } from '../components/ui/Dialog';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { toast } from 'sonner';

const ASSIGNEES = ['Henry M.', 'Sarah K.', 'James O.', 'Priya N.', 'Unassigned'];

const STATUS_ACTIONS: Record<ExceptionStatus, { label: string; next: ExceptionStatus; classes: string }[]> = {
  open: [
    { label: 'Start Investigating', next: 'investigating', classes: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
    { label: 'Mark Resolved', next: 'resolved', classes: 'bg-forge-100 text-forge-700 hover:bg-forge-200' },
    { label: 'Waive', next: 'waived', classes: 'bg-slate-100 text-slate-600 hover:bg-slate-200' },
  ],
  investigating: [
    { label: 'Mark Resolved', next: 'resolved', classes: 'bg-forge-100 text-forge-700 hover:bg-forge-200' },
    { label: 'Waive', next: 'waived', classes: 'bg-slate-100 text-slate-600 hover:bg-slate-200' },
    { label: 'Reopen', next: 'open', classes: 'bg-red-100 text-red-700 hover:bg-red-200' },
  ],
  resolved: [
    { label: 'Reopen', next: 'open', classes: 'bg-red-100 text-red-700 hover:bg-red-200' },
  ],
  waived: [
    { label: 'Reopen', next: 'open', classes: 'bg-red-100 text-red-700 hover:bg-red-200' },
  ],
};

export default function Exceptions() {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('open,investigating');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Exception | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getExceptions().then(e => { setExceptions(e); setLoading(false); });
  }, []);

  const filtered = exceptions.filter(e => {
    const statuses = statusFilter === 'all' ? [] : statusFilter.split(',');
    const matchStatus = statusFilter === 'all' || statuses.includes(e.status);
    const matchPriority = priorityFilter === 'all' || e.priority === priorityFilter;
    const matchType = typeFilter === 'all' || e.type === typeFilter;
    const matchSearch = !search ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      (e.tx1?.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (e.tx2?.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
      e.runName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchType && matchSearch;
  });

  const counts = {
    open: exceptions.filter(e => e.status === 'open').length,
    investigating: exceptions.filter(e => e.status === 'investigating').length,
    resolved: exceptions.filter(e => e.status === 'resolved').length,
    waived: exceptions.filter(e => e.status === 'waived').length,
  };

  async function handleStatusChange(exc: Exception, next: ExceptionStatus) {
    if ((next === 'resolved' || next === 'waived') && !resolutionNote.trim()) {
      toast.error('Please add a resolution note before closing this exception.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateExceptionStatus(exc.id, next, resolutionNote || undefined);
      setExceptions(prev => prev.map(e => e.id === updated.id ? updated : e));
      setSelected(updated);
      setResolutionNote('');
      toast.success(`Exception ${next}.`);
    } catch {
      toast.error('Failed to update exception.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign(exc: Exception, assignee: string) {
    setSaving(true);
    try {
      const updated = await assignException(exc.id, assignee === 'Unassigned' ? '' : assignee);
      setExceptions(prev => prev.map(e => e.id === updated.id ? updated : e));
      setSelected(updated);
      toast.success(`Assigned to ${assignee}.`);
    } catch {
      toast.error('Failed to assign exception.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote(exc: Exception) {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      const updated = await addExceptionNote(exc.id, noteText);
      setExceptions(prev => prev.map(e => e.id === updated.id ? updated : e));
      setSelected(updated);
      setNoteText('');
      toast.success('Note saved.');
    } catch {
      toast.error('Failed to save note.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Exceptions</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Investigate and resolve reconciliation exceptions.
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Open', count: counts.open, color: 'bg-red-100 text-red-700', active: 'open,investigating' },
          { label: 'Investigating', count: counts.investigating, color: 'bg-amber-100 text-amber-700', active: 'investigating' },
          { label: 'Resolved', count: counts.resolved, color: 'bg-forge-100 text-forge-700', active: 'resolved' },
          { label: 'Waived', count: counts.waived, color: 'bg-slate-100 text-slate-600', active: 'waived' },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(s.active === statusFilter ? 'all' : s.active)}
            className={`rf-card p-3 text-center hover:shadow-md transition-shadow cursor-pointer ${
              statusFilter === s.active ? 'ring-2 ring-forge-500 ring-offset-1' : ''
            }`}
          >
            <div className={`text-lg sm:text-2xl font-bold tabular-nums ${s.color.split(' ')[1]}`}>
              {s.count}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search exceptions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rf-input pl-9 text-xs py-1.5"
          />
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`rf-btn-secondary text-xs py-1.5 ${showFilters ? 'bg-slate-100' : ''}`}
        >
          <Filter size={13} />
          Filters
          <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        {(priorityFilter !== 'all' || typeFilter !== 'all' || search) && (
          <button
            onClick={() => { setPriorityFilter('all'); setTypeFilter('all'); setSearch(''); }}
            className="rf-btn-ghost text-xs py-1.5 text-slate-500"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="flex gap-3 flex-wrap p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <label className="rf-label text-[10px]">Priority</label>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="rf-select text-xs py-1.5 w-auto"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="rf-label text-[10px]">Type</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="rf-select text-xs py-1.5 w-auto"
            >
              <option value="all">All Types</option>
              <option value="amount-mismatch">Amount Mismatch</option>
              <option value="unmatched-gl">Unmatched GL</option>
              <option value="unmatched-bank">Unmatched Bank</option>
              <option value="timing-difference">Timing Difference</option>
              <option value="duplicate">Duplicate</option>
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rf-card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {filtered.length} exception{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 size={32} className="mx-auto text-forge-400 mb-2" />
            <p className="text-sm text-slate-500">No exceptions match the current filters.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="rf-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Run</th>
                  <th>Type</th>
                  <th className="hidden md:table-cell">Description</th>
                  <th className="hidden sm:table-cell">Variance</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="hidden lg:table-cell">Assignee</th>
                  <th className="hidden sm:table-cell">Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(exc => (
                  <tr
                    key={exc.id}
                    onClick={() => { setSelected(exc); setResolutionNote(exc.resolution || ''); setNoteText(''); }}
                    className="cursor-pointer"
                  >
                    <td className="font-mono text-[11px] text-slate-500">{exc.id.toUpperCase().slice(0, 12)}</td>
                    <td>
                      <span className="text-xs text-slate-600 truncate block max-w-[100px]">
                        {exc.runName.replace('November 2026', 'Nov 26').replace('October 2026', 'Oct 26').replace('September 2026', 'Sep 26')}
                      </span>
                    </td>
                    <td><ExcTypeBadge type={exc.type} /></td>
                    <td className="hidden md:table-cell max-w-[180px] truncate text-slate-700">
                      {exc.tx1?.description ?? exc.tx2?.description ?? '—'}
                    </td>
                    <td className="hidden sm:table-cell amount-mono">
                      {exc.amountDiff != null && exc.amountDiff > 0
                        ? <span className="text-amber-700">{formatCurrency(exc.amountDiff)}</span>
                        : '—'}
                    </td>
                    <td><PriorityBadge priority={exc.priority} /></td>
                    <td><ExcStatusBadge status={exc.status} /></td>
                    <td className="hidden lg:table-cell text-xs text-slate-500">
                      {exc.assignee || '—'}
                    </td>
                    <td className="hidden sm:table-cell text-xs text-slate-400">
                      {formatDate(exc.createdAt)}
                    </td>
                    <td>
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(exc); setResolutionNote(exc.resolution || ''); setNoteText(''); }}
                        className="text-forge-600 hover:text-forge-700 p-1"
                        aria-label="Open exception"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Dialog ── */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.id.toUpperCase()} — Exception Detail` : ''}
        className="max-w-2xl"
      >
        {selected && (
          <div className="p-5 space-y-5">
            {/* Header badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <ExcTypeBadge type={selected.type} />
              <PriorityBadge priority={selected.priority} />
              <ExcStatusBadge status={selected.status} />
              <Link
                to={`/reconciliations/${selected.runId}`}
                className="text-xs text-forge-600 hover:text-forge-700 flex items-center gap-1 ml-auto"
              >
                View Run <ArrowRight size={11} />
              </Link>
            </div>

            <div className="text-xs text-slate-500">
              {selected.runName} · {formatDateTime(selected.createdAt)}
            </div>

            {/* Transaction pair */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selected.tx1 ? (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-[10px] font-semibold uppercase text-blue-500 mb-2">General Ledger</div>
                  <div className="text-sm font-semibold text-slate-900">{selected.tx1.description}</div>
                  <div className="text-xs text-slate-500 mt-1">{formatDate(selected.tx1.date)}</div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">{selected.tx1.reference}</div>
                  <div className="text-base font-bold amount-mono text-slate-900 mt-2">
                    {formatCurrency(selected.tx1.amount)}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/50 rounded-lg p-3 flex items-center justify-center text-xs text-slate-400 border border-dashed border-blue-200">
                  No GL entry
                </div>
              )}

              {selected.tx2 ? (
                <div className="bg-slate-100 rounded-lg p-3">
                  <div className="text-[10px] font-semibold uppercase text-slate-500 mb-2">Bank Statement</div>
                  <div className="text-sm font-semibold text-slate-900">{selected.tx2.description}</div>
                  <div className="text-xs text-slate-500 mt-1">{formatDate(selected.tx2.date)}</div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">{selected.tx2.reference || '—'}</div>
                  <div className="text-base font-bold amount-mono text-slate-900 mt-2">
                    {formatCurrency(selected.tx2.amount)}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100/50 rounded-lg p-3 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200">
                  No bank entry
                </div>
              )}
            </div>

            {selected.amountDiff != null && selected.amountDiff > 0 && (
              <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle size={14} className="text-amber-600" />
                <span className="text-amber-800 font-medium">
                  Variance: {formatCurrency(selected.amountDiff)}
                </span>
              </div>
            )}

            {/* Assign */}
            <div>
              <label className="rf-label flex items-center gap-1.5">
                <User size={11} /> Assignee
              </label>
              <div className="flex gap-2 flex-wrap">
                {ASSIGNEES.map(a => (
                  <button
                    key={a}
                    onClick={() => handleAssign(selected, a)}
                    disabled={saving}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selected.assignee === a || (a === 'Unassigned' && !selected.assignee)
                        ? 'bg-forge-600 text-white border-forge-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-forge-400'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="rf-label flex items-center gap-1.5">
                <MessageSquare size={11} /> Notes
              </label>
              {selected.notes && (
                <div className="mb-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-700 italic">
                  {selected.notes}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddNote(selected); }}
                  className="rf-input text-xs py-1.5 flex-1"
                />
                <button
                  onClick={() => handleAddNote(selected)}
                  disabled={saving || !noteText.trim()}
                  className="rf-btn-secondary text-xs py-1.5 px-3"
                >
                  <Save size={13} />
                </button>
              </div>
            </div>

            {/* Resolution note (required for resolve/waive) */}
            {(selected.status === 'open' || selected.status === 'investigating') && (
              <div>
                <label className="rf-label">Resolution Note <span className="text-slate-400 font-normal normal-case text-[10px]">(required to close)</span></label>
                <textarea
                  rows={2}
                  placeholder="Explain the resolution or reason for waiving..."
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                  className="rf-input resize-none text-xs"
                />
              </div>
            )}

            {selected.resolvedAt && (
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-forge-500" />
                {selected.status === 'waived' ? 'Waived' : 'Resolved'} by {selected.resolvedBy} on {formatDateTime(selected.resolvedAt)}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap pt-1 border-t border-slate-100">
              {STATUS_ACTIONS[selected.status]?.map(action => (
                <button
                  key={action.next}
                  onClick={() => handleStatusChange(selected, action.next)}
                  disabled={saving}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${action.classes}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
