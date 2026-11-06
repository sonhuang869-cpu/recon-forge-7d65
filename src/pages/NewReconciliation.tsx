import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Database,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { createRun } from '../lib/api';
import { toast } from 'sonner';
import { formatPct } from '../lib/utils';

type Step = 'configure' | 'processing' | 'results';

interface NewRunForm {
  name: string;
  period: string;
  source1Name: string;
  source2Name: string;
  useDemo: boolean;
}

const PERIODS = [
  'November 2026', 'October 2026', 'September 2026',
  'August 2026', 'July 2026', 'June 2026',
];

const PROCESSING_STEPS = [
  { key: 'parse1', label: 'Parsing Source 1 (General Ledger)...' },
  { key: 'parse2', label: 'Parsing Source 2 (Bank Statement)...' },
  { key: 'normalize', label: 'Normalising and validating records...' },
  { key: 'match', label: 'Running exact-match engine...' },
  { key: 'fuzzy', label: 'Running fuzzy-match engine (reference, description)...' },
  { key: 'exceptions', label: 'Identifying and classifying exceptions...' },
  { key: 'report', label: 'Generating reconciliation report...' },
];

export default function NewReconciliation() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('configure');
  const [form, setForm] = useState<NewRunForm>({
    name: '',
    period: 'November 2026',
    source1Name: 'General Ledger (GL)',
    source2Name: 'Bank Statement',
    useDemo: true,
  });
  const [errors, setErrors] = useState<Partial<NewRunForm>>({});
  const [processingIdx, setProcessingIdx] = useState(-1);
  const [result, setResult] = useState<{ id: string; matchRate: number; matched: number; exceptions: number } | null>(null);
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  function validate(): boolean {
    const e: Partial<NewRunForm> = {};
    if (!form.name.trim()) e.name = 'Run name is required' as never;
    if (!form.period) e.period = 'Period is required' as never;
    if (!form.source1Name.trim()) e.source1Name = 'Source name is required' as never;
    if (!form.source2Name.trim()) e.source2Name = 'Source name is required' as never;
    if (!form.useDemo && !file1) { /* handled in UI */ }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleStart() {
    if (!validate()) return;

    setStep('processing');
    setProcessingIdx(0);

    // Simulate step-by-step processing
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setProcessingIdx(i);
      await new Promise(r => setTimeout(r, 350 + Math.random() * 250));
    }

    try {
      const run = await createRun(
        form.name || `${form.period} Reconciliation`,
        form.period,
        form.source1Name,
        form.source2Name
      );
      setResult({
        id: run.id,
        matchRate: run.matchRate,
        matched: run.matchedCount,
        exceptions: run.exceptionCount,
      });
      setStep('results');
    } catch {
      toast.error('Failed to create reconciliation run.');
      setStep('configure');
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/reconciliations')}
          className="rf-btn-ghost text-sm mb-3 -ml-2"
        >
          <ArrowLeft size={15} />
          Back to Reconciliations
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">New Reconciliation Run</h1>
        <p className="text-sm text-slate-500 mt-0.5">Import two data sources and run the automated matching engine.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(['configure', 'processing', 'results'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 text-xs font-medium ${
              step === s ? 'text-forge-700' :
              (step === 'processing' && i < 1) || (step === 'results' && i < 2) ? 'text-forge-500' :
              'text-slate-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s ? 'bg-forge-600 text-white' :
                (step === 'processing' && i < 1) || (step === 'results' && i < 2) ? 'bg-forge-200 text-forge-700' :
                'bg-slate-200 text-slate-500'
              }`}>
                {((step === 'processing' && i < 1) || (step === 'results' && i < 2))
                  ? <CheckCircle2 size={14} />
                  : i + 1
                }
              </div>
              <span className="hidden sm:inline capitalize">{s === 'configure' ? 'Configure' : s === 'processing' ? 'Processing' : 'Review'}</span>
            </div>
            {i < 2 && <div className={`flex-1 h-px w-8 ${i < ['configure','processing','results'].indexOf(step) ? 'bg-forge-400' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Configure ── */}
      {step === 'configure' && (
        <div className="rf-card p-5 sm:p-6 space-y-5">
          {/* Run name */}
          <div>
            <label className="rf-label">Run Name</label>
            <input
              type="text"
              className="rf-input"
              placeholder="e.g. November 2026 — GL vs Bank"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{String(errors.name)}</p>}
          </div>

          {/* Period */}
          <div>
            <label className="rf-label">Reconciliation Period</label>
            <select
              className="rf-select"
              value={form.period}
              onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
            >
              {PERIODS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <hr className="border-slate-200" />

          {/* Data source toggle */}
          <div>
            <label className="rf-label">Data Sources</label>
            <div className="flex gap-3">
              <button
                onClick={() => setForm(f => ({ ...f, useDemo: true }))}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium text-left transition-colors ${
                  form.useDemo
                    ? 'border-forge-500 bg-forge-50 text-forge-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Database size={16} className="mb-1" />
                <div>Use Demo Data</div>
                <div className="text-xs font-normal text-slate-400 mt-0.5">Pre-loaded sample GL & bank records</div>
              </button>
              <button
                onClick={() => setForm(f => ({ ...f, useDemo: false }))}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium text-left transition-colors ${
                  !form.useDemo
                    ? 'border-forge-500 bg-forge-50 text-forge-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Upload size={16} className="mb-1" />
                <div>Upload CSV Files</div>
                <div className="text-xs font-normal text-slate-400 mt-0.5">Import your own data files</div>
              </button>
            </div>
          </div>

          {/* Source names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="rf-label">Source 1 Label</label>
              <input
                type="text"
                className="rf-input"
                value={form.source1Name}
                onChange={e => setForm(f => ({ ...f, source1Name: e.target.value }))}
              />
            </div>
            <div>
              <label className="rf-label">Source 2 Label</label>
              <input
                type="text"
                className="rf-input"
                value={form.source2Name}
                onChange={e => setForm(f => ({ ...f, source2Name: e.target.value }))}
              />
            </div>
          </div>

          {/* File uploads (shown when useDemo=false) */}
          {!form.useDemo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: form.source1Name || 'Source 1', key: 'file1' as const },
                { label: form.source2Name || 'Source 2', key: 'file2' as const },
              ].map(({ label, key }) => {
                const file = key === 'file1' ? file1 : file2;
                const setFile = key === 'file1' ? setFile1 : setFile2;
                return (
                  <div key={key}>
                    <label className="rf-label">{label} (CSV)</label>
                    <label className={`flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      file ? 'border-forge-400 bg-forge-50' : 'border-slate-300 hover:border-slate-400'
                    }`}>
                      <input
                        type="file"
                        accept=".csv,.xlsx"
                        className="sr-only"
                        onChange={e => setFile(e.target.files?.[0] ?? null)}
                      />
                      {file ? (
                        <>
                          <FileText size={20} className="text-forge-600" />
                          <span className="text-xs text-forge-700 font-medium text-center truncate max-w-full">{file.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload size={20} className="text-slate-400" />
                          <span className="text-xs text-slate-500">Drop CSV or click to browse</span>
                        </>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={handleStart} className="rf-btn-primary">
              Run Matching Engine
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Processing ── */}
      {step === 'processing' && (
        <div className="rf-card p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-forge-50 flex items-center justify-center mx-auto mb-5">
            <RefreshCw size={28} className="text-forge-600 animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Running Reconciliation Engine</h2>
          <p className="text-sm text-slate-500 mb-8">Please wait while transactions are matched and exceptions are classified.</p>

          <div className="text-left space-y-2 max-w-sm mx-auto">
            {PROCESSING_STEPS.map((s, i) => (
              <div key={s.key} className={`flex items-center gap-3 text-sm transition-all ${
                i < processingIdx ? 'text-forge-600' :
                i === processingIdx ? 'text-slate-800 font-medium' :
                'text-slate-400'
              }`}>
                {i < processingIdx ? (
                  <CheckCircle2 size={16} className="text-forge-500 flex-shrink-0" />
                ) : i === processingIdx ? (
                  <Loader2 size={16} className="text-forge-600 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0" />
                )}
                {s.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 3: Results ── */}
      {step === 'results' && result && (
        <div className="space-y-4 animate-fade-in">
          <div className="rf-card p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-forge-100 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-forge-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Matching Complete</h2>
                <p className="text-xs text-slate-500">Review results and manage any exceptions below.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-forge-700 tabular-nums">{formatPct(result.matchRate)}</div>
                <div className="text-xs text-slate-500 mt-1">Match Rate</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 tabular-nums">{result.matched}</div>
                <div className="text-xs text-slate-500 mt-1">Matched Pairs</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className={`text-2xl font-bold tabular-nums ${result.exceptions > 0 ? 'text-amber-600' : 'text-forge-600'}`}>
                  {result.exceptions}
                </div>
                <div className="text-xs text-slate-500 mt-1">Exceptions</div>
              </div>
            </div>

            {result.exceptions > 0 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                <span>
                  {result.exceptions} exception{result.exceptions > 1 ? 's' : ''} require{result.exceptions === 1 ? 's' : ''} review before this reconciliation can be approved.
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => navigate('/reconciliations')}
              className="rf-btn-secondary"
            >
              Back to List
            </button>
            <button
              onClick={() => navigate(`/reconciliations/${result.id}`)}
              className="rf-btn-primary"
            >
              Review Run
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
