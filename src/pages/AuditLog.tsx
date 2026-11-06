import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ScrollText, ArrowRight } from 'lucide-react';
import { getAuditLog } from '../lib/api';
import type { AuditEntry } from '../types';
import { formatDateTime } from '../lib/utils';
import { PageLoader } from '../components/ui/LoadingSpinner';

const RUN_LABEL: Record<string, string> = {
  'run-nov-26': 'Nov 2026',
  'run-oct-26': 'Oct 2026',
  'run-sep-26': 'Sep 2026',
};

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAuditLog().then(e => {
      setEntries(e);
      setLoading(false);
    });
  }, []);

  const filtered = entries.filter(e => {
    if (!search) return true;
    return (
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.detail.toLowerCase().includes(search.toLowerCase()) ||
      e.user.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) return <PageLoader />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Audit Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Complete audit trail of all reconciliation actions.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search actions, users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rf-input pl-9 text-xs py-1.5"
        />
      </div>

      <div className="rf-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ScrollText size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No audit entries found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(entry => (
              <div key={entry.id} className="flex items-start gap-4 px-4 sm:px-5 py-3.5 hover:bg-slate-50 transition-colors">
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1 flex-shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    entry.action.includes('Approved') ? 'bg-forge-500' :
                    entry.action.includes('Resolved') || entry.action.includes('Waived') ? 'bg-forge-400' :
                    entry.action.includes('Created') ? 'bg-blue-500' :
                    entry.action.includes('Exception') ? 'bg-amber-400' :
                    'bg-slate-300'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-900">{entry.action}</span>
                      {entry.exceptionId && (
                        <span className="ml-2 text-[10px] font-mono text-slate-400">
                          {entry.exceptionId.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 flex-shrink-0 font-mono">
                      {formatDateTime(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{entry.detail}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-400">{entry.user}</span>
                    <Link
                      to={`/reconciliations/${entry.runId}`}
                      className="text-[10px] text-forge-600 hover:text-forge-700 flex items-center gap-0.5"
                    >
                      {RUN_LABEL[entry.runId] ?? entry.runId}
                      <ArrowRight size={9} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
