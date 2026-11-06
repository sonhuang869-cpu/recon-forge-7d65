import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
        <AlertCircle size={28} className="text-slate-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="rf-btn-primary">
        <ArrowLeft size={15} />
        Return to Dashboard
      </Link>
    </div>
  );
}
