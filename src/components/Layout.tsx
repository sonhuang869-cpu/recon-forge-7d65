import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  RefreshCw,
  AlertTriangle,
  ScrollText,
  Menu,
  X,
  Plus,
  ChevronRight,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { resetDemoData } from '../lib/api';
import { toast } from 'sonner';

const NAV = [
  { to: '/',               label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/reconciliations',label: 'Reconciliations',  icon: RefreshCw },
  { to: '/exceptions',     label: 'Exceptions',       icon: AlertTriangle },
  { to: '/audit',          label: 'Audit Log',        icon: ScrollText },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  function handleReset() {
    resetDemoData();
    toast.success('Demo data has been reset.');
    window.location.reload();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-slate-900 text-slate-100 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-forge-600 flex items-center justify-center flex-shrink-0">
              <RefreshCw size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-[15px]">ReconForge</span>
              <div className="text-[10px] text-slate-500 leading-none mt-0.5">Enterprise Edition</div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick action */}
        <div className="px-4 py-3">
          <button
            onClick={() => { navigate('/reconciliations/new'); setMobileOpen(false); }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-forge-600 hover:bg-forge-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={15} />
            New Reconciliation
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-forge-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  {label}
                  {isActive && <ChevronRight size={14} className="ml-auto text-slate-500" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 px-4 py-3 space-y-1">
          <button
            onClick={handleReset}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <Settings size={13} />
            Reset Demo Data
          </button>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-forge-700 flex items-center justify-center text-xs font-bold text-forge-200 flex-shrink-0">
              HM
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-300 truncate">Henry M.</div>
              <div className="text-[10px] text-slate-500 truncate">Senior Fin. Operations</div>
            </div>
            <LogOut size={13} className="text-slate-600 flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile only) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-forge-600 flex items-center justify-center">
              <RefreshCw size={12} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">ReconForge</span>
          </div>
          <button
            onClick={() => navigate('/reconciliations/new')}
            className="ml-auto p-1.5 rounded-md bg-forge-600 text-white hover:bg-forge-700"
            aria-label="New reconciliation"
          >
            <Plus size={16} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
