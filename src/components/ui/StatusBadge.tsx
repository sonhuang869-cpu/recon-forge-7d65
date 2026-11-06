import { cn } from '../../lib/utils';
import type { ExceptionStatus, ExceptionPriority, ExceptionType } from '../../types';

type RunStatus = 'processing' | 'review' | 'approved' | 'draft';

const RUN_STATUS: Record<RunStatus, { label: string; classes: string }> = {
  processing: { label: 'Processing', classes: 'bg-blue-100 text-blue-800' },
  review:     { label: 'Needs Review', classes: 'bg-amber-100 text-amber-800' },
  approved:   { label: 'Approved', classes: 'bg-forge-100 text-forge-800' },
  draft:      { label: 'Draft', classes: 'bg-slate-100 text-slate-600' },
};

const EXC_STATUS: Record<ExceptionStatus, { label: string; classes: string }> = {
  open:          { label: 'Open', classes: 'bg-red-100 text-red-800' },
  investigating: { label: 'Investigating', classes: 'bg-amber-100 text-amber-800' },
  resolved:      { label: 'Resolved', classes: 'bg-forge-100 text-forge-800' },
  waived:        { label: 'Waived', classes: 'bg-slate-100 text-slate-600' },
};

const PRIORITY: Record<ExceptionPriority, { label: string; classes: string }> = {
  high:   { label: 'High', classes: 'bg-red-50 text-red-700 border border-red-200' },
  medium: { label: 'Medium', classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
  low:    { label: 'Low', classes: 'bg-slate-50 text-slate-600 border border-slate-200' },
};

const EXC_TYPE: Record<ExceptionType, string> = {
  'unmatched-gl':    'Unmatched GL',
  'unmatched-bank':  'Unmatched Bank',
  'amount-mismatch': 'Amount Mismatch',
  'duplicate':       'Duplicate',
  'timing-difference': 'Timing Difference',
};

export function RunStatusBadge({ status }: { status: RunStatus }) {
  const { label, classes } = RUN_STATUS[status];
  return <span className={cn('rf-badge', classes)}>{label}</span>;
}

export function ExcStatusBadge({ status }: { status: ExceptionStatus }) {
  const { label, classes } = EXC_STATUS[status];
  return <span className={cn('rf-badge', classes)}>{label}</span>;
}

export function PriorityBadge({ priority }: { priority: ExceptionPriority }) {
  const { label, classes } = PRIORITY[priority];
  return <span className={cn('rf-badge text-[10px]', classes)}>{label}</span>;
}

export function ExcTypeBadge({ type }: { type: ExceptionType }) {
  const label = EXC_TYPE[type];
  const classes =
    type === 'amount-mismatch' ? 'bg-orange-100 text-orange-800' :
    type === 'duplicate'       ? 'bg-purple-100 text-purple-800' :
    type === 'timing-difference' ? 'bg-sky-100 text-sky-800' :
    type === 'unmatched-gl'    ? 'bg-red-100 text-red-700' :
                                  'bg-indigo-100 text-indigo-800';
  return <span className={cn('rf-badge', classes)}>{label}</span>;
}
