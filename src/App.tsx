import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Reconciliations from './pages/Reconciliations';
import NewReconciliation from './pages/NewReconciliation';
import ReconcileDetail from './pages/ReconcileDetail';
import Exceptions from './pages/Exceptions';
import AuditLog from './pages/AuditLog';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="reconciliations" element={<Reconciliations />} />
          <Route path="reconciliations/new" element={<NewReconciliation />} />
          <Route path="reconciliations/:id" element={<ReconcileDetail />} />
          <Route path="exceptions" element={<Exceptions />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
