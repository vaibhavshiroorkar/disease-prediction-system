import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-extrabold gradient-text select-none">404</h1>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Page not found
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Looks like you've wandered off the beaten path. The page you're looking for
          doesn't exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="h-4 w-4" /> Back to Home
          </Link>
          <Link to="/symptoms" className="btn-secondary inline-flex items-center gap-2">
            <Search className="h-4 w-4" /> Check Symptoms
          </Link>
        </div>

        <div className="mt-12 p-4 bg-primary-50 rounded-xl border border-primary-100 max-w-sm mx-auto">
          <p className="text-sm text-primary-700">
            <strong>Did you know?</strong> Your heart beats about 100,000 times a day.
            While you're here, why not check your heart health?
          </p>
        </div>
      </div>
    </div>
  );
}
